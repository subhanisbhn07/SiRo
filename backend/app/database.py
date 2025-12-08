from datetime import datetime, timedelta
from typing import Dict, List, Optional
import uuid
from app.models import (
    UserInDB, Sign, SignLog, Meditation, MeditationLog,
    AmbientSound, Tribe, TribeMember, DailyMessage,
    SignRarity, SubscriptionStatus
)


class InMemoryDatabase:
    def __init__(self):
        self.users: Dict[str, UserInDB] = {}
        self.users_by_email: Dict[str, str] = {}
        self.signs: Dict[str, Sign] = {}
        self.sign_logs: Dict[str, SignLog] = {}
        self.meditations: Dict[str, Meditation] = {}
        self.meditation_logs: Dict[str, MeditationLog] = {}
        self.ambient_sounds: Dict[str, AmbientSound] = {}
        self.tribes: Dict[str, Tribe] = {}
        self.tribe_members: Dict[str, TribeMember] = {}
        self.daily_messages: Dict[str, DailyMessage] = {}
        self._seed_data()

    def _seed_data(self):
        self._seed_signs()
        self._seed_meditations()
        self._seed_ambient_sounds()
        self._seed_tribes()

    def _seed_signs(self):
        signs_data = [
            # Whispered (70%) - 70 signs - everyday occurrences
            ("White Feather", "A white feather crossing your path", "New beginnings and spiritual presence", "nature"),
            ("Penny", "Finding a penny heads up", "Abundance is flowing to you", "objects"),
            ("Butterfly", "A butterfly landing nearby", "Transformation is underway", "nature"),
            ("Rainbow", "Spotting a rainbow", "Promise of better times ahead", "nature"),
            ("Ladybug", "A ladybug appearing", "Good luck is coming your way", "nature"),
            ("Four-Leaf Clover", "Finding a four-leaf clover", "Rare fortune awaits", "nature"),
            ("Shooting Star", "Witnessing a shooting star", "Your wish is being heard", "celestial"),
            ("Dragonfly", "A dragonfly hovering near", "Change and self-realization", "nature"),
            ("Cardinal", "Seeing a red cardinal", "A loved one is watching over you", "nature"),
            ("Hummingbird", "A hummingbird visiting", "Joy and lightness of being", "nature"),
            ("Deja Vu", "Experiencing deja vu", "You're on the right path", "experience"),
            ("Song on Radio", "Hearing a meaningful song", "The universe speaks through music", "media"),
            ("Cloud Shape", "Seeing a meaningful cloud shape", "Messages from above", "nature"),
            ("Repeated Numbers", "Seeing repeated numbers", "Alignment with universal energy", "numbers"),
            ("Unexpected Kindness", "Receiving unexpected kindness", "Love is all around you", "experience"),
            ("Found Object", "Finding a meaningful object", "The universe provides", "objects"),
            ("Animal Crossing", "An animal crossing your path", "Pay attention to nature's wisdom", "nature"),
            ("Sunrise Witness", "Watching a beautiful sunrise", "New opportunities await", "nature"),
            ("Sunset Glow", "Catching a stunning sunset", "Completion and gratitude", "nature"),
            ("Wind Chime", "Hearing wind chimes", "Spirits are communicating", "sound"),
            ("Bird Song", "Hearing beautiful bird song", "Joy is in the air", "sound"),
            ("Flower Bloom", "Noticing a flower blooming", "Growth is happening", "nature"),
            ("Leaf Fall", "A leaf falling before you", "Let go of what no longer serves", "nature"),
            ("Rain on Window", "Rain tapping on your window", "Cleansing and renewal", "nature"),
            ("Moonlight", "Bathing in moonlight", "Intuition is heightened", "celestial"),
            ("Star Pattern", "Recognizing a star pattern", "You are part of something greater", "celestial"),
            ("Dewdrop", "Seeing morning dewdrops", "Fresh starts are possible", "nature"),
            ("Spider Web", "Noticing an intricate spider web", "Creation and patience", "nature"),
            ("Bee Visit", "A bee visiting nearby", "Productivity and community", "nature"),
            ("Acorn", "Finding an acorn", "Great things from small beginnings", "nature"),
            ("Seashell", "Finding a seashell", "Ocean wisdom and protection", "nature"),
            ("Smooth Stone", "Finding a smooth stone", "Patience shapes all things", "nature"),
            ("Dandelion Wish", "Blowing a dandelion", "Your wishes take flight", "nature"),
            ("Echo", "Hearing an echo", "Your voice matters", "sound"),
            ("Reflection", "Seeing your reflection unexpectedly", "Self-awareness moment", "experience"),
            ("Warm Breeze", "Feeling a warm breeze", "Comfort from the universe", "nature"),
            ("Cool Breeze", "Feeling a cool breeze", "Refreshment and clarity", "nature"),
            ("Candle Flicker", "A candle flickering", "Spirit presence nearby", "objects"),
            ("Clock Sync", "Clocks showing same time", "Time alignment", "numbers"),
            ("Book Message", "Opening a book to a meaningful page", "Guidance through words", "media"),
            ("Dream Memory", "Remembering a vivid dream", "Subconscious wisdom", "experience"),
            ("Goosebumps", "Getting goosebumps for no reason", "Energy shift detected", "experience"),
            ("Ringing Ears", "Ears ringing briefly", "Frequency adjustment", "experience"),
            ("Lost and Found", "Finding something you lost", "Nothing is truly lost", "objects"),
            ("Perfect Timing", "Arriving at perfect timing", "Synchronicity in action", "experience"),
            ("Stranger Smile", "A stranger smiling at you", "Connection is everywhere", "experience"),
            ("Child Laugh", "Hearing a child laugh", "Pure joy exists", "sound"),
            ("Pet Comfort", "A pet seeking your comfort", "Unconditional love", "experience"),
            ("Plant Growth", "Noticing plant growth", "Nurturing pays off", "nature"),
            ("Water Ripple", "Watching water ripple", "Your actions create waves", "nature"),
            ("Shadow Play", "Interesting shadow patterns", "Light and dark balance", "nature"),
            ("Fog Clearing", "Fog clearing before you", "Clarity is coming", "nature"),
            ("First Snow", "Witnessing first snow", "Purity and new beginnings", "nature"),
            ("Ice Crystal", "Seeing ice crystals", "Unique beauty in details", "nature"),
            ("Moss Path", "Finding a moss-covered path", "Ancient wisdom guides", "nature"),
            ("Mushroom Ring", "Discovering a mushroom ring", "Magic is real", "nature"),
            ("Fern Unfurl", "Watching a fern unfurl", "Patience reveals beauty", "nature"),
            ("Pine Scent", "Smelling pine unexpectedly", "Grounding and presence", "nature"),
            ("Ocean Sound", "Hearing ocean in a shell", "Memory and connection", "sound"),
            ("Thunder Distant", "Hearing distant thunder", "Power approaches", "nature"),
            ("Lightning Flash", "Seeing lightning", "Illumination and insight", "nature"),
            ("Double Rainbow", "Seeing a double rainbow", "Double blessings", "nature"),
            ("Sun Rays", "Sun rays breaking through clouds", "Hope pierces darkness", "nature"),
            ("Moon Halo", "Seeing a moon halo", "Protection surrounds you", "celestial"),
            ("Firefly", "Seeing fireflies", "Light in darkness", "nature"),
            ("Owl Call", "Hearing an owl", "Wisdom calls to you", "sound"),
            ("Frog Song", "Hearing frogs singing", "Transformation song", "sound"),
            ("Cricket Chorus", "Hearing crickets", "Night magic", "sound"),
            ("Wind Whisper", "Wind seeming to whisper", "Messages on the breeze", "sound"),
            ("Leaf Spiral", "Leaves spiraling down", "Dance of release", "nature"),
            # Spoken (20%) - 20 signs - moderate awareness needed
            ("Blue Butterfly", "A blue butterfly appearing", "Rare transformation blessing", "nature"),
            ("Hawk Overhead", "A hawk circling above", "Vision and perspective", "nature"),
            ("Deer Encounter", "Encountering a deer", "Gentleness and grace", "nature"),
            ("Fox Sighting", "Spotting a fox", "Cleverness and adaptability", "nature"),
            ("Owl Sighting", "Seeing an owl in daylight", "Wisdom seeking you", "nature"),
            ("Double Numbers", "Seeing 11:11 or similar", "Portal moment", "numbers"),
            ("Name Coincidence", "Hearing your name called", "Attention needed", "experience"),
            ("Phone Sync", "Phone ringing as you think of someone", "Telepathic connection", "experience"),
            ("Dream Premonition", "Dream coming true", "Prophetic gift", "experience"),
            ("Lost Item Return", "Lost item returning unexpectedly", "Universe provides", "objects"),
            ("Stranger Message", "Stranger saying exactly what you needed", "Angel messenger", "experience"),
            ("Book Fall", "Book falling open to answer", "Written guidance", "media"),
            ("License Plate", "Meaningful license plate message", "Road signs from universe", "media"),
            ("Billboard Message", "Billboard speaking to you", "Large scale guidance", "media"),
            ("Overheard Conversation", "Overhearing relevant conversation", "Eavesdrop wisdom", "experience"),
            ("Unexpected Gift", "Receiving unexpected gift", "Abundance flows", "objects"),
            ("Weather Shift", "Weather shifting with your mood", "Nature responds to you", "nature"),
            ("Animal Behavior", "Unusual animal behavior", "Nature communicates", "nature"),
            ("Flower Gift", "Receiving flowers unexpectedly", "Love manifested", "objects"),
            ("Music Sync", "Music perfectly matching moment", "Soundtrack of life", "media"),
            # Shouted (7%) - 7 signs - noticeable synchronicities
            ("Triple Numbers", "Seeing 111, 222, 333, etc.", "Strong alignment signal", "numbers"),
            ("White Owl", "Seeing a white owl", "Rare wisdom messenger", "nature"),
            ("Meteor Shower", "Witnessing meteor shower", "Cosmic blessing", "celestial"),
            ("Aurora", "Seeing aurora lights", "Celestial dance for you", "celestial"),
            ("Eclipse Witness", "Witnessing an eclipse", "Transformation portal", "celestial"),
            ("Whale Sighting", "Seeing a whale", "Deep wisdom surfaces", "nature"),
            ("Eagle Encounter", "Eagle appearing to you", "Divine messenger", "nature"),
            # Thundered (2.5%) - 3 signs - rare moments
            ("White Deer", "Seeing a white deer", "Sacred encounter", "nature"),
            ("Perfect Alignment", "Multiple signs in one day", "Universe shouting yes", "experience"),
            ("Manifestation Proof", "Seeing your manifestation begin", "Creation in action", "experience"),
            # Cosmos-Aligned (0.5%) - 1 sign - mythic events
            ("Full Circle", "Your intention manifesting completely", "You are the creator", "experience"),
        ]

        rarity_counts = {
            SignRarity.WHISPERED: 0,
            SignRarity.SPOKEN: 0,
            SignRarity.SHOUTED: 0,
            SignRarity.THUNDERED: 0,
            SignRarity.COSMOS_ALIGNED: 0,
        }
        rarity_limits = {
            SignRarity.WHISPERED: 70,
            SignRarity.SPOKEN: 20,
            SignRarity.SHOUTED: 7,
            SignRarity.THUNDERED: 2,
            SignRarity.COSMOS_ALIGNED: 1,
        }

        day = 1
        for i, (name, description, meaning, category) in enumerate(signs_data):
            if rarity_counts[SignRarity.WHISPERED] < rarity_limits[SignRarity.WHISPERED]:
                rarity = SignRarity.WHISPERED
            elif rarity_counts[SignRarity.SPOKEN] < rarity_limits[SignRarity.SPOKEN]:
                rarity = SignRarity.SPOKEN
            elif rarity_counts[SignRarity.SHOUTED] < rarity_limits[SignRarity.SHOUTED]:
                rarity = SignRarity.SHOUTED
            elif rarity_counts[SignRarity.THUNDERED] < rarity_limits[SignRarity.THUNDERED]:
                rarity = SignRarity.THUNDERED
            else:
                rarity = SignRarity.COSMOS_ALIGNED

            rarity_counts[rarity] += 1

            emoji_map = {
                "nature": ["🪶", "🦋", "🌈", "🐞", "🍀", "🌟", "🦅", "🦌", "🦊", "🦉", "🐝", "🌸", "🍂", "🌿", "🍄", "🌲", "🐚", "🪨", "🌻", "🦎", "🐸", "🦗", "🦢", "🐋", "🦅"],
                "objects": ["🪙", "🕯️", "📦", "🎁", "💐", "🔮"],
                "celestial": ["⭐", "🌙", "☀️", "🌕", "✨", "🌌"],
                "experience": ["💫", "🎯", "💭", "🔄", "😊", "🤗", "👁️"],
                "numbers": ["🔢", "⏰", "1️⃣", "2️⃣", "3️⃣"],
                "media": ["🎵", "📖", "📺", "🎶", "📻"],
                "sound": ["🔔", "🎼", "🎵", "🦉", "🐦"],
            }
            emojis = emoji_map.get(category, ["✨"])
            emoji = emojis[i % len(emojis)]

            unlock_day = (i // 3) * 3 + 1
            if unlock_day < 1:
                unlock_day = 1

            sign_id = f"sign_{i+1}"
            self.signs[sign_id] = Sign(
                id=sign_id,
                name=name,
                emoji=emoji,
                description=description,
                meaning=meaning,
                rarity=rarity,
                unlock_day=unlock_day,
                category=category
            )

    def _seed_meditations(self):
        meditation_scripts = [
            ("Day 1: The Road Begins", "Welcome to SignRoad. Today, your journey begins.", 5, True,
             "Welcome, traveler. Close your eyes and take a deep breath. You have chosen to walk the SignRoad, a path of awareness, intention, and magic. Today, we light your Lantern for the first time. Feel its warmth in your chest. This light will guide you through the days ahead. Your first sign awaits you in the world. A white feather. When you find it, you'll know the universe is listening. Breathe deeply. You are ready."),
            ("Day 2: Breath of Awareness", "Learning to notice what's always been there.", 5, True,
             "Return to your breath. In and out. The signs have always been around you. Today, we practice seeing. Not just looking, but truly seeing. Every moment holds potential. Every coincidence is a conversation. Breathe in possibility. Breathe out doubt. Your awareness is expanding. The universe notices those who notice it."),
            ("Day 3: The Pause Between", "Finding stillness in the space between thoughts.", 6, True,
             "Today we explore the pause. The moment between inhale and exhale. The space between thoughts. In this stillness, listen for what's beneath the words. [30 seconds of silence] You just experienced the pause between thoughts. Most people panic in silence. You stayed. That's the practice. The signs speak loudest in quiet moments."),
            ("Day 4: Tribe Connection", "You are not alone on this road.", 6, True,
             "Today, you join a Tribe. Seven others walk beside you, though you may never meet. Feel their presence. Their intentions ripple alongside yours. When you meditate, they meditate. When you find signs, the collective grows stronger. Breathe with your Tribe. You are supported. You are not alone."),
            ("Day 5: Intention Amplified", "Focusing your manifestation energy.", 6, True,
             "Bring your intention to mind. What are you manifesting? See it clearly. Feel it as if it's already real. The signs you find are breadcrumbs leading to this destination. Each one confirms you're on the right path. Breathe life into your intention. The universe is rearranging itself to meet you."),
            ("Day 6: Gratitude Flow", "Appreciation opens doors.", 5, True,
             "Today we practice gratitude. For the signs you've found. For the breath in your lungs. For the courage to walk this road. Gratitude is a magnet. It attracts more of what you appreciate. List three things silently. Feel them fully. The universe responds to thankful hearts."),
            ("Day 7: Week One Complete", "Celebrating your first milestone.", 7, True,
             "You've walked seven days. Most quit by Day 3. You didn't. Feel the strength of your commitment. Your Lantern burns brighter now. Your eyes see more clearly. This week, you've begun to remember what you always knew: magic is real, and you are part of it. Rest in this knowing. Tomorrow, we go deeper."),
            ("Day 8: Deepening Roots", "Grounding your practice.", 7, False,
             "Feel your feet on the ground. Imagine roots growing from your soles, deep into the earth. You are grounded. Stable. From this foundation, your awareness can reach higher. The signs above and below are connected. You are the bridge between worlds."),
            ("Day 9: Heart Opening", "Expanding your capacity to receive.", 7, False,
             "Place your hand on your heart. Feel its rhythm. This is the drum of your journey. Today, we open the heart wider. To receive signs. To receive abundance. To receive love. Breathe into your heart space. Expand. The universe has so much to give you."),
            ("Day 10: Shadow Integration", "Embracing all parts of yourself.", 8, False,
             "Not all signs are bright. Some come from shadow. Today, we honor the parts of ourselves we hide. They too have wisdom. They too guide us. Breathe into your shadow. Thank it for its protection. Integration makes you whole."),
            ("Day 11: Time Bending", "Understanding sacred timing.", 7, False,
             "Time is not linear on the SignRoad. Past, present, and future dance together. The sign you find today may answer a question from years ago. Trust divine timing. What's meant for you cannot miss you. Breathe into timelessness."),
            ("Day 12: Mirror Work", "Seeing yourself clearly.", 8, False,
             "You are a mirror for the universe. What you see outside reflects what's inside. Today, notice what signs trigger you. What do they reveal about your inner landscape? Breathe into self-reflection. The clearest sign is always yourself."),
            ("Day 13: Energy Clearing", "Releasing what no longer serves.", 7, False,
             "Some energy clings. Old doubts. Past fears. Today, we clear the path. With each exhale, release what's heavy. With each inhale, invite lightness. Your Lantern burns cleaner now. The signs can reach you more easily."),
            ("Day 14: Trial's End", "Choosing to continue.", 8, False,
             "Fourteen days. You've proven your commitment. Today, you choose: continue as a Seeker, or let the road fade. There's no wrong choice. But know this: the signs will keep appearing whether you track them or not. The question is: do you want to remember the magic? Breathe into your decision."),
        ]

        for i, (title, description, duration, is_free, script) in enumerate(meditation_scripts):
            med_id = f"meditation_{i+1}"
            self.meditations[med_id] = Meditation(
                id=med_id,
                day=i + 1,
                title=title,
                description=description,
                duration_minutes=duration,
                audio_url=f"/audio/meditation_day_{i+1}.mp3",
                script=script,
                is_free=is_free
            )

        for day in range(15, 31):
            med_id = f"meditation_{day}"
            self.meditations[med_id] = Meditation(
                id=med_id,
                day=day,
                title=f"Day {day}: Deeper Journey",
                description=f"Continuing your path on day {day}.",
                duration_minutes=8,
                audio_url=f"/audio/meditation_day_{day}.mp3",
                script=f"Day {day} meditation script. Your journey continues to deepen. The signs become clearer. Your intention grows stronger. Breathe and trust the process.",
                is_free=False
            )

    def _seed_ambient_sounds(self):
        sounds_data = [
            ("Theta Waves", "4-7 Hz pure frequency for deep meditation", "frequency", True),
            ("Ocean Waves", "Rhythmic ocean waves for relaxation", "nature", True),
            ("Rain on Leaves", "Gentle rain falling on forest leaves", "nature", True),
            ("Crackling Fire", "Warm crackling fireplace sounds", "nature", False),
            ("Tibetan Singing Bowls", "Harmonic resonance for focus", "instrument", False),
            ("Forest Ambience", "Birds, wind, and distant water", "nature", False),
            ("Night Sounds", "Crickets and gentle breeze", "nature", False),
            ("Piano Ambient", "Minimal melodic piano", "instrument", False),
            ("Flute Meditation", "Sparse meditative flute notes", "instrument", False),
            ("Wind Chimes", "Random peaceful wind chimes", "instrument", False),
            ("River Flow", "Constant soothing river sounds", "nature", False),
            ("Pure Silence", "Subtle room tone presence", "silence", True),
        ]

        for i, (name, description, category, is_downloadable) in enumerate(sounds_data):
            sound_id = f"sound_{i+1}"
            self.ambient_sounds[sound_id] = AmbientSound(
                id=sound_id,
                name=name,
                description=description,
                audio_url=f"/audio/ambient/{name.lower().replace(' ', '_')}.mp3",
                category=category,
                is_downloadable=is_downloadable
            )

    def _seed_tribes(self):
        for i in range(10):
            tribe_id = f"tribe_{i+1}"
            self.tribes[tribe_id] = Tribe(
                id=tribe_id,
                name=f"Tribe #{i+1}",
                created_at=datetime.utcnow(),
                member_count=0,
                max_members=8
            )

    def get_available_tribe(self) -> Optional[Tribe]:
        for tribe in self.tribes.values():
            if tribe.member_count < tribe.max_members:
                return tribe
        new_tribe_id = f"tribe_{len(self.tribes) + 1}"
        new_tribe = Tribe(
            id=new_tribe_id,
            name=f"Tribe #{len(self.tribes) + 1}",
            created_at=datetime.utcnow(),
            member_count=0,
            max_members=8
        )
        self.tribes[new_tribe_id] = new_tribe
        return new_tribe


db = InMemoryDatabase()
