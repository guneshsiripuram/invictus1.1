import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Account created! Welcome to INVICTUS');
        navigate('/');
      } else {
        toast.success('Account created! Please check your email to confirm.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-blue-900/20 to-background p-4">
      <div className="glass-pane p-8 rounded-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-3xl font-bold glowing-text">INVICTUS</h1>
          <p className="text-primary mt-2">Access The Future of Education</p>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="font-orbitron text-xl font-semibold text-center text-primary">Sign In</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="mt-1 bg-background/70 border-input focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-muted-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="mt-1 bg-background/70 border-input focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Remember me
                  </label>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/30 font-orbitron uppercase tracking-wide"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              Access System
            </Button>
            <div className="text-center">
              <span className="text-muted-foreground text-sm">New to INVICTUS?</span>
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLogin(false)}
                className="text-primary hover:underline ml-1 font-medium"
              >
                Create Account
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-6">
            <h2 className="font-orbitron text-xl font-semibold text-center text-primary">Create Account</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullname" className="text-muted-foreground">Full Name</Label>
                <Input
                  id="fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="mt-1 bg-background/70 border-input focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="signup-email" className="text-muted-foreground">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="mt-1 bg-background/70 border-input focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="signup-password" className="text-muted-foreground">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  required
                  minLength={6}
                  className="mt-1 bg-background/70 border-input focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/30 font-orbitron uppercase tracking-wide"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              Create Account
            </Button>
            <div className="text-center">
              <span className="text-muted-foreground text-sm">Already have an account?</span>
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLogin(true)}
                className="text-primary hover:underline ml-1 font-medium"
              >
                Sign In
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}