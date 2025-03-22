import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Home,
  User,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Calendar,
  HelpCircle,
  LogIn,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie!",
        description: "Vous avez été déconnecté avec succès.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description:
          error.message || "Impossible de se déconnecter pour le moment.",
        variant: "destructive",
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="bg-background/95 backdrop-blur sticky top-0 z-50 border-b">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="font-bold text-xl hover:text-primary transition-colors">
          MyOrientation
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-primary transition-colors flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Accueil</span>
          </Link>
          <Link to="/tests" className="hover:text-primary transition-colors flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Tests</span>
          </Link>
          <Link to="/formations" className="hover:text-primary transition-colors flex items-center space-x-2">
            <GraduationCap className="h-4 w-4" />
            <span>Formations</span>
          </Link>
          <Link to="/coaching" className="hover:text-primary transition-colors flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Coaching</span>
          </Link>
          <Link to="/evenements" className="hover:text-primary transition-colors flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Événements</span>
          </Link>
          <Link to="/aide" className="hover:text-primary transition-colors flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>Aide</span>
          </Link>
        </nav>

        {/* Authentication Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <ModeToggle />
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || ""} alt={user.email || "Profile"} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Déconnexion
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Se connecter
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">S'inscrire</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-sm">
            <SheetHeader className="text-left">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Explorez les différentes sections de notre site.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Link to="/" className="hover:text-primary transition-colors flex items-center space-x-2 py-2">
                <Home className="h-4 w-4" />
                <span>Accueil</span>
              </Link>
              <Link to="/tests" className="hover:text-primary transition-colors flex items-center space-x-2 py-2">
                <BookOpen className="h-4 w-4" />
                <span>Tests</span>
              </Link>
              <Link to="/formations" className="hover:text-primary transition-colors flex items-center space-x-2 py-2">
                <GraduationCap className="h-4 w-4" />
                <span>Formations</span>
              </Link>
              <Link to="/coaching" className="hover:text-primary transition-colors flex items-center space-x-2 py-2">
                <MessageSquare className="h-4 w-4" />
                <span>Coaching</span>
              </Link>
              <Link to="/evenements" className="hover:text-primary transition-colors flex items-center space-x-2 py-2">
                <Calendar className="h-4 w-4" />
                <span>Événements</span>
              </Link>
              <Link to="/aide" className="hover:text-primary transition-colors flex items-center space-x-2 py-2">
                <HelpCircle className="h-4 w-4" />
                <span>Aide</span>
              </Link>
              <ModeToggle />
              {user ? (
                <div className="flex flex-col space-y-2">
                  <Link to="/dashboard" className="flex items-center space-x-2 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || ""} alt={user.email || "Profile"} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <span>Dashboard</span>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Se connecter
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">S'inscrire</Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
