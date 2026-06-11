import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import Avatar from "./Avatar";
import { Sparkles, Menu, X, LayoutDashboard, User, LogOut } from "lucide-react";

import { useAuth } from "@/features/auth";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isLoggedIn = isAuthenticated;
  const location = useLocation();

  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };


  if (location.pathname.startsWith("/editor")) return null;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`w-full px-6 md:px-8 py-3.5 flex items-center justify-between fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass border-b border-[var(--border)] shadow-md shadow-black/5"
          : "bg-transparent border-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
     
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:shadow-brand-primary/40 transition-shadow">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="text-xl font-bold gradient-text hidden sm:block">
         Capstone Shery
        </span>
      </Link>

    
      <div className="hidden md:flex items-center gap-3">
        <ThemeToggle />

        {isLoggedIn ? (
        
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--brand-glass-hover)] transition-colors"
              aria-label="User menu"
            >
              <Avatar name={userName} size="sm" showStatus status="online" />
              <span className="text-sm text-[var(--text-secondary)] font-medium">
                {userName.split(" ")[0]}
              </span>
            </button>

          
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 py-2 rounded-xl bg-[var(--dropdown-bg)] backdrop-blur-xl border border-[var(--border)] shadow-xl"
                >
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{userName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{userEmail}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Link>
                  <Link
                    to="/account"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={15} />
                    Account
                  </Link>
                  <div className="border-t border-[var(--border)] mt-1 pt-1">
                    <button
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400/70 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/5 transition-colors w-full text-left"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
     
          <>
            <Link to="/login">
              <Button
                variant="ghost"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] font-medium"
              >
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all">
                Get Started
              </Button>
            </Link>
          </>
        )}
      </div>

  
      <button
        className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)] transition-colors"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

    
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 mx-3 p-4 rounded-2xl bg-[var(--dropdown-bg)] backdrop-blur-xl border border-[var(--border)] shadow-2xl md:hidden"
          >
            <div className="flex flex-col gap-2">
              <ThemeToggle />
              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <Link
                    to="/account"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    Account
                  </Link>
                  <button
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400/70 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/5 transition-colors w-full text-left"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;