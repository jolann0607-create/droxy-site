from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import List, Annotated
import os
import jwt
import bcrypt
import logging
from pathlib import Path
from bson import ObjectId
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ['JWT_SECRET']
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@droxy.tv').lower()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'DROXY2026')

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Mongo / Pydantic helpers ----------
def coerce_object_id(v):
    if v is None or v == "":
        return str(ObjectId())
    if isinstance(v, ObjectId):
        return str(v)
    s = str(v)
    if ObjectId.is_valid(s):
        return s
    raise ValueError("Identifiant invalide")


PyObjectId = Annotated[str, BeforeValidator(coerce_object_id)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()))

    def to_mongo(self):
        d = self.model_dump()
        d["_id"] = ObjectId(d.pop("id"))
        return d

    @classmethod
    def from_mongo(cls, doc):
        doc = dict(doc)
        doc["id"] = str(doc.pop("_id", doc.get("id")))
        return cls(**doc)


# ---------- Models ----------
class ScheduleDay(BaseDocument):
    day: str
    hours: str = "REPOS"
    game: str = ""
    off: bool = False
    order: int = 0


class Donator(BaseDocument):
    name: str
    amount_total: float = 0.0
    amount_month: float = 0.0


class Sub(BaseDocument):
    name: str
    tier: int = 1
    months: int = 0
    gifts: int = 0


class LoginInput(BaseModel):
    email: str
    password: str


class ScheduleUpdate(BaseModel):
    days: List[ScheduleDay]


# ---------- Auth ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(email: str) -> str:
    payload = {
        "sub": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Non authentifié")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token invalide")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expirée, reconnecte-toi")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")
    email = str(payload.get("sub", "")).lower()
    user = await db.users.find_one({"email": email, "role": "admin"})
    if not user:
        raise HTTPException(status_code=401, detail="Accès refusé")
    return {"email": email, "role": "admin"}


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "DROXY API en ligne"}


@api_router.post("/auth/login")
async def login(input: LoginInput):
    email = input.email.strip().lower()
    user = await db.users.find_one({"email": email, "role": "admin"})
    if not user or not verify_password(input.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    return {"token": create_access_token(email), "user": {"email": email, "role": "admin"}}


@api_router.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return admin


# ---------- Schedule ----------
@api_router.get("/schedule")
async def get_schedule():
    docs = await db.schedule.find().to_list(100)
    days = [ScheduleDay.from_mongo(d) for d in docs]
    days.sort(key=lambda d: d.order)
    return days


@api_router.put("/schedule")
async def replace_schedule(input: ScheduleUpdate, admin=Depends(get_current_admin)):
    await db.schedule.delete_many({})
    docs = []
    for i, day in enumerate(input.days):
        day.order = i
        docs.append(day.to_mongo())
    if docs:
        await db.schedule.insert_many(docs)
    return await get_schedule()


# ---------- Donators ----------
@api_router.get("/donators")
async def get_donators():
    docs = await db.donators.find().sort("amount_total", -1).to_list(500)
    return [Donator.from_mongo(d) for d in docs]


@api_router.post("/donators")
async def add_donator(donator: Donator, admin=Depends(get_current_admin)):
    await db.donators.insert_one(donator.to_mongo())
    return donator


@api_router.put("/donators/{item_id}")
async def update_donator(item_id: str, donator: Donator, admin=Depends(get_current_admin)):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Identifiant invalide")
    donator.id = item_id
    res = await db.donators.replace_one({"_id": ObjectId(item_id)}, donator.to_mongo())
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Donateur introuvable")
    return donator


@api_router.delete("/donators/{item_id}")
async def delete_donator(item_id: str, admin=Depends(get_current_admin)):
    res = await db.donators.delete_one({"_id": ObjectId(item_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Donateur introuvable")
    return {"ok": True}


# ---------- Subs ----------
@api_router.get("/subs")
async def get_subs():
    docs = await db.subs.find().sort("months", -1).to_list(500)
    return [Sub.from_mongo(d) for d in docs]


@api_router.post("/subs")
async def add_sub(sub: Sub, admin=Depends(get_current_admin)):
    await db.subs.insert_one(sub.to_mongo())
    return sub


@api_router.put("/subs/{item_id}")
async def update_sub(item_id: str, sub: Sub, admin=Depends(get_current_admin)):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Identifiant invalide")
    sub.id = item_id
    res = await db.subs.replace_one({"_id": ObjectId(item_id)}, sub.to_mongo())
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Abonné introuvable")
    return sub


@api_router.delete("/subs/{item_id}")
async def delete_sub(item_id: str, admin=Depends(get_current_admin)):
    res = await db.subs.delete_one({"_id": ObjectId(item_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Abonné introuvable")
    return {"ok": True}


# ---------- Twitch live status ----------
import asyncio
import time
import httpx

TWITCH_LOGIN = os.environ.get('TWITCH_LOGIN', 'dr0xy_mdr')
TWITCH_CLIENT_ID = os.environ.get('TWITCH_CLIENT_ID', '')
TWITCH_CLIENT_SECRET = os.environ.get('TWITCH_CLIENT_SECRET', '')


class TwitchTokenCache:
    def __init__(self):
        self.token = None
        self.expires_at = 0.0
        self.lock = asyncio.Lock()

    async def get(self, client):
        if self.token and time.time() < self.expires_at - 60:
            return self.token
        async with self.lock:
            if self.token and time.time() < self.expires_at - 60:
                return self.token
            res = await client.post(
                "https://id.twitch.tv/oauth2/token",
                data={
                    "client_id": TWITCH_CLIENT_ID,
                    "client_secret": TWITCH_CLIENT_SECRET,
                    "grant_type": "client_credentials",
                },
                timeout=10,
            )
            res.raise_for_status()
            payload = res.json()
            self.token = payload["access_token"]
            self.expires_at = time.time() + int(payload.get("expires_in", 3600))
            return self.token


twitch_cache = TwitchTokenCache()
http_client = httpx.AsyncClient()


def _live_payload(doc):
    checked = doc.get("checked_at")
    return {
        "live": doc.get("live", False),
        "title": doc.get("title"),
        "game": doc.get("game"),
        "viewers": doc.get("viewers"),
        "checked_at": checked.isoformat() if checked else None,
    }


@api_router.get("/live")
async def get_live_status():
    if not TWITCH_CLIENT_ID or not TWITCH_CLIENT_SECRET:
        return {"configured": False, "live": None, "title": None, "game": None, "viewers": None, "checked_at": None, "stale": False}
    now = datetime.now(timezone.utc)
    cached = await db.live_status.find_one({"_id": TWITCH_LOGIN})
    if cached and cached.get("checked_at") and (now - cached["checked_at"]).total_seconds() < 20:
        return {"configured": True, "stale": False, **_live_payload(cached)}
    try:
        token = await twitch_cache.get(http_client)
        res = await http_client.get(
            "https://api.twitch.tv/helix/streams",
            params={"user_login": TWITCH_LOGIN},
            headers={"Authorization": f"Bearer {token}", "Client-Id": TWITCH_CLIENT_ID},
            timeout=10,
        )
        if res.status_code == 401:
            twitch_cache.token = None
            token = await twitch_cache.get(http_client)
            res = await http_client.get(
                "https://api.twitch.tv/helix/streams",
                params={"user_login": TWITCH_LOGIN},
                headers={"Authorization": f"Bearer {token}", "Client-Id": TWITCH_CLIENT_ID},
                timeout=10,
            )
        if res.status_code == 429:
            if cached:
                return {"configured": True, "stale": True, **_live_payload(cached)}
            raise HTTPException(status_code=503, detail="Twitch rate limit atteint")
        res.raise_for_status()
        data = res.json().get("data", [])
        stream = data[0] if data else None
        doc = {
            "_id": TWITCH_LOGIN,
            "live": bool(stream),
            "title": stream.get("title") if stream else None,
            "game": stream.get("game_name") if stream else None,
            "viewers": stream.get("viewer_count") if stream else None,
            "checked_at": now,
        }
        await db.live_status.replace_one({"_id": TWITCH_LOGIN}, doc, upsert=True)
        return {"configured": True, "stale": False, **_live_payload(doc)}
    except (httpx.TimeoutException, httpx.ConnectError):
        if cached:
            return {"configured": True, "stale": True, **_live_payload(cached)}
        raise HTTPException(status_code=503, detail="Twitch indisponible")
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=502, detail="Erreur API Twitch")


# ---------- YouTube (dernière vidéo via flux RSS public) ----------
import re

YOUTUBE_CHANNEL_ID = os.environ.get('YOUTUBE_CHANNEL_ID', 'UChSddS8GiRWNdymhbniF3Kg')
_youtube_cache = {"data": None, "fetched_at": 0.0}


@api_router.get("/youtube/latest")
async def youtube_latest():
    now_ts = time.time()
    if _youtube_cache["data"] and now_ts - _youtube_cache["fetched_at"] < 600:
        return _youtube_cache["data"]
    try:
        res = await http_client.get(
            f"https://www.youtube.com/feeds/videos.xml?channel_id={YOUTUBE_CHANNEL_ID}",
            timeout=10,
        )
        res.raise_for_status()
        videos = []
        for entry in re.findall(r"<entry>.*?</entry>", res.text, re.S):
            vid = re.search(r"<yt:videoId>(.*?)</yt:videoId>", entry)
            title = re.search(r"<title>(.*?)</title>", entry)
            pub = re.search(r"<published>(.*?)</published>", entry)
            if vid:
                videos.append({
                    "video_id": vid.group(1),
                    "title": title.group(1) if title else "",
                    "published": pub.group(1) if pub else None,
                })
        data = {"has_video": len(videos) > 0, "videos": videos[:6]}
    except Exception:
        data = {"has_video": False, "videos": []}
    _youtube_cache["data"] = data
    _youtube_cache["fetched_at"] = now_ts
    return data


# ---------- Feedback (boîte à idées) ----------
class Feedback(BaseDocument):
    name: str = "Anonyme"
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@api_router.post("/feedback")
async def add_feedback(feedback: Feedback):
    name = (feedback.name or "").strip()[:50] or "Anonyme"
    message = (feedback.message or "").strip()
    if len(message) < 3 or len(message) > 1000:
        raise HTTPException(status_code=400, detail="Le message doit contenir entre 3 et 1000 caractères")
    await db.feedback.insert_one(Feedback(name=name, message=message).to_mongo())
    return {"ok": True, "message": "Message reçu, merci !"}


@api_router.get("/feedback")
async def get_feedback(admin=Depends(get_current_admin)):
    docs = await db.feedback.find().sort("created_at", -1).to_list(500)
    return [Feedback.from_mongo(d) for d in docs]


@api_router.delete("/feedback/{item_id}")
async def delete_feedback(item_id: str, admin=Depends(get_current_admin)):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Identifiant invalide")
    res = await db.feedback.delete_one({"_id": ObjectId(item_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message introuvable")
    return {"ok": True}


# ---------- Seed ----------
SEED_SCHEDULE = [
    {"day": "Lundi", "hours": "18h — 20h", "game": "Petit jeux avec vous", "off": False},
    {"day": "Mardi", "hours": "REPOS", "game": "Valorant", "off": True},
    {"day": "Mercredi", "hours": "15h — 17h", "game": "Jeux chill on discute", "off": False},
    {"day": "Jeudi", "hours": "REPOS", "game": "GTA RP", "off": True},
    {"day": "Vendredi", "hours": "18h — 22h", "game": "Gaming", "off": False},
    {"day": "Samedi", "hours": "18h — 22h", "game": "Gaming", "off": False},
    {"day": "Dimanche", "hours": "17h — 21h", "game": "Jeu solo chill", "off": False},
]
SEED_DONATORS = [
    {"name": "Owen", "amount_total": 0, "amount_month": 0},
    {"name": "Yanis", "amount_total": 0, "amount_month": 0},
    {"name": "Noa", "amount_total": 0, "amount_month": 0},
]
SEED_SUBS = []


async def seed_data():
    admin = await db.users.find_one({"email": ADMIN_EMAIL})
    if admin is None:
        await db.users.insert_one({
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(ADMIN_PASSWORD, admin.get("password_hash", "")):
        await db.users.update_one(
            {"_id": admin["_id"]},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )
    await db.users.create_index("email", unique=True)
    for coll, seed in [("schedule", SEED_SCHEDULE), ("donators", SEED_DONATORS), ("subs", SEED_SUBS)]:
        if seed and await db[coll].count_documents({}) == 0:
            await db[coll].insert_many([dict(s) for s in seed])


@app.on_event("startup")
async def startup():
    await seed_data()


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
