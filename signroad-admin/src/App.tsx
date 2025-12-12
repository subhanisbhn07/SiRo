import { useState, useEffect } from 'react';
import { api } from './services/api';
import type { User, Analytics, AudioLesson, DailyMessage, Sign, Page, PricingConfig, UserWithStats, AppSettings, CardVisibilitySettings } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  BarChart3, 
  Music, 
  MessageSquare, 
  Sparkles, 
  FileText, 
  DollarSign, 
  LogOut, 
  Search,
  Plus,
  Pencil,
  Trash2,
  Flame,
  Target,
  Calendar,
  Settings,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw
} from 'lucide-react';
import './App.css';

type ActivePage = 'dashboard' | 'users' | 'lessons' | 'messages' | 'signs' | 'pages' | 'pricing' | 'settings';

function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('admin@signroad.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.login(email, password);
      if (response.user.role !== 'admin') {
        setError('Admin access required');
        api.logout();
        return;
      }
      onLogin(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">SignRoad Admin</CardTitle>
          <CardDescription>Sign in to manage your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@signroad.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Sidebar({ activePage, setActivePage, onLogout }: { 
  activePage: ActivePage; 
  setActivePage: (page: ActivePage) => void;
  onLogout: () => void;
}) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'lessons' as const, label: 'Audio Lessons', icon: Music },
    { id: 'messages' as const, label: 'Daily Messages', icon: MessageSquare },
    { id: 'signs' as const, label: 'Signs Catalog', icon: Sparkles },
    { id: 'pages' as const, label: 'CMS Pages', icon: FileText },
    { id: 'pricing' as const, label: 'Pricing', icon: DollarSign },
    { id: 'settings' as const, label: 'App Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
          <Flame className="w-6 h-6" />
        </div>
        <span className="font-bold text-lg">SignRoad Admin</span>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activePage === item.id
                ? 'bg-teal-500 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
}

function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(setAnalytics).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!analytics) return <div className="p-8">Failed to load analytics</div>;

  const statCards = [
    { label: 'Total Users', value: analytics.users.total, icon: Users, color: 'bg-blue-500' },
    { label: 'On Trial', value: analytics.users.on_trial, icon: Calendar, color: 'bg-amber-500' },
    { label: 'Active Subscribers', value: analytics.users.active, icon: Target, color: 'bg-green-500' },
    { label: 'New (7 days)', value: analytics.users.new_last_7_days, icon: Plus, color: 'bg-purple-500' },
  ];

  const engagementCards = [
    { label: 'Mood Entries', value: analytics.engagement.total_mood_entries, recent: analytics.recent_activity.mood_entries_7d },
    { label: 'Journal Entries', value: analytics.engagement.total_journal_entries, recent: analytics.recent_activity.journal_entries_7d },
    { label: 'Signs Found', value: analytics.engagement.total_signs_found, recent: analytics.recent_activity.signs_found_7d },
    { label: 'Goals Created', value: analytics.engagement.total_goals },
    { label: 'Goals Achieved', value: analytics.engagement.goals_achieved },
    { label: 'Receipts Generated', value: analytics.engagement.total_receipts },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Engagement Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {engagementCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
              {'recent' in card && card.recent !== undefined && (
                <p className="text-sm text-teal-500">+{card.recent} last 7 days</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers(search || undefined);
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const viewUser = async (id: string) => {
    const data = await api.getUser(id);
    setSelectedUser(data);
    setDialogOpen(true);
  };

  const updateUserStatus = async (id: string, status: string) => {
    await api.updateUser(id, { subscription_status: status as User['subscription_status'] });
    loadUsers();
    if (selectedUser?.id === id) {
      const data = await api.getUser(id);
      setSelectedUser(data);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      free_trial: 'bg-amber-100 text-amber-800',
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-slate-100 text-slate-800',
    };
    return <Badge className={colors[status] || 'bg-slate-100'}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button type="submit" variant="outline">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lantern</TableHead>
                <TableHead>Sparks</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getStatusBadge(user.subscription_status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-amber-500" />
                      {user.lantern_health}
                    </div>
                  </TableCell>
                  <TableCell>{user.sparks}</TableCell>
                  <TableCell>{user.streak_days} days</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => viewUser(user.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedUser.subscription_status)}</div>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="font-medium capitalize">{selectedUser.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Flame className="w-6 h-6 mx-auto text-amber-500 mb-1" />
                    <p className="text-2xl font-bold">{selectedUser.lantern_health}</p>
                    <p className="text-sm text-slate-500">Lantern Health</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Sparkles className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
                    <p className="text-2xl font-bold">{selectedUser.sparks}</p>
                    <p className="text-sm text-slate-500">Sparks</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="w-6 h-6 mx-auto text-teal-500 mb-1" />
                    <p className="text-2xl font-bold">{selectedUser.streak_days}</p>
                    <p className="text-sm text-slate-500">Streak Days</p>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Label>Activity Stats</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="bg-slate-100 p-2 rounded text-center">
                    <p className="font-bold">{selectedUser.stats.mood_entries}</p>
                    <p className="text-xs text-slate-500">Moods</p>
                  </div>
                  <div className="bg-slate-100 p-2 rounded text-center">
                    <p className="font-bold">{selectedUser.stats.journal_entries}</p>
                    <p className="text-xs text-slate-500">Journals</p>
                  </div>
                  <div className="bg-slate-100 p-2 rounded text-center">
                    <p className="font-bold">{selectedUser.stats.signs_found}</p>
                    <p className="text-xs text-slate-500">Signs</p>
                  </div>
                  <div className="bg-slate-100 p-2 rounded text-center">
                    <p className="font-bold">{selectedUser.stats.goals_created}</p>
                    <p className="text-xs text-slate-500">Goals</p>
                  </div>
                  <div className="bg-slate-100 p-2 rounded text-center">
                    <p className="font-bold">{selectedUser.stats.goals_achieved}</p>
                    <p className="text-xs text-slate-500">Achieved</p>
                  </div>
                  <div className="bg-slate-100 p-2 rounded text-center">
                    <p className="font-bold">{selectedUser.stats.receipts_generated}</p>
                    <p className="text-xs text-slate-500">Receipts</p>
                  </div>
                </div>
              </div>
              <div>
                <Label>Change Status</Label>
                <div className="flex gap-2 mt-2">
                  {['free_trial', 'active', 'cancelled', 'expired'].map((status) => (
                    <Button
                      key={status}
                      variant={selectedUser.subscription_status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateUserStatus(selectedUser.id, status)}
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LessonsPage() {
  const [lessons, setLessons] = useState<AudioLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<AudioLesson | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    step_number: 1,
    title: '',
    description: '',
    audio_url: '',
    duration_seconds: 0,
    is_premium: false,
  });

  const loadLessons = async () => {
    setLoading(true);
    try {
      const data = await api.getLessons();
      setLessons(data.lessons);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const handleSave = async () => {
    if (editingLesson) {
      await api.updateLesson(editingLesson.id, formData);
    } else {
      await api.createLesson(formData);
    }
    setEditingLesson(null);
    setDialogOpen(false);
    loadLessons();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      await api.deleteLesson(id);
      loadLessons();
    }
  };

  const openEdit = (lesson: AudioLesson) => {
    setEditingLesson(lesson);
    setFormData({
      step_number: lesson.step_number,
      title: lesson.title,
      description: lesson.description,
      audio_url: lesson.audio_url,
      duration_seconds: lesson.duration_seconds,
      is_premium: lesson.is_premium,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingLesson(null);
    setFormData({
      step_number: lessons.length + 1,
      title: '',
      description: '',
      audio_url: '',
      duration_seconds: 0,
      is_premium: false,
    });
    setDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audio Lessons</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add Lesson
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Step</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>{lesson.step_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-sm text-slate-500">{lesson.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{Math.floor(lesson.duration_seconds / 60)}:{(lesson.duration_seconds % 60).toString().padStart(2, '0')}</TableCell>
                  <TableCell>
                    {lesson.is_premium ? (
                      <Badge className="bg-amber-100 text-amber-800">Premium</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Free</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(lesson)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(lesson.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingLesson(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Create Lesson'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Step Number</Label>
                <Input
                  type="number"
                  value={formData.step_number}
                  onChange={(e) => setFormData({ ...formData, step_number: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  value={formData.duration_seconds}
                  onChange={(e) => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Audio URL</Label>
              <Input
                value={formData.audio_url}
                onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_premium}
                onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
              />
              <Label>Premium Content</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessagesPage() {
  const [messages, setMessages] = useState<DailyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState<DailyMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    category: 'encouragement',
    is_active: true,
  });

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getMessages();
      setMessages(data.messages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSave = async () => {
    if (editingMessage) {
      await api.updateMessage(editingMessage.id, formData);
    } else {
      await api.createMessage(formData);
    }
    setEditingMessage(null);
    setDialogOpen(false);
    loadMessages();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      await api.deleteMessage(id);
      loadMessages();
    }
  };

  const openEdit = (message: DailyMessage) => {
    setEditingMessage(message);
    setFormData({
      content: message.content,
      category: message.category,
      is_active: message.is_active,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingMessage(null);
    setFormData({
      content: '',
      category: 'encouragement',
      is_active: true,
    });
    setDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Messages</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add Message
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{message.category}</Badge>
                      {message.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-800">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-slate-700">{message.content}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => openEdit(message)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(message.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingMessage(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMessage ? 'Edit Message' : 'Create Message'}</DialogTitle>
            <DialogDescription>Use {'{name}'} as a placeholder for the user's name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SignsPage() {
  const [signs, setSigns] = useState<Sign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSign, setEditingSign] = useState<Sign | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '',
    description: '',
    category: 'nature',
    is_active: true,
  });

  const loadSigns = async () => {
    setLoading(true);
    try {
      const data = await api.getSigns();
      setSigns(data.signs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSigns();
  }, []);

  const handleSave = async () => {
    if (editingSign) {
      await api.updateSign(editingSign.id, formData);
    } else {
      await api.createSign(formData);
    }
    setEditingSign(null);
    setDialogOpen(false);
    loadSigns();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this sign?')) {
      await api.deleteSign(id);
      loadSigns();
    }
  };

  const openEdit = (sign: Sign) => {
    setEditingSign(sign);
    setFormData({
      name: sign.name,
      emoji: sign.emoji,
      description: sign.description,
      category: sign.category,
      is_active: sign.is_active,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingSign(null);
    setFormData({
      name: '',
      emoji: '',
      description: '',
      category: 'nature',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const toggleActive = async (sign: Sign) => {
    await api.updateSign(sign.id, { is_active: !sign.is_active });
    loadSigns();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Signs Catalog</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add Sign
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signs.map((sign) => (
            <Card key={sign.id} className={!sign.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{sign.emoji}</span>
                    <div>
                      <p className="font-medium">{sign.name}</p>
                      <p className="text-sm text-slate-500">{sign.description}</p>
                      <Badge className="mt-1">{sign.category}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Switch
                      checked={sign.is_active}
                      onCheckedChange={() => toggleActive(sign)}
                    />
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => openEdit(sign)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(sign.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingSign(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSign ? 'Edit Sign' : 'Create Sign'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Emoji</Label>
                <Input
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    is_published: true,
  });

  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await api.getPages();
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleSave = async () => {
    if (editingPage) {
      await api.updatePage(editingPage.id, formData);
    } else {
      await api.createPage(formData);
    }
    setEditingPage(null);
    setDialogOpen(false);
    loadPages();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this page?')) {
      await api.deletePage(id);
      loadPages();
    }
  };

  const openEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content,
      is_published: page.is_published,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingPage(null);
    setFormData({
      slug: '',
      title: '',
      content: '',
      is_published: true,
    });
    setDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CMS Pages</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add Page
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-mono">/{page.slug}</TableCell>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    {page.is_published ? (
                      <Badge className="bg-green-100 text-green-800">Published</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-800">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(page.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(page)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(page.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingPage(null); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Edit Page' : 'Create Page'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., about, privacy, terms"
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Content (Markdown)</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label>Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PricingPage() {
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPricing = async () => {
    setLoading(true);
    try {
      const data = await api.getPricing();
      setPricing(data.pricing);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricing();
  }, []);

  const handleSave = async () => {
    if (!pricing) return;
    setSaving(true);
    try {
      await api.updatePricing(pricing);
      alert('Pricing updated successfully!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!pricing) return <div className="p-8">Failed to load pricing</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pricing Configuration</h1>
      
      <div className="max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Pricing</CardTitle>
            <CardDescription>Configure your subscription tiers and trial period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monthly Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricing.monthly_price}
                  onChange={(e) => setPricing({ ...pricing, monthly_price: parseFloat(e.target.value) })}
                />
                <p className="text-sm text-slate-500 mt-1">Angel number: $11.11</p>
              </div>
              <div>
                <Label>Annual Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricing.annual_price}
                  onChange={(e) => setPricing({ ...pricing, annual_price: parseFloat(e.target.value) })}
                />
                <p className="text-sm text-slate-500 mt-1">Angel number: $88.88</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Trial Days</Label>
                <Input
                  type="number"
                  value={pricing.trial_days}
                  onChange={(e) => setPricing({ ...pricing, trial_days: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Input
                  value={pricing.currency}
                  onChange={(e) => setPricing({ ...pricing, currency: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Pricing'}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-slate-500">Monthly</p>
                <p className="text-3xl font-bold">${pricing.monthly_price}</p>
                <p className="text-sm text-slate-500">/month</p>
              </div>
              <div className="border rounded-lg p-4 text-center bg-teal-50">
                <p className="text-sm text-teal-600">Annual (Save 33%)</p>
                <p className="text-3xl font-bold text-teal-600">${pricing.annual_price}</p>
                <p className="text-sm text-teal-600">/year</p>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">
              {pricing.trial_days}-day free trial included
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Card display names for the admin panel
const cardDisplayNames: Record<keyof CardVisibilitySettings, string> = {
  heroCarousel: 'Hero Carousel',
  todayCard: 'Today Card',
  sparksRewards: 'Sparks & Rewards',
  tribesCard: 'Your Tribe',
  latestWin: 'Latest Win',
  manifestedWins: 'Manifested Wins Feed',
  personalGreeting: 'Personal Greeting',
  exploreByIntention: 'Explore by Intention',
  startYourJourney: 'Start Your Journey',
  whatOthersLove: 'What Others Love',
  editorsPicks: "Editor's Picks",
  userStories: 'User Stories',
  blogSection: 'Blog Section',
  newsletterSignup: 'Newsletter Signup',
};

const defaultCardVisibility: CardVisibilitySettings = {
  heroCarousel: { desktop: true, tablet: true, mobile: true },
  todayCard: { desktop: true, tablet: true, mobile: true },
  sparksRewards: { desktop: true, tablet: true, mobile: true },
  tribesCard: { desktop: true, tablet: true, mobile: true },
  latestWin: { desktop: true, tablet: true, mobile: true },
  manifestedWins: { desktop: true, tablet: true, mobile: true },
  personalGreeting: { desktop: true, tablet: true, mobile: true },
  exploreByIntention: { desktop: true, tablet: true, mobile: true },
  startYourJourney: { desktop: true, tablet: true, mobile: true },
  whatOthersLove: { desktop: true, tablet: true, mobile: true },
  editorsPicks: { desktop: true, tablet: true, mobile: true },
  userStories: { desktop: true, tablet: true, mobile: true },
  blogSection: { desktop: true, tablet: true, mobile: true },
  newsletterSignup: { desktop: true, tablet: true, mobile: true },
};

function AppSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const trialOptions = [7, 14, 21, 30];

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getAppSettings();
      setSettings(data.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Use defaults if backend fails
      setSettings({
        free_trial_days: 7,
        card_visibility: defaultCardVisibility,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await api.updateAppSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const setTrialDays = (days: number) => {
    if (settings) {
      setSettings({ ...settings, free_trial_days: days });
    }
  };

  const setCardVisibility = (
    cardId: keyof CardVisibilitySettings,
    device: 'desktop' | 'tablet' | 'mobile',
    visible: boolean
  ) => {
    if (settings) {
      setSettings({
        ...settings,
        card_visibility: {
          ...settings.card_visibility,
          [cardId]: {
            ...settings.card_visibility[cardId],
            [device]: visible,
          },
        },
      });
    }
  };

  const resetCardVisibility = () => {
    if (settings) {
      setSettings({
        ...settings,
        card_visibility: defaultCardVisibility,
      });
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!settings) return <div className="p-8">Failed to load settings</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">App Settings</h1>
      
      <div className="max-w-3xl space-y-6">
        {/* Free Trial Days */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Free Trial Days
            </CardTitle>
            <CardDescription>
              Configure the number of free trial days for new users (global setting)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {trialOptions.map((days) => (
                <Button
                  key={days}
                  variant={settings.free_trial_days === days ? 'default' : 'outline'}
                  onClick={() => setTrialDays(days)}
                  className={settings.free_trial_days === days ? 'bg-teal-500 hover:bg-teal-600' : ''}
                >
                  {days} days
                </Button>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-3">
              Currently set to {settings.free_trial_days} free days for new users
            </p>
          </CardContent>
        </Card>

        {/* Card Visibility */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Homepage Card Visibility
                </CardTitle>
                <CardDescription>
                  Control which cards appear on each device type (global setting)
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={resetCardVisibility}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Device Legend */}
            <div className="flex items-center gap-6 mb-4 pb-4 border-b">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <Tablet className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Tablet</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Mobile</span>
              </div>
            </div>

            {/* Card Visibility Grid */}
            <div className="space-y-3">
              {(Object.keys(settings.card_visibility) as Array<keyof CardVisibilitySettings>).map((cardId) => (
                <div
                  key={cardId}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {cardDisplayNames[cardId]}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Desktop Toggle */}
                    <button
                      onClick={() => setCardVisibility(cardId, 'desktop', !settings.card_visibility[cardId].desktop)}
                      className={`p-2 rounded-lg transition-colors ${
                        settings.card_visibility[cardId].desktop
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                      title={`Desktop: ${settings.card_visibility[cardId].desktop ? 'Visible' : 'Hidden'}`}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    {/* Tablet Toggle */}
                    <button
                      onClick={() => setCardVisibility(cardId, 'tablet', !settings.card_visibility[cardId].tablet)}
                      className={`p-2 rounded-lg transition-colors ${
                        settings.card_visibility[cardId].tablet
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                      title={`Tablet: ${settings.card_visibility[cardId].tablet ? 'Visible' : 'Hidden'}`}
                    >
                      <Tablet className="w-4 h-4" />
                    </button>
                    {/* Mobile Toggle */}
                    <button
                      onClick={() => setCardVisibility(cardId, 'mobile', !settings.card_visibility[cardId].mobile)}
                      className={`p-2 rounded-lg transition-colors ${
                        settings.card_visibility[cardId].mobile
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                      title={`Mobile: ${settings.card_visibility[cardId].mobile ? 'Visible' : 'Hidden'}`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-sm text-emerald-700">
                <strong>Tip:</strong> Click the device icons to toggle visibility. Green = Desktop, Teal = Tablet, Gold = Mobile.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full bg-teal-500 hover:bg-teal-600">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>

        <p className="text-center text-sm text-slate-500">
          These settings are stored in the backend and apply globally to all users.
        </p>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.getMe()
        .then((user) => {
          if (user.role === 'admin') {
            setUser(user);
          } else {
            api.logout();
          }
        })
        .catch(() => api.logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />;
      case 'users': return <UsersPage />;
      case 'lessons': return <LessonsPage />;
      case 'messages': return <MessagesPage />;
      case 'signs': return <SignsPage />;
      case 'pages': return <PagesPage />;
      case 'pricing': return <PricingPage />;
      case 'settings': return <AppSettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
