import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12 },
  }),
};

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const passwordStrength = (() => {
    if (password.length === 0) return { level: 0, label: "", color: "" };
    if (password.length < 6) return { level: 1, label: "Weak", color: "bg-red-400" };
    if (password.length < 10) return { level: 2, label: "Medium", color: "bg-amber-400" };
    return { level: 3, label: "Strong", color: "bg-emerald-400" };
  })();

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = name.trim() && email.trim() && password.length >= 6 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    addToast("Account created! Welcome to NovaBuild AI 🎉", "success");
    setTimeout(() => navigate("/dashboard"), 600);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-6 py-12 overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-[450px] h-[450px] rounded-full bg-[#FF6584]/15 blur-[120px]" />
        <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-[#6C63FF]/10 blur-[120px]" />
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
              Create Your Account
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Start building beautiful websites with AI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-name"
                className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]"
              >
                <User size={14} />
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
                required
                autoFocus
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-email"
                className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]"
              >
                <Mail size={14} />
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-password"
                className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]"
              >
                <Lock size={14} />
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 pr-11 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
                  required
                  minLength={6}
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
                htmlFor="signup-confirm"
                className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]"
              >
                <Lock size={14} />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
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
                <p className="text-[10px] text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading || !canSubmit}
              className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3 gap-2 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Get Started Free
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

          {/* Login Link */}
          <p className="text-center text-sm text-[var(--text-muted)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-primary font-medium hover:underline"
            >
              Sign in
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

export default SignupPage;
