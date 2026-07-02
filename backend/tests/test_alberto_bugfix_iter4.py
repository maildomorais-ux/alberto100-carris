"""Regression tests for iteration 4 bug fixes:
- Lagos & Lisbon photo URLs (Wikipedia)
- Uploads endpoint (no AI)
- Places PUT (admin edit works, no `date` field required)
- Entries listing shape
"""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://alberto-rails.preview.emergentagent.com").rstrip("/")

LAGOS_URL = "https://commons.wikimedia.org/wiki/Special:FilePath/Lagos_pedestrial_area%2C_Algarve%2C_Portugal.JPG"
LISBON_URL = "https://commons.wikimedia.org/wiki/Special:FilePath/Exterior_da_esta%C3%A7%C3%A3o_de_oriente.jpg"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": "alberto", "password": "lagos2026"}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# --- Entries seed / photos ---
class TestEntriesPhotos:
    def test_three_entries(self):
        r = requests.get(f"{BASE_URL}/api/entries", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 3, f"Expected 3 entries, got {len(data)}"

    def test_lagos_photo_is_wikipedia(self):
        data = requests.get(f"{BASE_URL}/api/entries", timeout=15).json()
        lagos = next(e for e in data if e["location"].startswith("Lagos"))
        assert LAGOS_URL in lagos["photos"], f"Lagos photo wrong: {lagos['photos']}"
        # Not Pisa (photo-1543429776)
        assert not any("1543429776" in p for p in lagos["photos"])

    def test_lisbon_photo_is_gare_oriente(self):
        data = requests.get(f"{BASE_URL}/api/entries", timeout=15).json()
        lisbon = next(e for e in data if e["location"].startswith("Lisboa"))
        assert LISBON_URL in lisbon["photos"], f"Lisbon photo wrong: {lisbon['photos']}"

    def test_lagos_photo_reachable(self):
        r = requests.get(LAGOS_URL, headers={"User-Agent": "Mozilla/5.0"}, allow_redirects=True, timeout=20)
        assert r.status_code == 200, f"Lagos URL not 200: {r.status_code}"
        assert r.headers.get("content-type", "").startswith("image/"), r.headers.get("content-type")

    def test_lisbon_photo_reachable(self):
        r = requests.get(LISBON_URL, headers={"User-Agent": "Mozilla/5.0"}, allow_redirects=True, timeout=20)
        assert r.status_code == 200, f"Lisbon URL not 200: {r.status_code}"
        assert r.headers.get("content-type", "").startswith("image/"), r.headers.get("content-type")

    def test_lisbon_distance_305(self):
        data = requests.get(f"{BASE_URL}/api/entries", timeout=15).json()
        lisbon = next(e for e in data if e["location"].startswith("Lisboa"))
        assert lisbon["distance_km"] == 305


# --- Places admin edit ---
class TestPlacesAdmin:
    def test_list_places(self):
        r = requests.get(f"{BASE_URL}/api/places", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) > 0

    def test_update_place_no_date_required(self, auth_headers):
        places = requests.get(f"{BASE_URL}/api/places", timeout=15).json()
        p = places[0]
        payload = {
            "country_code": p["country_code"],
            "city": p["city"],
            "order": p.get("order", 0),
            "description": "TEST_edit description",
            "experience": p.get("experience", ""),
            "photos": p.get("photos", []),
            "video_url": p.get("video_url"),
            "lat": p.get("lat"),
            "lng": p.get("lng"),
            "distance_km": p.get("distance_km", 0),
            "is_air_link": p.get("is_air_link", False),
        }
        r = requests.put(f"{BASE_URL}/api/places/{p['id']}", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["description"] == "TEST_edit description"

        # Verify via GET
        got = requests.get(f"{BASE_URL}/api/places/{p['id']}", timeout=15).json()
        assert got["description"] == "TEST_edit description"

        # cleanup: restore
        payload["description"] = p.get("description", "")
        requests.put(f"{BASE_URL}/api/places/{p['id']}", json=payload, headers=auth_headers, timeout=15)


# --- Uploads (no AI credits) ---
class TestUploads:
    def test_upload_image(self, auth_headers):
        png = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01"
            b"\x5b\x9b\xcbF\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        files = {"file": ("test_upload.png", io.BytesIO(png), "image/png")}
        r = requests.post(f"{BASE_URL}/api/upload", files=files, headers=auth_headers, timeout=20)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["kind"] == "image"
        assert body["url"].startswith("/api/uploads/")

        # Fetch the uploaded file back
        got = requests.get(f"{BASE_URL}{body['url']}", timeout=15)
        assert got.status_code == 200

    def test_upload_requires_auth(self):
        files = {"file": ("x.png", io.BytesIO(b"x"), "image/png")}
        r = requests.post(f"{BASE_URL}/api/upload", files=files, timeout=15)
        assert r.status_code in (401, 403)

    def test_upload_rejects_bad_ext(self, auth_headers):
        files = {"file": ("evil.exe", io.BytesIO(b"x"), "application/octet-stream")}
        r = requests.post(f"{BASE_URL}/api/upload", files=files, headers=auth_headers, timeout=15)
        assert r.status_code == 400


# --- Auth still works ---
class TestAuth:
    def test_login_ok(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": "alberto", "password": "lagos2026"}, timeout=15)
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_bad(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": "alberto", "password": "wrong"}, timeout=15)
        assert r.status_code == 401


# --- Entries create/delete flow ---
class TestEntriesCRUD:
    _created_id = None

    def test_create_entry(self, auth_headers):
        payload = {
            "title": "TEST_new_entry",
            "text": "TEST body",
            "location": "TEST_loc",
            "country_code": "PT",
            "date": "",
            "distance_km": 42,
            "weather": None,
            "photos": [],
        }
        r = requests.post(f"{BASE_URL}/api/entries", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["title"] == "TEST_new_entry"
        TestEntriesCRUD._created_id = body["id"]

    def test_delete_entry(self, auth_headers):
        if not TestEntriesCRUD._created_id:
            pytest.skip("no created entry")
        r = requests.delete(f"{BASE_URL}/api/entries/{TestEntriesCRUD._created_id}", headers=auth_headers, timeout=15)
        assert r.status_code == 204
        # Verify gone
        r2 = requests.get(f"{BASE_URL}/api/entries/{TestEntriesCRUD._created_id}", timeout=15)
        assert r2.status_code == 404
