from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from typing import List, Optional
import uuid
import random

from app.models import (
    UserCreate, UserLogin, UserOnboarding, UserResponse, UserInDB,
    Sign, SignLog, SignLogCreate, UniverseReceipt,
    Meditation, MeditationLog, MeditationLogCreate,
    AmbientSound, Tribe, TribeStats, DailyMessage,
    Token, ProbabilityContext, ReceiptRequest,
    SignRarity, SubscriptionStatus
)
from app.database import db
from app.auth import (
    get_password_hash, create_access_token, get_current_user,
    authenticate_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.probability import (
    calculate_probability, get_rarity_display_name, get_rarity_color
)

app = FastAPI(title="SignRoad API", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


# ============== AUTH ENDPOINTS ==============

@app.post("/api/auth/signup", response_model=Token)
async def signup(user_data: UserCreate):
    if user_data.email in db.users_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    trial_end = datetime.utcnow() + timedelta(days=14)
    
    user = UserInDB(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password,
        current_day=1,
        lantern_health=100,
        sparks=0,
        streak_days=0,
        subscription_status=SubscriptionStatus.TRIAL,
        trial_end_date=trial_end,
        onboarding_completed=False,
        created_at=datetime.utcnow()
    )
    
    db.users[user_id] = user
    db.users_by_email[user_data.email] = user_id
    
    access_token = create_access_token(data={"sub": user_id})
    return Token(access_token=access_token)


@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token)


@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: UserInDB = Depends(get_current_user)):
    return UserResponse(**current_user.model_dump())


# ============== USER ENDPOINTS ==============

@app.post("/api/user/onboarding", response_model=UserResponse)
async def complete_onboarding(
    data: UserOnboarding,
    current_user: UserInDB = Depends(get_current_user)
):
    current_user.name = data.name
    current_user.intention = data.intention
    current_user.onboarding_completed = True
    db.users[current_user.id] = current_user
    return UserResponse(**current_user.model_dump())


@app.post("/api/user/advance-day", response_model=UserResponse)
async def advance_day(current_user: UserInDB = Depends(get_current_user)):
    current_user.current_day += 1
    db.users[current_user.id] = current_user
    return UserResponse(**current_user.model_dump())


@app.post("/api/user/update-lantern", response_model=UserResponse)
async def update_lantern(
    health_change: int,
    current_user: UserInDB = Depends(get_current_user)
):
    current_user.lantern_health = max(0, min(100, current_user.lantern_health + health_change))
    db.users[current_user.id] = current_user
    return UserResponse(**current_user.model_dump())


# ============== SIGN ENDPOINTS ==============

@app.get("/api/signs", response_model=List[Sign])
async def get_all_signs():
    return list(db.signs.values())


@app.get("/api/signs/available", response_model=List[Sign])
async def get_available_signs(current_user: UserInDB = Depends(get_current_user)):
    user_day = current_user.current_day
    unlocked_signs = [
        sign for sign in db.signs.values()
        if sign.unlock_day <= user_day
    ]
    
    if len(unlocked_signs) <= 3:
        return unlocked_signs
    
    return random.sample(unlocked_signs, 3)


@app.get("/api/signs/{sign_id}", response_model=Sign)
async def get_sign(sign_id: str):
    sign = db.signs.get(sign_id)
    if not sign:
        raise HTTPException(status_code=404, detail="Sign not found")
    return sign


@app.post("/api/signs/log", response_model=SignLog)
async def log_sign(
    data: SignLogCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    sign = db.signs.get(data.sign_id)
    if not sign:
        raise HTTPException(status_code=404, detail="Sign not found")
    
    log_id = str(uuid.uuid4())
    sparks_earned = 5
    
    sign_log = SignLog(
        id=log_id,
        user_id=current_user.id,
        sign_id=data.sign_id,
        found_at=datetime.utcnow(),
        note=data.note,
        location_type=data.location_type,
        sparks_earned=sparks_earned
    )
    
    db.sign_logs[log_id] = sign_log
    
    current_user.sparks += sparks_earned
    db.users[current_user.id] = current_user
    
    return sign_log


@app.get("/api/signs/logs/me", response_model=List[SignLog])
async def get_my_sign_logs(current_user: UserInDB = Depends(get_current_user)):
    return [
        log for log in db.sign_logs.values()
        if log.user_id == current_user.id
    ]


@app.post("/api/signs/receipt", response_model=UniverseReceipt)
async def generate_receipt(
    data: ReceiptRequest,
    current_user: UserInDB = Depends(get_current_user)
):
    sign = db.signs.get(data.sign_id)
    if not sign:
        raise HTTPException(status_code=404, detail="Sign not found")
    
    context = data.context or ProbabilityContext(user_streak=current_user.streak_days)
    if not context.user_streak:
        context.user_streak = current_user.streak_days
    
    probability, display = calculate_probability(sign.rarity, context)
    
    receipt = UniverseReceipt(
        sign_name=sign.name,
        sign_emoji=sign.emoji,
        rarity=sign.rarity,
        found_at=datetime.utcnow(),
        probability_display=display,
        user_streak=current_user.streak_days,
        receipt_id=str(uuid.uuid4())[:8].upper()
    )
    
    return receipt


# ============== MEDITATION ENDPOINTS ==============

@app.get("/api/meditations", response_model=List[Meditation])
async def get_all_meditations():
    return list(db.meditations.values())


@app.get("/api/meditations/today", response_model=Meditation)
async def get_today_meditation(current_user: UserInDB = Depends(get_current_user)):
    user_day = current_user.current_day
    meditation = db.meditations.get(f"meditation_{user_day}")
    
    if not meditation:
        meditation = db.meditations.get("meditation_1")
    
    if current_user.subscription_status == SubscriptionStatus.TRIAL and not meditation.is_free:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This meditation requires a subscription"
        )
    
    return meditation


@app.get("/api/meditations/{meditation_id}", response_model=Meditation)
async def get_meditation(
    meditation_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    meditation = db.meditations.get(meditation_id)
    if not meditation:
        raise HTTPException(status_code=404, detail="Meditation not found")
    
    if current_user.subscription_status == SubscriptionStatus.TRIAL and not meditation.is_free:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This meditation requires a subscription"
        )
    
    return meditation


@app.post("/api/meditations/complete", response_model=MeditationLog)
async def complete_meditation(
    data: MeditationLogCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    meditation = db.meditations.get(data.meditation_id)
    if not meditation:
        raise HTTPException(status_code=404, detail="Meditation not found")
    
    log_id = str(uuid.uuid4())
    sparks_earned = 10
    
    meditation_log = MeditationLog(
        id=log_id,
        user_id=current_user.id,
        meditation_id=data.meditation_id,
        completed_at=datetime.utcnow(),
        duration_seconds=data.duration_seconds,
        sparks_earned=sparks_earned
    )
    
    db.meditation_logs[log_id] = meditation_log
    
    current_user.sparks += sparks_earned
    current_user.lantern_health = min(100, current_user.lantern_health + 10)
    
    today = datetime.utcnow().date()
    if current_user.last_meditation_date:
        last_date = current_user.last_meditation_date.date()
        if (today - last_date).days == 1:
            current_user.streak_days += 1
        elif (today - last_date).days > 1:
            current_user.streak_days = 1
    else:
        current_user.streak_days = 1
    
    current_user.last_meditation_date = datetime.utcnow()
    db.users[current_user.id] = current_user
    
    if current_user.tribe_id:
        member_key = f"{current_user.id}_{current_user.tribe_id}"
        if member_key in db.tribe_members:
            db.tribe_members[member_key].meditated_today = True
    
    return meditation_log


@app.get("/api/meditations/logs/me", response_model=List[MeditationLog])
async def get_my_meditation_logs(current_user: UserInDB = Depends(get_current_user)):
    return [
        log for log in db.meditation_logs.values()
        if log.user_id == current_user.id
    ]


# ============== AMBIENT SOUNDS ENDPOINTS ==============

@app.get("/api/sounds", response_model=List[AmbientSound])
async def get_all_sounds():
    return list(db.ambient_sounds.values())


@app.get("/api/sounds/downloadable", response_model=List[AmbientSound])
async def get_downloadable_sounds():
    return [
        sound for sound in db.ambient_sounds.values()
        if sound.is_downloadable
    ]


# ============== TRIBE ENDPOINTS ==============

@app.post("/api/tribes/join", response_model=TribeStats)
async def join_tribe(current_user: UserInDB = Depends(get_current_user)):
    if current_user.tribe_id:
        tribe = db.tribes.get(current_user.tribe_id)
        if tribe:
            return await get_tribe_stats(current_user)
    
    tribe = db.get_available_tribe()
    if not tribe:
        raise HTTPException(status_code=500, detail="No tribes available")
    
    tribe.member_count += 1
    db.tribes[tribe.id] = tribe
    
    member_key = f"{current_user.id}_{tribe.id}"
    db.tribe_members[member_key] = {
        "user_id": current_user.id,
        "tribe_id": tribe.id,
        "joined_at": datetime.utcnow(),
        "meditated_today": False
    }
    
    current_user.tribe_id = tribe.id
    db.users[current_user.id] = current_user
    
    return await get_tribe_stats(current_user)


@app.get("/api/tribes/stats", response_model=TribeStats)
async def get_tribe_stats(current_user: UserInDB = Depends(get_current_user)):
    if not current_user.tribe_id:
        raise HTTPException(status_code=404, detail="Not in a tribe")
    
    tribe = db.tribes.get(current_user.tribe_id)
    if not tribe:
        raise HTTPException(status_code=404, detail="Tribe not found")
    
    tribe_members = [
        m for key, m in db.tribe_members.items()
        if isinstance(m, dict) and m.get("tribe_id") == tribe.id
    ]
    
    meditated_count = sum(1 for m in tribe_members if m.get("meditated_today", False))
    
    member_streaks = []
    for m in tribe_members:
        user = db.users.get(m.get("user_id"))
        if user:
            member_streaks.append(user.streak_days)
    
    return TribeStats(
        tribe_id=tribe.id,
        tribe_name=tribe.name,
        total_members=tribe.member_count,
        meditated_today=meditated_count,
        member_streaks=member_streaks
    )


# ============== DAILY MESSAGE ENDPOINTS ==============

BARNUM_TEMPLATES = {
    "transformation": [
        "You're on the verge of a breakthrough, {name}. The signs are aligning.",
        "Something is shifting within you, {name}. Trust the process.",
        "Your intention '{intention}' is closer than you think.",
        "The universe has noticed your {streak}-day commitment, {name}.",
    ],
    "validation": [
        "You've found {signs_count} signs so far. Each one was meant for you.",
        "Your Lantern burns at {lantern}%. Keep it bright.",
        "Day {day} of your journey. You're exactly where you need to be.",
        "Your Tribe is walking with you, {name}. You're not alone.",
    ],
    "timing": [
        "Today holds a special sign for you, {name}. Stay aware.",
        "The timing of your journey is perfect. Trust it.",
        "What you seek is also seeking you, {name}.",
        "This moment, right now, is part of your manifestation.",
    ],
    "abundance": [
        "Abundance flows to those who notice it, {name}. You're noticing.",
        "Your {sparks} Sparks represent energy you've cultivated.",
        "The universe rewards awareness. You have it.",
        "Every sign you find opens another door.",
    ],
}


@app.get("/api/daily-message")
async def get_daily_message(current_user: UserInDB = Depends(get_current_user)):
    category = random.choice(list(BARNUM_TEMPLATES.keys()))
    template = random.choice(BARNUM_TEMPLATES[category])
    
    user_sign_logs = [
        log for log in db.sign_logs.values()
        if log.user_id == current_user.id
    ]
    
    message = template.format(
        name=current_user.name or "Traveler",
        intention=current_user.intention or "your deepest desire",
        streak=current_user.streak_days,
        day=current_user.current_day,
        lantern=current_user.lantern_health,
        sparks=current_user.sparks,
        signs_count=len(user_sign_logs)
    )
    
    return {
        "message": message,
        "category": category,
        "generated_at": datetime.utcnow().isoformat()
    }


# ============== ADMIN ENDPOINTS ==============

@app.get("/api/admin/stats")
async def get_admin_stats():
    total_users = len(db.users)
    total_sign_logs = len(db.sign_logs)
    total_meditation_logs = len(db.meditation_logs)
    
    active_tribes = sum(1 for t in db.tribes.values() if t.member_count > 0)
    
    trial_users = sum(
        1 for u in db.users.values()
        if u.subscription_status == SubscriptionStatus.TRIAL
    )
    
    return {
        "total_users": total_users,
        "trial_users": trial_users,
        "total_sign_logs": total_sign_logs,
        "total_meditation_logs": total_meditation_logs,
        "active_tribes": active_tribes,
        "total_signs": len(db.signs),
        "total_meditations": len(db.meditations),
        "total_sounds": len(db.ambient_sounds)
    }


@app.get("/api/admin/users")
async def get_all_users():
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "current_day": u.current_day,
            "subscription_status": u.subscription_status,
            "lantern_health": u.lantern_health,
            "sparks": u.sparks,
            "streak_days": u.streak_days,
            "tribe_id": u.tribe_id,
            "created_at": u.created_at.isoformat()
        }
        for u in db.users.values()
    ]


@app.get("/api/admin/signs")
async def get_admin_signs():
    sign_log_counts = {}
    for log in db.sign_logs.values():
        sign_log_counts[log.sign_id] = sign_log_counts.get(log.sign_id, 0) + 1
    
    return [
        {
            **sign.model_dump(),
            "times_found": sign_log_counts.get(sign.id, 0)
        }
        for sign in db.signs.values()
    ]
