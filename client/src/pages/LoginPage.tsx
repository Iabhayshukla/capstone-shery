import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12 },
  }),
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsLoading(false);
    addToast("Welcome back! Redirecting to dashboard...", "success");
    setTimeout(() => navigate("/dashboard"), 600);
  };

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
            <span className="text-2xl font-bold gradient-text">NovaBuild AI</span>
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
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Sign in to continue building amazing websites
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]"
              >
                <Mail size={14} />
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]"
              >
                <Lock size={14} />
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
                  required
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
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-brand-primary hover:underline"
                onClick={() => addToast("Password reset is not available in demo mode", "info")}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3 gap-2 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--brand-border)]" />
            <span className="text-xs text-[var(--text-faint)]">or</span>
            <div className="flex-1 h-px bg-[var(--brand-border)]" />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[var(--text-muted)]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-brand-primary font-medium hover:underline"
            >
              Create one free
            </Link>
          </p>
        </motion.div>

        {/* Back link */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className="text-xs text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
          >
            ← Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
