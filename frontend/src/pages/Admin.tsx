import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Users, Eye, Music, BarChart3, Settings, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AdminStats {
  total_users: number;
  trial_users: number;
  total_sign_logs: number;
  total_meditation_logs: number;
  active_tribes: number;
  total_signs: number;
  total_meditations: number;
  total_sounds: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  current_day: number;
  subscription_status: string;
  lantern_health: number;
  sparks: number;
  streak_days: number;
  tribe_id: string | null;
  created_at: string;
}

interface AdminSign {
  id: string;
  name: string;
  emoji: string;
  rarity: string;
  unlock_day: number;
  times_found: number;
}

type TabType = 'dashboard' | 'users' | 'signs' | 'meditations' | 'sounds';

export default function Admin() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [signs, setSigns] = useState<AdminSign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await fetch(`${API_URL}/api/admin/stats`);
        const data = await res.json();
        setStats(data);
      } else if (activeTab === 'users') {
        const res = await fetch(`${API_URL}/api/admin/users`);
        const data = await res.json();
        setUsers(data);
      } else if (activeTab === 'signs') {
        const res = await fetch(`${API_URL}/api/admin/signs`);
        const data = await res.json();
        setSigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
    { id: 'users' as TabType, label: 'Users', icon: Users },
    { id: 'signs' as TabType, label: 'Signs', icon: Eye },
    { id: 'meditations' as TabType, label: 'Meditations', icon: Flame },
    { id: 'sounds' as TabType, label: 'Sounds', icon: Music },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'whispered': return 'text-gray-600';
      case 'spoken': return 'text-blue-600';
      case 'shouted': return 'text-purple-600';
      case 'thundered': return 'text-orange-600';
      case 'cosmos_aligned': return 'text-gold-500';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-teal-700 text-white">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Flame className="h-8 w-8" />
            <span className="text-xl font-bold">SignRoad Admin</span>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white'
                    : 'text-teal-100 hover:bg-teal-600/50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 w-64 p-6 border-t border-teal-600">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 text-teal-100 hover:bg-teal-600/50 rounded-lg mb-2"
          >
            <Settings className="h-5 w-5" />
            Back to App
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-teal-100 hover:bg-teal-600/50 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {tabs.find(t => t.id === activeTab)?.label}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-teal-600">{stats.total_users}</div>
                    <p className="text-sm text-gray-500">{stats.trial_users} on trial</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Signs Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gold-500">{stats.total_sign_logs}</div>
                    <p className="text-sm text-gray-500">{stats.total_signs} signs available</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Meditations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">{stats.total_meditation_logs}</div>
                    <p className="text-sm text-gray-500">{stats.total_meditations} sessions available</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Active Tribes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-sage-600">{stats.active_tribes}</div>
                    <p className="text-sm text-gray-500">{stats.total_sounds} ambient sounds</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Lantern</TableHead>
                        <TableHead>Sparks</TableHead>
                        <TableHead>Streak</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.name || '-'}</TableCell>
                          <TableCell>{user.current_day}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.subscription_status === 'trial'
                                ? 'bg-yellow-100 text-yellow-800'
                                : user.subscription_status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.subscription_status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-teal-500"
                                  style={{ width: `${user.lantern_health}%` }}
                                />
                              </div>
                              <span className="text-sm">{user.lantern_health}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.sparks}</TableCell>
                          <TableCell>{user.streak_days}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No users yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Signs Tab */}
            {activeTab === 'signs' && (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sign</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Rarity</TableHead>
                        <TableHead>Unlock Day</TableHead>
                        <TableHead>Times Found</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {signs.map((sign) => (
                        <TableRow key={sign.id}>
                          <TableCell className="text-2xl">{sign.emoji}</TableCell>
                          <TableCell className="font-medium">{sign.name}</TableCell>
                          <TableCell>
                            <span className={`font-medium capitalize ${getRarityColor(sign.rarity)}`}>
                              {sign.rarity.replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell>Day {sign.unlock_day}</TableCell>
                          <TableCell>{sign.times_found}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Meditations Tab */}
            {activeTab === 'meditations' && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500">
                    Meditation content management coming soon. Currently {stats?.total_meditations || 0} meditations available.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Sounds Tab */}
            {activeTab === 'sounds' && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500">
                    Ambient sounds management coming soon. Currently {stats?.total_sounds || 0} sounds available.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
