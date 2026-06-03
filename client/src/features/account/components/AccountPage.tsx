import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/Navbar";
import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/lib/ThemeContext";
import { pageTransition, fadeUp } from "@/lib/animations";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase";
import {
  User,
  Mail,
  Shield,
  Sun,
  Moon,
  LogOut,
  Trash2,
  Save,
  Camera,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const AccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name || user.email.split("@")[0] || "");
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (error) throw error;
      addToast("Profile updated successfully!", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to update profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addToast("Logged out successfully", "info");
      navigate("/login");
    } catch (err: any) {
      addToast(err.message || "Failed to log out", "error");
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-brand-primary/[0.03] blur-[100px]" />
        <div className="absolute bottom-[20%] left-[15%] w-[250px] h-[250px] rounded-full bg-brand-accent/[0.02] blur-[80px]" />
      </div>

      <motion.main
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="relative max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-12"
      >
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Account</h1>
          <p className="text-[var(--text-muted)] mt-1">Manage your profile and preferences</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              <Avatar name={name} size="lg" />
              <button
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change avatar"
              >
                <Camera size={20} className="text-white" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 w-full space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="account-name"
                  className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]"
                >
                  <User size={14} />
                  Full Name
                </label>
                <input
                  id="account-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm glass-input text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="account-email"
                  className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]"
                >
                  <Mail size={14} />
                  Email Address
                </label>
                <input
                  id="account-email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2.5 text-sm glass-input text-[var(--text-muted)] cursor-not-allowed"
                />
                <p className="text-[10px] text-[var(--text-faint)]">
                  Email cannot be changed
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Preferences Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="text-base font-semibold text-[var(--text-secondary)] mb-4 flex items-center gap-2">
            <Shield size={16} className="text-brand-primary" />
            Preferences
          </h2>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-[var(--brand-border)]">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Theme</p>
              <p className="text-xs text-[var(--text-faint)]">
                Choose your preferred appearance
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-hover text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {theme === "dark" ? (
                <>
                  <Moon size={15} className="text-brand-primary" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun size={15} className="text-amber-400" />
                  Light Mode
                </>
              )}
            </button>
          </div>

          {/* Notifications (placeholder) */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Email Notifications
              </p>
              <p className="text-xs text-[var(--text-faint)]">
                Get notified about project updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--brand-glass-input-bg)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[var(--text-muted)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary/60 peer-checked:after:bg-white" />
            </label>
          </div>
        </motion.div>

        {/* Sessions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                <LogOut size={16} className="text-amber-400" />
                Session
              </h2>
              <p className="text-xs text-[var(--text-faint)] mt-1">
                Manage your active sessions
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 gap-2"
              onClick={handleLogout}
            >
              <LogOut size={15} />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 border-red-500/10"
        >
          <button
            onClick={() => setShowDangerZone(!showDangerZone)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <h2 className="text-base font-semibold text-red-400/70 flex items-center gap-2">
                <AlertTriangle size={16} />
                Danger Zone
              </h2>
              <p className="text-xs text-[var(--text-faint)] mt-1">
                Irreversible actions
              </p>
            </div>
            <motion.span
              animate={{ rotate: showDangerZone ? 180 : 0 }}
              className="text-[var(--text-faint)]"
            >
              ▼
            </motion.span>
          </button>

          {showDangerZone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-red-500/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-400/70 font-medium">
                    Delete Account
                  </p>
                  <p className="text-xs text-[var(--text-faint)] mt-0.5">
                    Permanently delete your account and all projects
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="text-red-400 hover:bg-red-500/10 border border-red-500/20 gap-2"
                  onClick={() =>
                    addToast(
                      "Account deletion is not available in demo mode",
                      "warning"
                    )
                  }
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
};

export default AccountPage;
