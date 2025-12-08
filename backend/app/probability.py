from datetime import datetime
from typing import Optional
from app.models import SignRarity, RARITY_PROBABILITIES, ProbabilityContext


TIME_MULTIPLIERS = {
    "11:11": 0.8,
    "22:22": 0.8,
    "00:00": 0.8,
    "01:11": 0.85,
    "02:22": 0.85,
    "03:33": 0.85,
    "04:44": 0.85,
    "05:55": 0.85,
    "midnight": 0.9,
    "sunrise": 0.85,
    "sunset": 0.85,
    "default": 1.0,
}

LOCATION_MULTIPLIERS = {
    "outdoors": 0.95,
    "crowded": 0.9,
    "nature": 0.85,
    "home": 1.0,
    "work": 1.0,
    "default": 1.0,
}


def get_time_multiplier(time_str: Optional[str] = None) -> float:
    if not time_str:
        now = datetime.utcnow()
        time_str = now.strftime("%H:%M")
    
    if time_str in TIME_MULTIPLIERS:
        return TIME_MULTIPLIERS[time_str]
    
    hour = int(time_str.split(":")[0]) if ":" in time_str else 12
    minute = int(time_str.split(":")[1]) if ":" in time_str else 0
    
    if hour == minute and hour in [1, 2, 3, 4, 5, 11, 22]:
        return 0.85
    
    if 5 <= hour <= 7:
        return TIME_MULTIPLIERS["sunrise"]
    if 17 <= hour <= 19:
        return TIME_MULTIPLIERS["sunset"]
    if hour == 0 or hour == 23:
        return TIME_MULTIPLIERS["midnight"]
    
    return TIME_MULTIPLIERS["default"]


def get_location_multiplier(location_type: Optional[str] = None) -> float:
    if not location_type:
        return LOCATION_MULTIPLIERS["default"]
    return LOCATION_MULTIPLIERS.get(location_type.lower(), LOCATION_MULTIPLIERS["default"])


def get_streak_bonus(streak_days: int) -> float:
    bonus = 1.0 + (streak_days // 7) * 0.05
    return min(bonus, 1.3)


def calculate_probability(
    rarity: SignRarity,
    context: Optional[ProbabilityContext] = None
) -> tuple[float, str]:
    base_probability = RARITY_PROBABILITIES[rarity]
    
    if context:
        time_multiplier = get_time_multiplier(context.time_of_day)
        location_multiplier = get_location_multiplier(context.location_type)
        streak_bonus = get_streak_bonus(context.user_streak)
    else:
        time_multiplier = 1.0
        location_multiplier = 1.0
        streak_bonus = 1.0
    
    final_probability = base_probability * time_multiplier * location_multiplier * streak_bonus
    
    final_probability = max(0.001, min(final_probability, 0.99))
    
    x = int(1 / final_probability)
    x = max(1, x)
    
    display = f"1 in {x} moments today"
    
    return final_probability, display


def get_rarity_display_name(rarity: SignRarity) -> str:
    names = {
        SignRarity.WHISPERED: "Whispered",
        SignRarity.SPOKEN: "Spoken",
        SignRarity.SHOUTED: "Shouted",
        SignRarity.THUNDERED: "Thundered",
        SignRarity.COSMOS_ALIGNED: "Cosmos-Aligned",
    }
    return names.get(rarity, "Unknown")


def get_rarity_color(rarity: SignRarity) -> str:
    colors = {
        SignRarity.WHISPERED: "#C0C0C0",
        SignRarity.SPOKEN: "#00CED1",
        SignRarity.SHOUTED: "#FFD700",
        SignRarity.THUNDERED: "#9D7BE8",
        SignRarity.COSMOS_ALIGNED: "#FF6F61",
    }
    return colors.get(rarity, "#FFFFFF")
