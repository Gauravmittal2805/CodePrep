import { Button } from "@/components/ui/button";
import { Code2, Menu, X, LogOut, User as UserIcon, Lock, Trophy, Layout, BrainCircuit, Users, BarChart3, Target, ChevronDown, Calendar, History, Flame } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import LoginForm from "../auth/LoginForm";
import AdminLoginForm from "../auth/AdminLoginForm";
import RegisterForm from "../auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
  isRegisterOpen: boolean;
  setIsRegisterOpen: (open: boolean) => void;
}

const Navbar = ({
  isLoginOpen,
  setIsLoginOpen,
  isRegisterOpen,
  setIsRegisterOpen,
}: NavbarProps) => {
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout: authLogout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await authLogout();
      navigate('/'); // Navigate to home page after logout
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const navLinks = [
    { name: "Problems", href: "/problems", icon: Layout },
    {
      name: "Contest",
      href: "/contest",
      icon: Trophy,
      subItems: [
        { name: "Live Contests", href: "/contest?tab=ongoing", icon: Flame, description: "Competing in real-time" },
        { name: "Upcoming", href: "/contest?tab=upcoming", icon: Calendar, description: "Register for future events" },
        { name: "Past Events", href: "/contest?tab=ended", icon: History, description: "Virtual participation & results" },
        { name: "Invite Only", href: "/contest?tab=private", icon: Lock, description: "Private & recursive events" },
      ]
    },
    { name: "Companies", href: "/companies", icon: Target, tooltip: "Prepare company-specific questions, OA patterns & mock interviews" },
    { name: "Mock OA", href: "/mock-oa", icon: BrainCircuit },
    { name: "Interview", href: "/interview", icon: Users, isNew: true },
    { name: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
  ];

  const handleSignInClick = () => {
    setIsLoginOpen(true);
    setIsOpen(false);
  };

  const handleGetStartedClick = () => {
    setIsRegisterOpen(true);
    setIsOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      setIsLoginOpen(true);
      setIsOpen(false);
    } else {
      navigate(href);
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">CodePrep</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Tooltip key={link.name}>
                  {link.subItems ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2 group/nav relative cursor-pointer outline-none">
                          <link.icon className="w-4 h-4 group-hover/nav:text-primary transition-colors" />
                          <span className="text-sm font-medium">{link.name}</span>
                          <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/nav:rotate-180 duration-200" />
                          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover/nav:w-full transition-all duration-300 rounded-full" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 bg-background/95 backdrop-blur-xl border-border/50 p-2 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200" align="start">
                        {link.subItems.map((sub) => (
                          <DropdownMenuItem
                            key={sub.name}
                            onClick={(e) => handleNavClick(e, sub.href)}
                            className="flex items-center gap-4 p-3 cursor-pointer rounded-xl focus:bg-primary/5 group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <sub.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground">{sub.name}</span>
                              <span className="text-[10px] text-muted-foreground leading-tight">{sub.description}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <TooltipTrigger asChild>
                      <div
                        onClick={(e) => handleNavClick(e, link.href)}
                        className="text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-3 group/nav relative cursor-pointer"
                      >
                        <link.icon className="w-4 h-4 group-hover/nav:text-primary transition-colors" />
                        <span className="text-sm font-medium">{link.name}</span>
                        {link.isNew && (
                          <span className="absolute -top-2 -right-4 px-1 py-0.5 rounded-[4px] bg-primary/20 text-primary text-[8px] font-bold uppercase tracking-tight border border-primary/20 animate-pulse">
                            New
                          </span>
                        )}
                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover/nav:w-full transition-all duration-300 rounded-full" />
                      </div>
                    </TooltipTrigger>
                  )}
                  {link.tooltip && (
                    <TooltipContent side="bottom" className="bg-secondary/90 backdrop-blur-md border-primary/20 text-foreground">
                      <p className="text-xs font-medium">{link.tooltip}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </div>

            {/* Desktop CTA / Profile */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => {
                      if (isAdmin) {
                        navigate('/admin');
                      } else {
                        navigate('/dashboard');
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 cursor-pointer hover:bg-secondary/70 transition-colors"
                    title={isAdmin ? 'Go to Admin Dashboard' : 'Go to User Dashboard'}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ""} className="w-full h-full rounded-full" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {user.displayName}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={handleSignInClick}>
                    Sign In
                  </Button>
                  <Button variant="default" size="sm" onClick={handleGetStartedClick}>
                    Get Started
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/50 text-primary hover:bg-primary/10 flex items-center gap-1"
                    onClick={() => {
                      setIsAdminLoginOpen(true);
                      setIsOpen(false);
                    }}
                  >
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    Admin
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-border/50 animate-fade-up">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    <div
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <link.icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1 font-medium">{link.name}</span>
                      {link.isNew && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-bold uppercase">
                          New
                        </span>
                      )}
                    </div>
                    {link.subItems && (
                      <div className="ml-10 mt-1 mb-2 space-y-1">
                        {link.subItems.map((sub) => (
                          <div
                            key={sub.name}
                            onClick={(e) => handleNavClick(e, sub.href)}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg text-muted-foreground hover:bg-secondary/20 transition-all cursor-pointer"
                          >
                            <sub.icon className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{sub.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                  {user ? (
                    <div className="flex flex-col gap-4 px-2">
                      <div
                        onClick={() => {
                          if (isAdmin) {
                            navigate('/admin');
                          } else {
                            navigate('/dashboard');
                          }
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-secondary/30 p-2 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName || ""} className="w-full h-full rounded-full" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{user.displayName}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { logout(); setIsOpen(false); }} className="w-full justify-start text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleSignInClick}>
                        Sign In
                      </Button>
                      <Button variant="default" size="sm" onClick={handleGetStartedClick}>
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login Drawer */}
      <Sheet open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <SheetContent side="right" className="sm:max-w-md border-l border-primary/20">
          <SheetHeader className="sr-only">
            <SheetTitle>Sign In</SheetTitle>
            <SheetDescription>Access your account</SheetDescription>
          </SheetHeader>
          <LoginForm
            onSignUpClick={() => {
              setIsLoginOpen(false);
              setIsRegisterOpen(true);
            }}
            onSuccess={() => setIsLoginOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Register Side Drawer */}
      <Sheet open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <SheetContent side="right" className="sm:max-w-md border-l border-primary/20">
          <SheetHeader className="sr-only">
            <SheetTitle>Sign Up</SheetTitle>
            <SheetDescription>Create an account</SheetDescription>
          </SheetHeader>
          <RegisterForm
            onSignInClick={() => {
              setIsRegisterOpen(false);
              setIsLoginOpen(true);
            }}
            onSuccess={() => setIsRegisterOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Admin Login Sheet */}
      {isAdminLoginOpen && (
        <Sheet open={isAdminLoginOpen} onOpenChange={setIsAdminLoginOpen}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Admin Login</SheetTitle>
              <SheetDescription>
                Access the admin dashboard with your admin credentials
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <AdminLoginForm onSuccess={() => setIsAdminLoginOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default Navbar;
