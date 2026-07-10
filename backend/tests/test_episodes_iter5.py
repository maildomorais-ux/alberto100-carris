"""Iter 5 regression tests: Episodes CRUD, public/all listing, protection, i18n & videos.tsx source checks."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://alberto-rails.preview.emergentagent.com").rstrip("/")
USER = "alberto"
PASS = "lagos2026"

EXPECTED_FIELDS = {
    "id", "number", "title_pt", "title_en", "subtitle_pt", "subtitle_en",
    "description_pt", "description_en", "country_code", "location", "date",
    "duration", "cover_photo", "video_url", "gallery", "lat", "lng",
    "status", "created_at", "updated_at",
}


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": USER, "password": PASS}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ----- Public GET /api/episodes returns 4 published, sorted -----
class TestPublicEpisodes:
    def test_list_published_returns_four_sorted(self):
        r = requests.get(f"{BASE_URL}/api/episodes", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # Only published
        assert all(e.get("status") == "published" for e in data)
        # Preserved 4 seed episodes present
        pub = [e for e in data if e.get("status") == "published"]
        assert len(pub) >= 4, f"expected at least 4 published, got {len(pub)}"
        # First 4 by number
        first_four = sorted(pub, key=lambda x: x["number"])[:4]
        numbers = [e["number"] for e in first_four]
        assert numbers == [1, 2, 3, 4], numbers
        # Ascending sort check
        nums = [e["number"] for e in pub]
        assert nums == sorted(nums), "episodes not in ascending order"

    def test_episode_titles_updated(self):
        r = requests.get(f"{BASE_URL}/api/episodes", timeout=30)
        data = r.json()
        by_num = {e["number"]: e for e in data if e.get("status") == "published"}
        assert by_num[1]["title_pt"] == "Episódio 01 — Lagos → Lisboa"
        assert by_num[2]["title_pt"] == "Episódio 02 — Lisboa → Madrid"
        # Preserved
        assert "Bósforo" in by_num[3]["title_pt"]
        assert "Transiberiano" in by_num[4]["title_pt"]

    def test_episode_fields_present(self):
        r = requests.get(f"{BASE_URL}/api/episodes", timeout=30)
        data = r.json()
        assert len(data) > 0
        keys = set(data[0].keys())
        missing = EXPECTED_FIELDS - keys
        assert not missing, f"missing fields: {missing}"
        # gallery is a list
        assert isinstance(data[0]["gallery"], list)

    def test_get_single_episode(self):
        r = requests.get(f"{BASE_URL}/api/episodes", timeout=30)
        eid = r.json()[0]["id"]
        r2 = requests.get(f"{BASE_URL}/api/episodes/{eid}", timeout=30)
        assert r2.status_code == 200
        assert r2.json()["id"] == eid

    def test_get_missing_episode_404(self):
        r = requests.get(f"{BASE_URL}/api/episodes/does-not-exist-xxxxx", timeout=30)
        assert r.status_code == 404


# ----- /api/episodes/all requires auth -----
class TestEpisodesAllAuth:
    def test_all_without_token_401(self):
        r = requests.get(f"{BASE_URL}/api/episodes/all", timeout=30)
        assert r.status_code in (401, 403)

    def test_all_with_token_returns_including_drafts(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/episodes/all", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 4


# ----- Protected POST/PUT/DELETE + draft filtering -----
class TestEpisodesCRUD:
    def test_post_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/episodes", json={"number": 99, "title_pt": "X", "title_en": "X"}, timeout=30)
        assert r.status_code in (401, 403)

    def test_full_crud_flow_and_draft_filter(self, auth_headers):
        # Baseline count
        pub_before = requests.get(f"{BASE_URL}/api/episodes", timeout=30).json()
        base_count = len(pub_before)

        # Create draft (server default status is 'draft' per review request — but model default is 'published'.
        # We explicitly send draft to verify filter.)
        payload = {
            "number": 999,
            "title_pt": "TEST_Episódio Draft",
            "title_en": "TEST_Episode Draft",
            "duration": "01:23",
            "status": "draft",
        }
        r = requests.post(f"{BASE_URL}/api/episodes", headers=auth_headers, json=payload, timeout=30)
        assert r.status_code == 201, r.text
        created = r.json()
        eid = created["id"]
        assert created["status"] == "draft"

        try:
            # Public list should NOT include the draft — count preserved
            pub_after = requests.get(f"{BASE_URL}/api/episodes", timeout=30).json()
            assert len(pub_after) == base_count, "draft leaked into public list"
            assert all(e["id"] != eid for e in pub_after)

            # /all should include it
            all_after = requests.get(f"{BASE_URL}/api/episodes/all", headers=auth_headers, timeout=30).json()
            assert any(e["id"] == eid for e in all_after)

            # PUT update
            upd = {**payload, "title_pt": "TEST_Episódio Updated", "status": "published", "duration": "05:00"}
            r2 = requests.put(f"{BASE_URL}/api/episodes/{eid}", headers=auth_headers, json=upd, timeout=30)
            assert r2.status_code == 200, r2.text
            u = r2.json()
            assert u["title_pt"] == "TEST_Episódio Updated"
            assert u["status"] == "published"
            assert u["duration"] == "05:00"

            # After publish it should appear in public list
            pub_pub = requests.get(f"{BASE_URL}/api/episodes", timeout=30).json()
            assert any(e["id"] == eid for e in pub_pub)
        finally:
            # DELETE (protected)
            r3 = requests.delete(f"{BASE_URL}/api/episodes/{eid}", headers=auth_headers, timeout=30)
            assert r3.status_code in (204, 200)
            # GET → 404
            r4 = requests.get(f"{BASE_URL}/api/episodes/{eid}", timeout=30)
            assert r4.status_code == 404

    def test_put_requires_auth(self):
        r = requests.put(f"{BASE_URL}/api/episodes/xyz", json={"number": 1, "title_pt": "", "title_en": ""}, timeout=30)
        assert r.status_code in (401, 403)

    def test_delete_requires_auth(self):
        r = requests.delete(f"{BASE_URL}/api/episodes/xyz", timeout=30)
        assert r.status_code in (401, 403)


# ----- Source-level i18n & videos.tsx sanity -----
class TestSourceLevel:
    def test_i18n_updated(self):
        p = "/app/frontend/src/i18n.ts"
        content = open(p, encoding="utf-8").read()
        assert "há muitos anos" in content
        assert "há grande parte da minha vida" not in content

    def test_videos_tsx_no_hardcoded_array(self):
        p = "/app/frontend/app/videos.tsx"
        content = open(p, encoding="utf-8").read()
        # No hard-coded EPISODES array
        assert "const EPISODES" not in content
        # Fetches from /api/episodes
        assert "/api/episodes" in content

    def test_admin_screens_exist(self):
        assert os.path.exists("/app/frontend/app/admin/episodes/index.tsx")
        assert os.path.exists("/app/frontend/app/admin/episodes/[id].tsx")
