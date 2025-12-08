import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Sparkles, ArrowRight } from 'lucide-react';

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [intention, setIntention] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.completeOnboarding(name, intention);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-snow/95 backdrop-blur">
        {step === 1 && (
          <>
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-teal rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-teal-900">The Road Begins</CardTitle>
              <CardDescription className="text-lg">
                You'll meditate, find signs, and track magic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-teal-800">What should we call you?</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="text-lg"
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                className="w-full bg-teal hover:bg-teal-600"
                disabled={!name.trim()}
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-teal-900">Set Your Intention</CardTitle>
              <CardDescription className="text-lg">
                What are you manifesting, {name}?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="intention" className="text-teal-800">
                  Write your intention in one sentence
                </Label>
                <Textarea
                  id="intention"
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="I am manifesting..."
                  className="text-lg min-h-24"
                  maxLength={200}
                />
                <p className="text-sm text-teal-500 text-right">
                  {intention.length}/200
                </p>
              </div>
              <Button
                onClick={() => setStep(3)}
                className="w-full bg-teal hover:bg-teal-600"
                disabled={!intention.trim()}
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal to-gold rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Flame className="w-12 h-12 text-white" />
              </div>
              <CardTitle className="text-2xl text-teal-900">Your Lantern Ignites</CardTitle>
              <CardDescription className="text-lg">
                This light will guide you through the days ahead.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-teal-50 rounded-lg p-4 text-center">
                <p className="text-teal-800">
                  Every 3 days, a new sign unlocks. Today, your first sign awaits:
                </p>
                <p className="text-3xl mt-2">🪶</p>
                <p className="text-xl font-semibold text-teal-900 mt-2">White Feather</p>
                <p className="text-teal-600 text-sm mt-1">Find it in the world around you.</p>
              </div>
              <Button
                onClick={handleComplete}
                className="w-full bg-gold hover:bg-gold-600 text-teal-900"
                disabled={loading}
              >
                {loading ? 'Starting...' : 'Begin Your Journey'}
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
