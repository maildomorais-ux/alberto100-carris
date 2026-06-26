"""Backend tests for Alberto 100 Carris API."""
import os
import pytest
import requests

BASE_URL = "https://alberto-rails.preview.emergentagent.com"
API = BASE_URL.rstrip("/") + "/api"

ADMIN_USER = "alberto"
ADMIN_PASS = "lagos2026"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(session):
    r = session.post(f"{API}/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


# ---------- Health ----------
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    body = r.json()
    assert body.get("app") == "Alberto 100 Carris"


# ---------- Auth ----------
def test_login_success(session):
    r = session.post(f"{API}/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data and data["username"] == ADMIN_USER


def test_login_wrong_password(session):
    r = session.post(f"{API}/auth/login", json={"username": ADMIN_USER, "password": "WRONG"})
    assert r.status_code == 401


def test_me_requires_token(session):
    r = session.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_me_with_token(session, token):
    r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json().get("username") == ADMIN_USER


# ---------- Entries (public read) ----------
def test_list_entries_public(session):
    r = session.get(f"{API}/entries")
    assert r.status_code == 200
    entries = r.json()
    assert isinstance(entries, list)
    assert len(entries) >= 3, f"expected at least 3 seeded entries, got {len(entries)}"
    e = entries[0]
    for k in ("id", "title", "text", "location", "country_code", "date"):
        assert k in e


def test_get_entry_by_id(session):
    entries = session.get(f"{API}/entries").json()
    eid = entries[0]["id"]
    r = session.get(f"{API}/entries/{eid}")
    assert r.status_code == 200
    assert r.json()["id"] == eid


def test_get_entry_404(session):
    r = session.get(f"{API}/entries/nonexistent-id-xyz")
    assert r.status_code == 404


# ---------- Entries (protected write) ----------
def test_create_entry_without_token(session):
    payload = {
        "title": "TEST_no_auth", "text": "x", "location": "L",
        "country_code": "PT", "date": "2026-06-10",
    }
    r = session.post(f"{API}/entries", json=payload)
    assert r.status_code == 401


def test_full_crud_entry(session, token):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": "TEST_pytest_entry",
        "text": "Test entry created by pytest",
        "location": "Test City",
        "country_code": "FR",
        "date": "2026-07-15",
        "distance_km": 123.4,
        "weather": "Sunny",
        "photos": ["https://example.com/x.jpg"],
        "lat": 48.85,
        "lng": 2.35,
    }
    # CREATE
    r = session.post(f"{API}/entries", json=payload, headers=headers)
    assert r.status_code == 201, r.text
    created = r.json()
    assert created["title"] == payload["title"]
    eid = created["id"]

    # VERIFY GET
    r = session.get(f"{API}/entries/{eid}")
    assert r.status_code == 200
    assert r.json()["distance_km"] == 123.4

    # UPDATE
    upd = {**payload, "title": "TEST_pytest_entry_updated", "distance_km": 200.0}
    r = session.put(f"{API}/entries/{eid}", json=upd, headers=headers)
    assert r.status_code == 200
    assert r.json()["title"] == "TEST_pytest_entry_updated"

    # VERIFY GET after update
    r = session.get(f"{API}/entries/{eid}")
    assert r.json()["distance_km"] == 200.0

    # DELETE
    r = session.delete(f"{API}/entries/{eid}", headers=headers)
    assert r.status_code == 204

    # VERIFY DELETE
    r = session.get(f"{API}/entries/{eid}")
    assert r.status_code == 404


# ---------- Stats ----------
def test_stats(session):
    r = session.get(f"{API}/stats")
    assert r.status_code == 200
    data = r.json()
    for k in ("km_traveled", "days", "countries_visited", "cities_visited",
              "trains_used", "hours_traveling", "entries_count"):
        assert k in data
    assert data["entries_count"] >= 3
    assert data["countries_visited"] >= 1
