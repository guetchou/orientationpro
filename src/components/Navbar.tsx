
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Graduation, ChevronDown, Search, User, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  // Animation variants
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const mobileMenuVariants = {
    closed: { 
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: { 
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const mobileItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  const navItems = [
    { path: "/tests", label: "Tests" },
    { path: "/actualites", label: "Actualités" },
    { path: "/conseillers", label: "Conseillers" },
    { path: "/resources", label: "Ressources" },
    { path: "/forum", label: "Forum" },
    { path: "/blog", label: "Blog" },
    { path: "/contact", label: "Contact" }
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 
        ${isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-md py-3" 
          : "bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm py-5"
        }
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 z-10">
            <motion.div 
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg text-white"
            >
              <Graduation size={24} />
            </motion.div>
            <motion.span 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={`font-heading text-2xl font-bold 
                text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary
              `}
            >
              Orientation Pro Congo
            </motion.span>
          </Link>

          {/* Search & Navigation Desktop */}
          <div className="hidden md:flex items-center">
            <motion.div 
              initial={{ width: "200px" }}
              animate={{ width: isSearchOpen ? "300px" : "200px" }}
              transition={{ duration: 0.3 }}
              className="relative mr-6"
            >
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setIsSearchOpen(false)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </motion.div>
            
            <div className="flex items-center space-x-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={navItemVariants}
                >
                  <Link 
                    to={item.path} 
                    className={`px-3 py-2 rounded-lg transition-all duration-300 relative group overflow-hidden ${
                      isActive(item.path) 
                        ? 'text-primary font-medium' 
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    {item.label}
                    
                    {/* Active indicator */}
                    {isActive(item.path) && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-lg"
                      />
                    )}
                    
                    {/* Hover indicator */}
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-primary/40 rounded-t-lg transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Boutons Auth Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn size={16} />
                Connexion
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-medium gap-2">
                <User size={16} />
                S'inscrire
              </Button>
            </Link>
          </div>

          {/* Menu Mobile Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-700"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </Button>
            
            <Button 
              variant="ghost"
              size="icon"
              className="text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </Button>
          </div>
        </div>
        
        {/* Search on Mobile */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-3 pb-2"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="md:hidden overflow-hidden bg-white border-t shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="grid gap-2">
                {navItems.map((item, index) => (
                  <motion.div 
                    key={item.path}
                    variants={mobileItemVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <Link 
                      to={item.path} 
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isActive(item.path) 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{item.label}</span>
                      {isActive(item.path) && (
                        <Badge variant="outline" className="border-primary text-primary">
                          Actif
                        </Badge>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Link to="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full gap-2">
                    <LogIn size={16} />
                    Connexion
                  </Button>
                </Link>
                <Link to="/register" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary gap-2">
                    <User size={16} />
                    S'inscrire
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
