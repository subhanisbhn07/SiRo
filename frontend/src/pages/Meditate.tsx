import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Meditation, AmbientSound } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Play, Pause, Volume2, Flame, Sparkles, Check } from 'lucide-react';

export function Meditate() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [meditation, setMeditation] = useState<Meditation | null>(null);
  const [sounds, setSounds] = useState<AmbientSound[]>([]);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [meditationData, soundsData] = await Promise.all([
        api.getTodayMeditation(),
        api.getAllSounds(),
      ]);
      setMeditation(meditationData);
      setSounds(soundsData);
    } catch (err) {
      console.error('Failed to load meditation:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setIsPlaying(false);
    } else {
      if (progress === 0) {
        startTimeRef.current = Date.now();
      }
      setIsPlaying(true);
      timerRef.current = setInterval(() => {
        if (meditation) {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          const totalSeconds = meditation.duration_minutes * 60;
          const newProgress = Math.min((elapsed / totalSeconds) * 100, 100);
          setProgress(newProgress);
          
          if (newProgress >= 100) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setIsPlaying(false);
          }
        }
      }, 100);
    }
  };

  const handleComplete = async () => {
    if (!meditation) return;
    setCompleting(true);
    try {
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      await api.completeMeditation(meditation.id, durationSeconds);
      await refreshUser();
      setCompleted(true);
    } catch (err) {
      console.error('Failed to complete meditation:', err);
    } finally {
      setCompleting(false);
    }
  };

  const formatTime = (percentage: number, totalMinutes: number) => {
    const totalSeconds = totalMinutes * 60;
    const currentSeconds = Math.floor((percentage / 100) * totalSeconds);
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = currentSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 to-purple-900 flex items-center justify-center">
        <div className="animate-pulse">
          <Flame className="w-16 h-16 text-gold" />
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-purple-900 to-teal-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-snow text-center">
          <CardHeader>
            <div className="w-24 h-24 bg-sage rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-2xl text-teal-800">Meditation Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gold-50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-gold" />
                <span className="text-2xl font-bold text-gold-700">+10 Sparks</span>
              </div>
            </div>
            <p className="text-teal-600">
              Your Lantern burns brighter. Now go find your signs.
            </p>
            <Link to="/dashboard">
              <Button className="w-full bg-teal hover:bg-teal-600">
                Continue Your Journey
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!meditation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-snow text-center">
          <CardContent className="p-6">
            <p className="text-teal-600 mb-4">No meditation available</p>
            <Link to="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-purple-900 to-teal-900">
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mb-6 ${isPlaying ? 'animate-pulse' : ''}`}>
            <Flame className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{meditation.title}</h1>
          <p className="text-white/70">{meditation.description}</p>
        </div>

        <Card className="bg-white/10 backdrop-blur border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-white/60 mt-2">
                <span>{formatTime(progress, meditation.duration_minutes)}</span>
                <span>{meditation.duration_minutes}:00</span>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <button
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-gold hover:bg-gold-600 flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-teal-900" />
                ) : (
                  <Play className="w-10 h-10 text-teal-900 ml-1" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <Volume2 className="w-5 h-5 text-white/60" />
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur border-white/20 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Background Sounds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {sounds.slice(0, 6).map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => setSelectedSound(selectedSound === sound.id ? null : sound.id)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    selectedSound === sound.id
                      ? 'bg-teal text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <p className="text-sm font-medium truncate">{sound.name}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white/80 text-sm">Meditation Script</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
              {meditation.script}
            </p>
          </CardContent>
        </Card>

        {progress >= 80 && (
          <div className="mt-6">
            <Button
              onClick={handleComplete}
              className="w-full bg-sage hover:bg-sage-600 text-white py-6 text-lg"
              disabled={completing}
            >
              {completing ? 'Completing...' : 'Complete Meditation (+10 Sparks)'}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
