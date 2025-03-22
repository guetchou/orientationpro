
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
      ${isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-md" 
        : "bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm"
      }
    `}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className={`font-heading text-2xl font-bold 
              ${isScrolled ? "text-primary" : "text-primary"}
              transition-all duration-300
            `}>
              Orientation Pro Congo
            </span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/tests" 
              className={`transition-colors hover:text-primary relative
                ${isActive("/tests") 
                  ? "text-primary font-medium after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:bottom-[-8px] after:left-0" 
                  : isScrolled ? "text-gray-700" : "text-gray-800"
                }
              `}
            >
              Tests
            </Link>
            <Link 
              to="/actualites" 
              className={`transition-colors hover:text-primary relative
                ${isActive("/actualites") 
                  ? "text-primary font-medium after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:bottom-[-8px] after:left-0" 
                  : isScrolled ? "text-gray-700" : "text-gray-800"
                }
              `}
            >
              Actualités
            </Link>
            <Link 
              to="/conseillers" 
              className={`transition-colors hover:text-primary relative
                ${isActive("/conseillers") 
                  ? "text-primary font-medium after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:bottom-[-8px] after:left-0" 
                  : isScrolled ? "text-gray-700" : "text-gray-800"
                }
              `}
            >
              Conseillers
            </Link>
            <Link 
              to="/resources" 
              className={`transition-colors hover:text-primary relative
                ${isActive("/resources") 
                  ? "text-primary font-medium after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:bottom-[-8px] after:left-0" 
                  : isScrolled ? "text-gray-700" : "text-gray-800"
                }
              `}
            >
              Ressources
            </Link>
            <Link 
              to="/forum" 
              className={`transition-colors hover:text-primary relative
                ${isActive("/forum") 
                  ? "text-primary font-medium after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:bottom-[-8px] after:left-0" 
                  : isScrolled ? "text-gray-700" : "text-gray-800"
                }
              `}
            >
              Forum
            </Link>
            <Link 
              to="/blog" 
              className={`transition-colors hover:text-primary relative
                ${isActive("/blog") 
                  ? "text-primary font-medium after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:bottom-[-8px] after:left-0" 
                  : isScrolled ? "text-gray-700" : "text-gray-800"
                }
              `}
            >
              Blog
            </Link>
            <Link 
              to="/contact" 
              className={`transition-colors hover:text-primary relative
                ${isActive("/contact") 
                  ? "text-primary font-medium after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:bottom-[-8px] after:left-0" 
                  : isScrolled ? "text-gray-700" : "text-gray-800"
                }
              `}
            >
              Contact
            </Link>
          </div>

          {/* Boutons Auth Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" className="font-medium">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-medium">S'inscrire</Button>
            </Link>
          </div>

          {/* Menu Mobile Toggle */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link 
              to="/tests" 
              className={`block py-2 hover:text-primary transition-colors ${isActive("/tests") ? "text-primary font-medium" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tests
            </Link>
            <Link 
              to="/actualites" 
              className={`block py-2 hover:text-primary transition-colors ${isActive("/actualites") ? "text-primary font-medium" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Actualités
            </Link>
            <Link 
              to="/conseillers" 
              className={`block py-2 hover:text-primary transition-colors ${isActive("/conseillers") ? "text-primary font-medium" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Conseillers
            </Link>
            <Link 
              to="/resources" 
              className={`block py-2 hover:text-primary transition-colors ${isActive("/resources") ? "text-primary font-medium" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ressources
            </Link>
            <Link 
              to="/forum" 
              className={`block py-2 hover:text-primary transition-colors ${isActive("/forum") ? "text-primary font-medium" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Forum
            </Link>
            <Link 
              to="/blog" 
              className={`block py-2 hover:text-primary transition-colors ${isActive("/blog") ? "text-primary font-medium" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              to="/contact" 
              className={`block py-2 hover:text-primary transition-colors ${isActive("/contact") ? "text-primary font-medium" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="space-y-2 pt-4 border-t">
              <Link to="/login" className="block">
                <Button variant="outline" className="w-full">Connexion</Button>
              </Link>
              <Link to="/register" className="block">
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80">S'inscrire</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
