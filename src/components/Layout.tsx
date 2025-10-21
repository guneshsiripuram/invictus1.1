import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U';
    return user.user_metadata.full_name.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen">
      <header className="glass-pane border-b border-primary/30 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="font-orbitron text-2xl font-bold glowing-text cursor-pointer" onClick={() => navigate('/')}>
              INVICTUS
            </h1>
            <nav className="hidden md:flex space-x-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className={`font-medium transition-colors border-b-2 rounded-none ${
                  isActive('/') 
                    ? 'text-primary border-primary' 
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                Generate
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className={`font-medium transition-colors border-b-2 rounded-none ${
                  isActive('/dashboard') 
                    ? 'text-primary border-primary' 
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                Dashboard
              </Button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground hidden sm:block">
              Welcome, <span className="text-primary font-semibold">{getDisplayName()}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="text-sm font-bold font-orbitron">{getInitials()}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-pane border-primary/30">
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:bg-destructive/20 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}