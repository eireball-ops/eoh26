import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, User } from "lucide-react";
import logoImg from "@assets/image_1770905634562.png";

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          {/* Static image for logo */}
          <div className="relative w-12 h-12 overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5 bg-white p-1">
            <img 
              src={logoImg} 
              alt="Milano Maribor 2026 Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-display font-bold text-xl md:text-2xl text-foreground tracking-tight hidden sm:block">
            milano maribor 2026
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold">{user?.firstName} {user?.lastName}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                {user?.profileImageUrl ? (
                  <AvatarImage src={user.profileImageUrl} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                )}
              </Avatar>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logout()}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <a href="/api/login">
              <Button className="bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
