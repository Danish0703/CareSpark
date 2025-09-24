import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, User, LogOut, Settings, Home, Activity, Users, MessageCircle, BookOpen } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NavItem = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Public navigation items (before login)
  const publicNavItems: NavItem[] = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Book Session", href: "#booking" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" }
  ];

  // Authenticated navigation items (after login)
  const getAuthenticatedNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { label: "Dashboard", href: "/dashboard", icon: Home },
      { label: "Activities", href: "/activities", icon: Activity },
      { label: "Resources", href: "/resources", icon: BookOpen },
      { label: "Assessment", href: "/assessment", icon: Brain },
    ];

    if (profile?.role === 'counselor') {
      return [
        { label: "Dashboard", href: "/counselor-dashboard", icon: Home },
        { label: "Sessions", href: "/counselor-sessions", icon: Users },
        { label: "Resources", href: "/resources", icon: BookOpen },
      ];
    }

    if (profile?.role === 'admin') {
      return [
        { label: "Admin Panel", href: "/admin", icon: Settings },
        { label: "Monitor", href: "/admin-monitor", icon: Activity },
        { label: "Users", href: "/admin-users", icon: Users },
      ];
    }

    return [
      ...baseItems,
      { label: "Peer Support", href: "/peer-support", icon: MessageCircle },
    ];
  };

  const navItems = user ? getAuthenticatedNavItems() : publicNavItems;

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    setIsMenuOpen(false);
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      // Handle smooth scroll for anchor links
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    } else {
      // Navigate to route
      navigate(href);
    }
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-smooth">
            <div className="p-2 rounded-full bg-primary-light">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-primary">
              Mental<span className="text-wellness">Wellness</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              user ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-foreground/80 hover:text-primary transition-smooth font-medium flex items-center gap-2 ${
                    location.pathname === item.href ? 'text-primary' : ''
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className="text-foreground/80 hover:text-primary transition-smooth font-medium cursor-pointer"
                >
                  {item.label}
                </a>
              )
            ))}
          </div>

          {/* Desktop CTA Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={profile?.full_name || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-primary font-medium capitalize">
                        {profile?.role || 'User'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild variant="wellness">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-muted transition-smooth"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                user ? (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.href)}
                    className={`text-foreground/80 hover:text-primary transition-smooth font-medium px-2 py-2 text-left flex items-center gap-2 ${
                      location.pathname === item.href ? 'text-primary' : ''
                    }`}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                  </button>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-foreground/80 hover:text-primary transition-smooth font-medium px-2 py-1 cursor-pointer"
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                  >
                    {item.label}
                  </a>
                )
              ))}
              
              {user ? (
                <div className="flex flex-col space-y-2 pt-4 border-t border-border/50">
                  <div className="px-2 py-2">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-primary font-medium capitalize">{profile?.role}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleNavClick('/profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleNavClick('/settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-border/50">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button asChild variant="wellness" className="w-full">
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;