"""
Regression tests for Alberto 100 Carris bug-fix iteration:
- Diary entries updated (new Lagos text, no Paris/Eiffel, no Hendaye entry)
- Places list still 23, with FR cities = [Hendaye, Lyon]
"""
import os
import re
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


# ---------- Entries ----------
class TestEntries:
    def test_entries_count_and_titles(self, api):
        r = api.get(f"{BASE_URL}/api/entries")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 3, f"expected 3 entries, got {len(data)}"
        titles = {e["title"] for e in data}
        assert "O primeiro carril — Lagos" in titles
        assert "Lisboa — fim da primeira etapa" in titles
        assert "Barcelona → Lyon, atravessar os Pirenéus" in titles

    def test_lagos_entry_content(self, api):
        r = api.get(f"{BASE_URL}/api/entries")
        lagos = next(e for e in r.json() if e["title"].startswith("O primeiro carril"))
        txt = lagos["text"]
        for needle in [
            "conversa na estação de Roma Termini",
            "uma senhora americana",
            "fiz uma viagem de comboio de Lagos até Lisboa com dois amigos",
            "A minha viagem já começou. A primeira etapa está feita.",
            "Lisboa–Madrid, o verdadeiro início",
        ]:
            assert needle in txt, f"missing phrase: {needle}"

    def test_no_paris_eiffel_or_hendaye_in_entries(self, api):
        r = api.get(f"{BASE_URL}/api/entries")
        for e in r.json():
            blob = (e["title"] + " " + e["text"]).lower()
            assert "paris" not in blob, f"Paris found in entry {e['title']}"
            assert "eiffel" not in blob, f"Eiffel found in entry {e['title']}"
            assert "hendaye" not in blob, f"Hendaye found in entry {e['title']}"

    def test_fr_entry_uses_lyon_image(self, api):
        r = api.get(f"{BASE_URL}/api/entries")
        fr = next(e for e in r.json() if e["country_code"] == "FR")
        assert fr["location"].startswith("Lyon")
        assert fr["photos"], "FR entry must have at least one photo"
        # not the previously-used Paris Metro / random photos
        for bad in ["1502602898657", "1641893910627"]:
            assert all(bad not in p for p in fr["photos"]), f"bad image id {bad} present"


# ---------- Places ----------
class TestPlaces:
    def test_places_count_and_fr_cities(self, api):
        r = api.get(f"{BASE_URL}/api/places")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 23, f"expected 23 places, got {len(data)}"
        fr = [p["city"] for p in data if p["country_code"] == "FR"]
        assert fr == ["Hendaye", "Lyon"], fr


# ---------- Frontend source-code grep ----------
class TestFrontendSources:
    """Static checks on the frontend repo (run from same container)."""

    SRC_ROOTS = ["/app/frontend/src", "/app/frontend/app"]

    def _iter_files(self):
        for root in self.SRC_ROOTS:
            for dirpath, _dn, files in os.walk(root):
                for f in files:
                    if f.endswith((".ts", ".tsx", ".js", ".jsx")):
                        yield os.path.join(dirpath, f)

    def test_no_paris_or_eiffel_in_frontend(self):
        pattern = re.compile(r"paris|eiffel", re.IGNORECASE)
        hits = []
        for path in self._iter_files():
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                for i, line in enumerate(fh, 1):
                    if pattern.search(line):
                        hits.append(f"{path}:{i}:{line.strip()}")
        assert not hits, "Paris/Eiffel still referenced:\n" + "\n".join(hits)

    def test_countries_ts_fr_image_and_cities(self):
        with open("/app/frontend/src/data/countries.ts", "r", encoding="utf-8") as fh:
            text = fh.read()
        assert 'cities: ["Hendaye", "Lyon"]' in text
        assert "pexels-photo-2901214" in text
        assert "photo-1502602898657" not in text
        assert "photo-1641893910627" not in text

    def test_index_story_img_not_paris_metro(self):
        with open("/app/frontend/app/(tabs)/index.tsx", "r", encoding="utf-8") as fh:
            text = fh.read()
        assert "photo-1502602898657" not in text, "STORY_IMG still points to Paris Metro"
        assert "STORY_IMG" in text
