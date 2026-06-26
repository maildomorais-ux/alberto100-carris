"""Auth login regression — verify alberto/lagos2026 works, wrong password 401."""
import os
import pytest
import requests

BASE_URL = os.environ.get(
    "EXPO_BACKEND_URL",
    "https://alberto-rails.preview.emergentagent.com",
).rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


class TestAuthLogin:
    def test_login_success(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"username": "alberto", "password": "lagos2026"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data and data["access_token"]
        assert data.get("token_type") == "bearer"
        assert data.get("username") == "alberto"

    def test_login_wrong_password(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"username": "alberto", "password": "wrongpassword"})
        assert r.status_code == 401
        assert r.json().get("detail") == "Credenciais inválidas"

    def test_login_wrong_username(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"username": "ghost", "password": "lagos2026"})
        assert r.status_code == 401
        assert r.json().get("detail") == "Credenciais inválidas"

    def test_me_with_token(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"username": "alberto", "password": "lagos2026"})
        token = r.json()["access_token"]
        me = api.get(f"{BASE_URL}/api/auth/me",
                     headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200, me.text
        assert me.json().get("username") == "alberto"

    def test_me_without_token(self, api):
        r = api.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code in (401, 403)
