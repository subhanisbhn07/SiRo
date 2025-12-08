import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Sign, UniverseReceipt } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Check, Share2, Sparkles } from 'lucide-react';

export function SignDetail() {
  const { signId } = useParams<{ signId: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [sign, setSign] = useState<Sign | null>(null);
  const [note, setNote] = useState('');
  const [locationType, setLocationType] = useState('');
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [receipt, setReceipt] = useState<UniverseReceipt | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadSign();
  }, [signId, user, navigate]);

  const loadSign = async () => {
    if (!signId) return;
    try {
      const signs = await api.getAllSigns();
      const foundSign = signs.find(s => s.id === signId);
      setSign(foundSign || null);
    } catch (err) {
      console.error('Failed to load sign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogSign = async () => {
    if (!sign) return;
    setLogging(true);
    try {
      await api.logSign(sign.id, note || undefined, locationType || undefined);
      const receiptData = await api.generateReceipt(sign.id, {
        location_type: locationType || undefined,
        user_streak: user?.streak_days || 0,
      });
      setReceipt(receiptData);
      await refreshUser();
    } catch (err) {
      console.error('Failed to log sign:', err);
    } finally {
      setLogging(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'whispered': return 'text-gray-500 bg-gray-100';
      case 'spoken': return 'text-teal bg-teal-100';
      case 'shouted': return 'text-gold bg-gold-100';
      case 'thundered': return 'text-purple bg-purple-100';
      case 'cosmos_aligned': return 'text-coral bg-coral-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center">
        <div className="animate-pulse text-teal">Loading...</div>
      </div>
    );
  }

  if (!sign) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center">
        <div className="text-center">
          <p className="text-teal-600 mb-4">Sign not found</p>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (receipt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-purple-900 to-teal-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-snow">
          <CardHeader className="text-center">
            <p className="text-xs text-teal-500 uppercase tracking-wider">Universe Receipt</p>
            <p className="text-6xl my-4">{receipt.sign_emoji}</p>
            <CardTitle className="text-2xl text-teal-800">{receipt.sign_name}</CardTitle>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(receipt.rarity)}`}>
              {receipt.rarity.replace('_', ' ')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-t border-dashed border-teal-200 pt-4">
              <p className="text-3xl font-bold text-gold text-center">
                {receipt.probability_display}
              </p>
            </div>
            <div className="text-center text-sm text-teal-600">
              <p>Found at {new Date(receipt.found_at).toLocaleTimeString()}</p>
              <p className="mt-1">Streak: {receipt.user_streak} days</p>
            </div>
            <div className="border-t border-dashed border-teal-200 pt-4 text-center">
              <p className="text-xs text-teal-400">Receipt #{receipt.receipt_id}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const text = `I found a ${receipt.sign_name} ${receipt.sign_emoji} on SignRoad! ${receipt.probability_display}. #SignRoad #UniverseReceipt`;
                  navigator.clipboard.writeText(text);
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Link to="/dashboard" className="flex-1">
                <Button className="w-full bg-teal hover:bg-teal-600">
                  Continue
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-snow to-teal-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-teal-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-teal-600 hover:text-teal-800">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <p className="text-6xl mb-4">{sign.emoji}</p>
            <CardTitle className="text-2xl text-teal-800">{sign.name}</CardTitle>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(sign.rarity)}`}>
              {sign.rarity.replace('_', ' ')}
            </div>
            <CardDescription className="mt-4 text-lg">
              {sign.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-teal-50 rounded-lg p-4">
              <h3 className="font-semibold text-teal-800 mb-2">Meaning</h3>
              <p className="text-teal-700">{sign.meaning}</p>
            </div>

            <div className="border-t border-teal-100 pt-6">
              <h3 className="font-semibold text-teal-800 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-sage" />
                Found this sign?
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Where did you find it?</Label>
                  <Select value={locationType} onValueChange={setLocationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">At Home</SelectItem>
                      <SelectItem value="work">At Work</SelectItem>
                      <SelectItem value="outdoors">Outdoors</SelectItem>
                      <SelectItem value="nature">In Nature</SelectItem>
                      <SelectItem value="crowded">Crowded Place</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Add a note (optional)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Describe your experience..."
                    className="min-h-24"
                  />
                </div>

                <Button
                  onClick={handleLogSign}
                  className="w-full bg-sage hover:bg-sage-600"
                  disabled={logging}
                >
                  {logging ? (
                    'Generating Receipt...'
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      I Found It! (+5 Sparks)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
