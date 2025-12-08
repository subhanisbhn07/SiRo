import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Sign, DailyMessage, TribeStats } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Sparkles, Users, Eye, LogOut, Calendar, Zap } from 'lucide-react';

export function Dashboard() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [signs, setSigns] = useState<Sign[]>([]);
  const [dailyMessage, setDailyMessage] = useState<DailyMessage | null>(null);
  const [tribeStats, setTribeStats] = useState<TribeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.onboarding_completed) {
      navigate('/onboarding');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [signsData, messageData] = await Promise.all([
        api.getAvailableSigns(),
        api.getDailyMessage(),
      ]);
      setSigns(signsData);
      setDailyMessage(messageData);

      if (user?.tribe_id) {
        const stats = await api.getTribeStats();
        setTribeStats(stats);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTribe = async () => {
    try {
      const stats = await api.joinTribe();
      setTribeStats(stats);
      await refreshUser();
    } catch (err) {
      console.error('Failed to join tribe:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center">
        <div className="animate-pulse">
          <Flame className="w-16 h-16 text-teal" />
        </div>
      </div>
    );
  }

  const lanternGlow = user.lantern_health >= 80 ? 'shadow-lg shadow-gold/50' : 
                      user.lantern_health >= 50 ? 'shadow-md shadow-gold/30' : 
                      'shadow-sm shadow-gold/10';

  return (
    <div className="min-h-screen bg-gradient-to-br from-snow to-teal-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-teal-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-teal" />
            <span className="text-xl font-bold text-teal-800">SignRoad</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gold-50 px-3 py-1 rounded-full">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="font-semibold text-gold-700">{user.sparks}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {dailyMessage && (
              <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0">
                <CardContent className="p-6">
                  <p className="text-lg italic">"{dailyMessage.message}"</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-teal" />
                  Today's Signs
                </CardTitle>
                <CardDescription>
                  Find these signs in the world around you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {signs.map((sign) => (
                    <Link key={sign.id} to={`/sign/${sign.id}`}>
                      <div className="bg-teal-50 hover:bg-teal-100 rounded-xl p-4 text-center transition-colors cursor-pointer">
                        <p className="text-4xl mb-2">{sign.emoji}</p>
                        <h3 className="font-semibold text-teal-800">{sign.name}</h3>
                        <p className="text-xs text-teal-600 capitalize mt-1">
                          {sign.rarity.replace('_', ' ')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Link to="/meditate">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-teal-200">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-teal-800">Daily Meditation</h3>
                    <p className="text-teal-600">Day {user.current_day} awaits</p>
                  </div>
                  <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center">
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="space-y-6">
            <Card className={`${lanternGlow}`}>
              <CardHeader className="text-center pb-2">
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center ${user.lantern_health >= 80 ? 'animate-pulse' : ''}`}>
                  <Flame className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-teal-800">Your Lantern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-teal-600">Health</span>
                    <span className="font-semibold text-teal-800">{user.lantern_health}%</span>
                  </div>
                  <Progress value={user.lantern_health} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-teal-50 rounded-lg p-3">
                    <Calendar className="w-5 h-5 text-teal mx-auto mb-1" />
                    <p className="text-2xl font-bold text-teal-800">{user.current_day}</p>
                    <p className="text-xs text-teal-600">Day</p>
                  </div>
                  <div className="bg-gold-50 rounded-lg p-3">
                    <Zap className="w-5 h-5 text-gold mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gold-700">{user.streak_days}</p>
                    <p className="text-xs text-gold-600">Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-sage" />
                  Your Tribe
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tribeStats ? (
                  <div className="space-y-3">
                    <p className="text-sm text-teal-600">{tribeStats.tribe_name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {Array.from({ length: tribeStats.total_members }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${
                              i < tribeStats.meditated_today
                                ? 'bg-sage text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-teal-700">
                      <span className="font-semibold">{tribeStats.meditated_today}</span> of{' '}
                      <span className="font-semibold">{tribeStats.total_members}</span> meditated today
                    </p>
                  </div>
                ) : user.current_day >= 4 ? (
                  <Button onClick={handleJoinTribe} className="w-full bg-sage hover:bg-sage-600">
                    Join a Tribe
                  </Button>
                ) : (
                  <p className="text-sm text-teal-600 text-center">
                    Tribes unlock on Day 4
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
