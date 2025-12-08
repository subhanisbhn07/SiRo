import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Flame, Sparkles, Users, Eye } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-snow">
      <nav className="fixed top-0 left-0 right-0 bg-snow/80 backdrop-blur-sm z-50 border-b border-teal-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-teal" />
            <span className="text-xl font-bold text-teal-800">SignRoad</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-teal-700 hover:text-teal-900">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-teal hover:bg-teal-600 text-white">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-teal-900 mb-6">
            Your signs are waiting.
          </h1>
          <p className="text-xl text-teal-700 mb-8 max-w-2xl mx-auto">
            A guided journey of meditation, manifestation, and meaningful coincidences. 
            Find the signs the universe is sending you.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-teal hover:bg-teal-600 text-white text-lg px-8 py-6">
              14 Days Free
            </Button>
          </Link>
          <p className="text-sm text-teal-600 mt-4">No credit card required</p>
        </div>
      </section>

      <section className="py-20 px-4 bg-teal-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-teal-900 text-center mb-12">
            How SignRoad Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-teal-800 mb-2">Light Your Lantern</h3>
              <p className="text-teal-600">
                Daily meditations keep your awareness bright and your path illuminated.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-teal-800 mb-2">Find Your Signs</h3>
              <p className="text-teal-600">
                Receive daily sign challenges. When you find them, log your discovery.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-teal-800 mb-2">Earn Sparks</h3>
              <p className="text-teal-600">
                Every meditation and sign found earns you Sparks, tracking your journey.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-teal-800 mb-2">Join a Tribe</h3>
              <p className="text-teal-600">
                Walk alongside 7 others. Accountability without pressure.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-teal-900 text-center mb-12">
            The Universe Receipt
          </h2>
          <div className="bg-gradient-to-br from-teal-50 to-purple-50 rounded-2xl p-8 shadow-lg">
            <div className="bg-white rounded-xl p-6 max-w-sm mx-auto shadow-md">
              <div className="text-center">
                <p className="text-xs text-teal-500 uppercase tracking-wider mb-2">Universe Receipt</p>
                <p className="text-4xl mb-2">🦋</p>
                <h3 className="text-xl font-bold text-teal-800">Blue Butterfly</h3>
                <p className="text-purple font-medium text-sm">Shouted Tier</p>
                <div className="border-t border-dashed border-teal-200 my-4"></div>
                <p className="text-2xl font-bold text-gold">1 in 16 moments today</p>
                <p className="text-sm text-teal-600 mt-2">Found at 11:11 AM</p>
                <p className="text-xs text-teal-400 mt-4">Receipt #A7B3C2D1</p>
              </div>
            </div>
            <p className="text-center text-teal-700 mt-6 max-w-md mx-auto">
              Every sign you find generates a shareable receipt showing just how rare your moment was.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to walk the road?
          </h2>
          <p className="text-teal-200 mb-8 text-lg">
            Start your 14-day free trial. No credit card required.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-gold hover:bg-gold-600 text-teal-900 text-lg px-8 py-6">
              Begin Your Journey
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-8 px-4 bg-teal-950 text-teal-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Flame className="w-6 h-6" />
            <span className="font-bold">SignRoad</span>
          </div>
          <p className="text-sm">
            &copy; 2024 SignRoad. Walk your path.
          </p>
        </div>
      </footer>
    </div>
  );
}
