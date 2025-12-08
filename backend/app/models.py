from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class SignRarity(str, Enum):
    WHISPERED = "whispered"
    SPOKEN = "spoken"
    SHOUTED = "shouted"
    THUNDERED = "thundered"
    COSMOS_ALIGNED = "cosmos_aligned"


RARITY_PROBABILITIES = {
    SignRarity.WHISPERED: 0.70,
    SignRarity.SPOKEN: 0.20,
    SignRarity.SHOUTED: 0.07,
    SignRarity.THUNDERED: 0.025,
    SignRarity.COSMOS_ALIGNED: 0.005,
}


class SubscriptionStatus(str, Enum):
    TRIAL = "trial"
    ACTIVE = "active"
    CANCELED = "canceled"
    EXPIRED = "expired"


class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserOnboarding(BaseModel):
    name: str
    intention: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    intention: Optional[str] = None
    current_day: int = 1
    lantern_health: int = 100
    sparks: int = 0
    streak_days: int = 0
    subscription_status: SubscriptionStatus = SubscriptionStatus.TRIAL
    trial_end_date: Optional[datetime] = None
    tribe_id: Optional[str] = None
    onboarding_completed: bool = False
    created_at: datetime
    last_meditation_date: Optional[datetime] = None


class UserInDB(UserResponse):
    hashed_password: str


class Sign(BaseModel):
    id: str
    name: str
    emoji: str
    description: str
    meaning: str
    rarity: SignRarity
    unlock_day: int
    category: str


class SignLog(BaseModel):
    id: str
    user_id: str
    sign_id: str
    found_at: datetime
    note: Optional[str] = None
    location_type: Optional[str] = None
    sparks_earned: int = 5


class SignLogCreate(BaseModel):
    sign_id: str
    note: Optional[str] = None
    location_type: Optional[str] = None


class UniverseReceipt(BaseModel):
    sign_name: str
    sign_emoji: str
    rarity: SignRarity
    found_at: datetime
    probability_display: str
    user_streak: int
    receipt_id: str


class Meditation(BaseModel):
    id: str
    day: int
    title: str
    description: str
    duration_minutes: int
    audio_url: Optional[str] = None
    script: str
    is_free: bool = True


class MeditationLog(BaseModel):
    id: str
    user_id: str
    meditation_id: str
    completed_at: datetime
    duration_seconds: int
    sparks_earned: int = 10


class MeditationLogCreate(BaseModel):
    meditation_id: str
    duration_seconds: int


class AmbientSound(BaseModel):
    id: str
    name: str
    description: str
    audio_url: str
    category: str
    is_downloadable: bool = False


class Tribe(BaseModel):
    id: str
    name: str
    created_at: datetime
    member_count: int = 0
    max_members: int = 8


class TribeMember(BaseModel):
    user_id: str
    tribe_id: str
    joined_at: datetime
    meditated_today: bool = False


class TribeStats(BaseModel):
    tribe_id: str
    tribe_name: str
    total_members: int
    meditated_today: int
    member_streaks: List[int]


class DailyMessage(BaseModel):
    id: str
    user_id: str
    message: str
    category: str
    generated_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None


class ProbabilityContext(BaseModel):
    time_of_day: Optional[str] = None
    location_type: Optional[str] = None
    user_streak: int = 0


class ReceiptRequest(BaseModel):
    sign_id: str
    context: Optional[ProbabilityContext] = None
