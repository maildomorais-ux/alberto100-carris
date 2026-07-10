"""
Alberto 100 Carris - Backend API
A cinematic travel diary from Lagos (Portugal) to Singapore by train.
"""
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from pathlib import Path
import os
import uuid
import logging
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---------- Config ----------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", "alberto-100-carris-lagos-singapura-2026")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "alberto")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "lagos2026")

# ---------- DB ----------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ---------- Security ----------
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def hash_password(p: str) -> str:
    return pwd_ctx.hash(p)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_ctx.verify(plain, hashed)
    except Exception:
        return False


def create_token(sub: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": sub, "exp": expire}, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> str:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ---------- Models ----------
class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class DiaryEntryIn(BaseModel):
    title: str
    text: str
    location: str
    country_code: str
    date: str  # ISO date "YYYY-MM-DD"
    distance_km: float = 0
    weather: Optional[str] = None
    photos: List[str] = Field(default_factory=list)  # base64 or urls
    video: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class DiaryEntryOut(DiaryEntryIn):
    id: str
    created_at: datetime
    updated_at: datetime


class PlaceIn(BaseModel):
    country_code: str
    city: str
    order: int = 0
    description: str = ""
    experience: str = ""
    photos: List[str] = Field(default_factory=list)
    video_url: Optional[str] = None  # YouTube watch/share URL or video ID
    lat: Optional[float] = None
    lng: Optional[float] = None
    distance_km: float = 0
    is_air_link: bool = False


class PlaceOut(PlaceIn):
    id: str
    created_at: datetime
    updated_at: datetime


class EpisodeIn(BaseModel):
    number: int = 1
    title_pt: str = ""
    title_en: str = ""
    subtitle_pt: Optional[str] = None
    subtitle_en: Optional[str] = None
    description_pt: str = ""
    description_en: str = ""
    country_code: Optional[str] = None
    location: str = ""
    date: str = ""  # ISO YYYY-MM-DD (opcional)
    duration: str = ""  # e.g. "12:24"
    cover_photo: Optional[str] = None
    video_url: Optional[str] = None
    gallery: List[str] = Field(default_factory=list)
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: str = "published"  # "published" or "draft"


class EpisodeOut(EpisodeIn):
    id: str
    created_at: datetime
    updated_at: datetime


class StatsOut(BaseModel):
    km_traveled: float
    days: int
    countries_visited: int
    cities_visited: int
    trains_used: int
    hours_traveling: int
    entries_count: int


# ---------- App ----------
app = FastAPI(title="Alberto 100 Carris API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("alberto")


# ---------- Seed ----------
ROUTE = [
    {"code": "PT", "cities": ["Lagos", "Lisboa"], "lat": 39.4, "lng": -8.2},
    {"code": "ES", "cities": ["Madrid", "Barcelona"], "lat": 40.4, "lng": -3.7},
    {"code": "FR", "cities": ["Lyon"], "lat": 45.76, "lng": 4.84},
    {"code": "DE", "cities": ["Munique"], "lat": 48.14, "lng": 11.58},
    {"code": "AT", "cities": ["Viena"], "lat": 48.21, "lng": 16.37},
    {"code": "HU", "cities": ["Budapeste"], "lat": 47.50, "lng": 19.04},
    {"code": "RO", "cities": ["Bucareste"], "lat": 44.43, "lng": 26.10},
    {"code": "TR", "cities": ["Istambul"], "lat": 41.01, "lng": 28.98},
    {"code": "GE", "cities": ["Tbilisi"], "lat": 41.72, "lng": 44.83, "is_air_link": True},
    {"code": "RU", "cities": ["Moscovo", "Irkutsk", "Lago Baikal"], "lat": 55.75, "lng": 37.62},
    {"code": "MN", "cities": ["Ulaanbaatar"], "lat": 47.92, "lng": 106.92},
    {"code": "CN", "cities": ["Pequim", "Kunming"], "lat": 39.90, "lng": 116.41},
    {"code": "LA", "cities": ["Vientiane"], "lat": 17.97, "lng": 102.63},
    {"code": "TH", "cities": ["Banguecoque"], "lat": 13.76, "lng": 100.50},
    {"code": "MY", "cities": ["Kuala Lumpur"], "lat": 3.14, "lng": 101.69},
    {"code": "SG", "cities": ["Singapura"], "lat": 1.35, "lng": 103.82},
]


SAMPLE_ENTRIES = [
    {
        "title": "Tudo Começa Aqui — Lagos",
        "text": "Para mim, a viagem já começou há muito tempo. Tudo nasceu numa conversa na estação de Roma Termini, quando uma senhora americana me falou da maior viagem do mundo de comboio. Essa conversa deu origem ao sonho, mas a viagem começou pouco tempo depois.\n\nUm ou dois anos mais tarde, fiz uma viagem de comboio de Lagos até Lisboa com dois amigos. Lembro-me perfeitamente de pensar: \"A minha viagem já começou. A primeira etapa está feita.\"\n\nHoje, cerca de quarenta anos depois, não estou a começar uma viagem. Estou a continuá-la. O percurso Lagos–Lisboa foi a primeira etapa. Agora começa a segunda: Lisboa–Madrid, o verdadeiro início da grande travessia que me levará, carril após carril, até Singapura.",
        "location": "Lagos, Portugal",
        "country_code": "PT",
        "date": "",
        "distance_km": 0,
        "weather": "Sol, 24 °C",
        "photos": ["https://commons.wikimedia.org/wiki/Special:FilePath/Lagos_pedestrial_area%2C_Algarve%2C_Portugal.JPG"],
        "video": None,
        "lat": 37.1028,
        "lng": -8.6735,
    },
    {
        "title": "Lisboa — fim da primeira etapa",
        "text": "Lisboa é o ponto onde se fecha o primeiro capítulo daquela viagem dos meus vinte anos — e onde começa, agora, o segundo. Santa Apolónia continua igual a como a recordo: cheiro a comboio, paredes amarelas, o relógio enorme a marcar partidas. Daqui parte o comboio para Madrid.",
        "location": "Lisboa, Portugal",
        "country_code": "PT",
        "date": "",
        "distance_km": 305,
        "weather": "Brisa quente",
        "photos": ["https://commons.wikimedia.org/wiki/Special:FilePath/Exterior_da_esta%C3%A7%C3%A3o_de_oriente.jpg"],
        "video": None,
        "lat": 38.7223,
        "lng": -9.1393,
    },
    {
        "title": "Barcelona → Lyon, atravessar os Pirenéus",
        "text": "De Barcelona segui directamente para Lyon, atravessando os Pirenéus em comboio. Lyon recebe-nos com a confluência do Ródano e do Saône — uma cidade ferroviária, cruzamento natural da Europa.",
        "location": "Lyon, França",
        "country_code": "FR",
        "date": "",
        "distance_km": 1450,
        "weather": "Nublado",
        "photos": ["https://images.pexels.com/photos/2901214/pexels-photo-2901214.jpeg?w=1600"],
        "video": None,
        "lat": 45.7640,
        "lng": 4.8357,
    },
]


@app.on_event("startup")
async def on_startup():
    # Seed admin
    users = db["users"]
    existing = await users.find_one({"username": ADMIN_USERNAME})
    if not existing:
        await users.insert_one(
            {
                "id": str(uuid.uuid4()),
                "username": ADMIN_USERNAME,
                "password_hash": hash_password(ADMIN_PASSWORD),
                "created_at": datetime.now(timezone.utc),
            }
        )
        logger.info("Seeded admin user: %s", ADMIN_USERNAME)
    else:
        if not verify_password(ADMIN_PASSWORD, existing.get("password_hash", "")):
            await users.update_one(
                {"username": ADMIN_USERNAME},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
            )
            logger.info("Refreshed admin password hash for: %s", ADMIN_USERNAME)

    # Seed initial diary entries
    entries = db["entries"]
    if await entries.count_documents({}) == 0:
        for sample in SAMPLE_ENTRIES:
            now = datetime.now(timezone.utc)
            await entries.insert_one({"id": str(uuid.uuid4()), **sample, "created_at": now, "updated_at": now})
        logger.info("Seeded %d sample entries", len(SAMPLE_ENTRIES))

    # Seed default places (one per city) from the static route
    places = db["places"]
    if await places.count_documents({}) == 0:
        order = 0
        for country in ROUTE:
            for city in country["cities"]:
                now = datetime.now(timezone.utc)
                await places.insert_one({
                    "id": str(uuid.uuid4()),
                    "country_code": country["code"],
                    "city": city,
                    "order": order,
                    "description": "",
                    "experience": "",
                    "photos": [],
                    "video_url": None,
                    "lat": country.get("lat"),
                    "lng": country.get("lng"),
                    "distance_km": 0,
                    "is_air_link": country.get("is_air_link", False),
                    "created_at": now,
                    "updated_at": now,
                })
                order += 1
        logger.info("Seeded %d places", order)


    # Seed default episodes (migrating the previous 4 hard-coded videos)
    episodes = db["episodes"]
    if await episodes.count_documents({}) == 0:
        now = datetime.now(timezone.utc)
        default_eps = [
            {
                "number": 1,
                "title_pt": "Episódio 01 — Lagos → Lisboa",
                "title_en": "Episode 01 — Lagos → Lisbon",
                "duration": "12:24",
                "cover_photo": "https://commons.wikimedia.org/wiki/Special:FilePath/Lagos_pedestrial_area%2C_Algarve%2C_Portugal.JPG",
                "country_code": "PT", "location": "Lagos",
            },
            {
                "number": 2,
                "title_pt": "Episódio 02 — Lisboa → Madrid",
                "title_en": "Episode 02 — Lisbon → Madrid",
                "duration": "18:02",
                "cover_photo": "https://commons.wikimedia.org/wiki/Special:FilePath/Exterior_da_esta%C3%A7%C3%A3o_de_oriente.jpg",
                "country_code": "ES", "location": "Madrid",
            },
            {
                "number": 3,
                "title_pt": "Episódio 03 — Bósforo",
                "title_en": "Episode 03 — The Bosphorus",
                "duration": "14:48",
                "cover_photo": "https://images.unsplash.com/photo-1719082993979-c4a36d62efad?w=1200",
                "country_code": "TR", "location": "Istambul",
            },
            {
                "number": 4,
                "title_pt": "Episódio 04 — Transiberiano",
                "title_en": "Episode 04 — Trans-Siberian",
                "duration": "22:11",
                "cover_photo": "https://images.unsplash.com/photo-1514970746-d4a465d514d0?w=1200",
                "country_code": "RU", "location": "Moscovo → Irkutsk",
            },
        ]
        for e in default_eps:
            await episodes.insert_one({
                "id": str(uuid.uuid4()),
                "number": e["number"],
                "title_pt": e["title_pt"], "title_en": e["title_en"],
                "subtitle_pt": None, "subtitle_en": None,
                "description_pt": "", "description_en": "",
                "country_code": e.get("country_code"),
                "location": e.get("location", ""),
                "date": "", "duration": e["duration"],
                "cover_photo": e.get("cover_photo"),
                "video_url": None, "gallery": [],
                "lat": None, "lng": None,
                "status": "published",
                "created_at": now, "updated_at": now,
            })
        logger.info("Seeded %d episodes", len(default_eps))


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ---------- Routes ----------
@api.get("/")
async def root():
    return {"app": "Alberto 100 Carris", "status": "running"}


@api.post("/auth/login", response_model=TokenOut)
async def login(payload: LoginIn):
    user = await db["users"].find_one({"username": payload.username})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = create_token(payload.username)
    return TokenOut(access_token=token, username=payload.username)


@api.get("/auth/me")
async def me(current_user: str = Depends(get_current_user)):
    return {"username": current_user}


def serialize_entry(doc) -> DiaryEntryOut:
    return DiaryEntryOut(
        id=doc["id"],
        title=doc["title"],
        text=doc["text"],
        location=doc["location"],
        country_code=doc["country_code"],
        date=doc["date"],
        distance_km=doc.get("distance_km", 0),
        weather=doc.get("weather"),
        photos=doc.get("photos", []),
        video=doc.get("video"),
        lat=doc.get("lat"),
        lng=doc.get("lng"),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@api.get("/entries", response_model=List[DiaryEntryOut])
async def list_entries():
    cursor = db["entries"].find({}, {"_id": 0}).sort("date", 1)
    return [serialize_entry(d) async for d in cursor]


@api.get("/entries/{entry_id}", response_model=DiaryEntryOut)
async def get_entry(entry_id: str):
    doc = await db["entries"].find_one({"id": entry_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Entry not found")
    return serialize_entry(doc)


@api.post("/entries", response_model=DiaryEntryOut, status_code=201)
async def create_entry(payload: DiaryEntryIn, _user: str = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    await db["entries"].insert_one(doc.copy())
    doc.pop("_id", None)
    return serialize_entry(doc)


@api.put("/entries/{entry_id}", response_model=DiaryEntryOut)
async def update_entry(entry_id: str, payload: DiaryEntryIn, _user: str = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    update = {**payload.model_dump(), "updated_at": now}
    result = await db["entries"].find_one_and_update(
        {"id": entry_id},
        {"$set": update},
        return_document=True,
        projection={"_id": 0},
    )
    if not result:
        raise HTTPException(404, "Entry not found")
    return serialize_entry(result)


@api.delete("/entries/{entry_id}", status_code=204)
async def delete_entry(entry_id: str, _user: str = Depends(get_current_user)):
    res = await db["entries"].delete_one({"id": entry_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Entry not found")
    return None


@api.get("/stats", response_model=StatsOut)
async def get_stats():
    entries = await db["entries"].find({}, {"_id": 0}).to_list(length=10000)
    if not entries:
        return StatsOut(
            km_traveled=0, days=0, countries_visited=0,
            cities_visited=0, trains_used=0, hours_traveling=0, entries_count=0,
        )

    km = sum(float(e.get("distance_km", 0) or 0) for e in entries)
    countries = {e.get("country_code") for e in entries if e.get("country_code")}
    cities = {e.get("location") for e in entries if e.get("location")}
    dates = sorted({e.get("date") for e in entries if e.get("date")})

    # days = unique entries (each entry = a day)
    days = len(entries)

    # Rough estimates: ~80 km/h average train -> hours; ~1 train per entry
    hours = int(km / 80) if km else 0
    trains = len(entries)

    return StatsOut(
        km_traveled=round(km, 1),
        days=days,
        countries_visited=len(countries),
        cities_visited=len(cities),
        trains_used=trains,
        hours_traveling=hours,
        entries_count=len(entries),
    )


def serialize_place(d) -> dict:
    return {
        "id": d["id"],
        "country_code": d["country_code"],
        "city": d["city"],
        "order": d.get("order", 0),
        "description": d.get("description", ""),
        "experience": d.get("experience", ""),
        "photos": d.get("photos", []),
        "video_url": d.get("video_url"),
        "lat": d.get("lat"),
        "lng": d.get("lng"),
        "distance_km": d.get("distance_km", 0),
        "is_air_link": d.get("is_air_link", False),
        "created_at": d["created_at"],
        "updated_at": d["updated_at"],
    }


@api.get("/places")
async def list_places():
    cursor = db["places"].find({}, {"_id": 0}).sort("order", 1)
    return [serialize_place(d) async for d in cursor]


@api.get("/places/{place_id}")
async def get_place(place_id: str):
    doc = await db["places"].find_one({"id": place_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Place not found")
    return serialize_place(doc)


@api.put("/places/{place_id}")
async def update_place(place_id: str, payload: PlaceIn, _user: str = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    data = {**payload.model_dump(), "updated_at": now}
    result = await db["places"].find_one_and_update(
        {"id": place_id}, {"$set": data}, return_document=True, projection={"_id": 0}
    )
    if not result:
        raise HTTPException(404, "Place not found")
    return serialize_place(result)


@api.post("/places/{place_id}/photo")
async def add_photo(place_id: str, payload: dict, _user: str = Depends(get_current_user)):
    photo = payload.get("photo")
    if not photo:
        raise HTTPException(400, "photo required")
    now = datetime.now(timezone.utc)
    result = await db["places"].find_one_and_update(
        {"id": place_id},
        {"$push": {"photos": photo}, "$set": {"updated_at": now}},
        return_document=True, projection={"_id": 0},
    )
    if not result:
        raise HTTPException(404, "Place not found")
    return serialize_place(result)


@api.delete("/places/{place_id}/photo/{index}")
async def remove_photo(place_id: str, index: int, _user: str = Depends(get_current_user)):
    doc = await db["places"].find_one({"id": place_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Place not found")
    photos = doc.get("photos", [])
    if 0 <= index < len(photos):
        photos.pop(index)
    now = datetime.now(timezone.utc)
    await db["places"].update_one({"id": place_id}, {"$set": {"photos": photos, "updated_at": now}})
    doc["photos"] = photos
    doc["updated_at"] = now
    return serialize_place(doc)


# ---------- Episodes (video posts) ----------
def serialize_episode(d) -> dict:
    return {
        "id": d["id"],
        "number": d.get("number", 1),
        "title_pt": d.get("title_pt", ""),
        "title_en": d.get("title_en", ""),
        "subtitle_pt": d.get("subtitle_pt"),
        "subtitle_en": d.get("subtitle_en"),
        "description_pt": d.get("description_pt", ""),
        "description_en": d.get("description_en", ""),
        "country_code": d.get("country_code"),
        "location": d.get("location", ""),
        "date": d.get("date", ""),
        "duration": d.get("duration", ""),
        "cover_photo": d.get("cover_photo"),
        "video_url": d.get("video_url"),
        "gallery": d.get("gallery", []),
        "lat": d.get("lat"),
        "lng": d.get("lng"),
        "status": d.get("status", "published"),
        "created_at": d["created_at"],
        "updated_at": d["updated_at"],
    }


@api.get("/episodes")
async def list_episodes():
    cursor = db["episodes"].find({"status": "published"}, {"_id": 0}).sort("number", 1)
    return [serialize_episode(d) async for d in cursor]


@api.get("/episodes/all")
async def list_episodes_all(_user: str = Depends(get_current_user)):
    cursor = db["episodes"].find({}, {"_id": 0}).sort("number", 1)
    return [serialize_episode(d) async for d in cursor]


@api.get("/episodes/{ep_id}")
async def get_episode(ep_id: str):
    doc = await db["episodes"].find_one({"id": ep_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Episode not found")
    return serialize_episode(doc)


@api.post("/episodes", status_code=201)
async def create_episode(payload: EpisodeIn, _user: str = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    doc = {"id": str(uuid.uuid4()), **payload.model_dump(), "created_at": now, "updated_at": now}
    await db["episodes"].insert_one(doc.copy())
    doc.pop("_id", None)
    return serialize_episode(doc)


@api.put("/episodes/{ep_id}")
async def update_episode(ep_id: str, payload: EpisodeIn, _user: str = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    result = await db["episodes"].find_one_and_update(
        {"id": ep_id}, {"$set": {**payload.model_dump(), "updated_at": now}},
        return_document=True, projection={"_id": 0},
    )
    if not result:
        raise HTTPException(404, "Episode not found")
    return serialize_episode(result)


@api.delete("/episodes/{ep_id}", status_code=204)
async def delete_episode(ep_id: str, _user: str = Depends(get_current_user)):
    res = await db["episodes"].delete_one({"id": ep_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Episode not found")
    return None


# ---------- File uploads (photos & videos, no AI, plain storage) ----------
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".gif"}
ALLOWED_VIDEO_EXT = {".mp4", ".mov", ".m4v", ".webm"}


@api.post("/upload")
async def upload_file(file: UploadFile = File(...), _user: str = Depends(get_current_user)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_IMAGE_EXT and ext not in ALLOWED_VIDEO_EXT:
        raise HTTPException(400, f"Unsupported file type: {ext}")
    kind = "image" if ext in ALLOWED_IMAGE_EXT else "video"
    fname = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOADS_DIR / fname
    with dest.open("wb") as out:
        shutil.copyfileobj(file.file, out)
    return {"url": f"/api/uploads/{fname}", "kind": kind, "filename": fname}


app.include_router(api)

app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
