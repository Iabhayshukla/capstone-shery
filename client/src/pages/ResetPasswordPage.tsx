import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase";
import { sendPasswordReset } from "@/features/auth/api/auth.api";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle,
  KeyRound,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12 },
  }),
};

const ResetPasswordPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const passwordStrength = (() => {
    if (password.length === 0) return { level: 0, label: "", color: "" };
    if (password.length < 8) return { level: 1, label: "Weak (min 8 chars)", color: "bg-red-400" };
    if (password.length < 12) return { level: 2, label: "Medium", color: "bg-amber-400" };
    return { level: 3, label: "Strong", color: "bg-emerald-400" };
  })();

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const canUpdate = password.length >= 8 && passwordsMatch;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const redirectUrl = window.location.origin + "/reset-password";
      await sendPasswordReset(email, redirectUrl);
      setEmailSent(true);
      addToast("Password reset link sent to your email!", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to send reset link. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      addToast("Password updated successfully!", "success");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err: any) {
      addToast(err.message || "Failed to update password. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center animate-glow-pulse">
            <div className="w-4 h-4 rounded-md bg-brand-primary animate-spin-slow" />
          </div>
          <p className="text-sm text-[var(--text-faint)] animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-6 overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-[450px] h-[450px] rounded-full bg-[#6C63FF]/15 blur-[120px]" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-[#FF6584]/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="flex items-center justify-center gap-2.5 mb-8"
        >
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Capstone-Shery</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="glass-card p-8"
        >
          {isAuthenticated ? (
            // State 2: User clicked recovery link & is authenticated -> Reset Password Form
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
                  <KeyRound size={22} />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  Reset Your Password
                </h1>
                <p className="text-sm text-[var(--text-muted)]">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reset-password"
                    className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]"
                  >
                    <Lock size={14} />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-4 py-3 pr-11 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Password Strength */}
                  {password.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              passwordStrength.level >= level
                                ? passwordStrength.color
                                : "bg-[var(--brand-glass-input-bg)]"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-[var(--text-faint)]">
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reset-confirm"
                    className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]"
                  >
                    <Lock size={14} />
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="reset-confirm"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className={`w-full px-4 py-3 pr-11 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)] ${
                        confirmPassword.length > 0 && !passwordsMatch
                          ? "border-red-400/50"
                          : ""
                      }`}
                      required
                    />
                    {passwordsMatch && (
                      <CheckCircle
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400"
                      />
                    )}
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-[10px] text-red-400 font-medium">Passwords do not match</p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading || !canUpdate}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3 gap-2 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      Update Password
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            // State 1: User requesting a reset link
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  Forgot Password?
                </h1>
                <p className="text-sm text-[var(--text-muted)]">
                  Enter your email below to receive a password reset link
                </p>
              </div>

              {emailSent ? (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <CheckCircle size={24} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-[var(--text-primary)] font-medium">
                      Check your email inbox
                    </p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      We have sent a link to <span className="text-[var(--text-primary)]">{email}</span>. Click the link to choose a new password.
                    </p>
                  </div>
                  <Button
                    onClick={() => setEmailSent(false)}
                    variant="outline"
                    className="w-full border-[var(--brand-border)] bg-transparent hover:bg-[var(--brand-glass-hover)] text-[var(--text-primary)] py-3"
                  >
                    Resend Email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRequestReset} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reset-email"
                      className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]"
                    >
                      <Mail size={14} />
                      Email Address
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3 gap-2 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending link...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Back to Login */}
              <div className="text-center mt-6">
                <Link
                  to="/login"
                  className="text-sm text-brand-primary font-medium hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
