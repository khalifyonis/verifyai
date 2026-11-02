"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Globe,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  ScanLine,
} from "lucide-react";
import { loginUser, registerUser, googleAuthUser, User } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  onSuccess?: (user: User) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form inputs
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("Somalia");

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Google Simulation / Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await loginUser(email.trim(), password);
        setSuccessMsg(`Welcome back, ${res.user.full_name || res.user.username || res.user.email}!`);
        setTimeout(() => {
          onSuccess && onSuccess(res.user);
          onClose();
        }, 600);
      } else {
        if (!username.trim()) {
          throw new Error("Please enter a username for your account.");
        }
        const res = await registerUser({
          email: email.trim(),
          username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ""),
          password: password,
          full_name: fullName.trim() || undefined,
          country: country.trim() || undefined,
          role: "consumer",
        });
        setSuccessMsg(`Account created! Welcome to VERIFAI, @${res.user.username}`);
        setTimeout(() => {
          onSuccess && onSuccess(res.user);
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleAuth = async (customEmail?: string, customName?: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const gEmail = customEmail || "fitness.champion@gmail.com";
      const gName = customName || "Somali Fitness Athlete";
      const gId = "google_" + btoa(gEmail).replace(/=/g, "").slice(0, 16);

      const res = await googleAuthUser({
        google_id: gId,
        email: gEmail,
        full_name: gName,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${gEmail}`,
      });

      setSuccessMsg(`Google Authentication Successful! Welcome, ${res.user.full_name || res.user.email}`);
      setIsGoogleModalOpen(false);
      setTimeout(() => {
        onSuccess && onSuccess(res.user);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo accounts
  const quickLogin = async (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword("verifai123");
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await loginUser(demoEmail, "verifai123");
      setSuccessMsg(`Authenticated as ${demoRole}!`);
      setTimeout(() => {
        onSuccess && onSuccess(res.user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#091120] border border-cyan-500/30 p-7 space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shadow-lg">
              <div className="w-full h-full bg-[#091120] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="text-sm font-extrabold font-mono tracking-wider text-white">
                VERI<span className="text-cyan-400">FAI</span>
              </div>
              <div className="text-[11px] text-slate-400">Anti-Counterfeit Supplement Protection</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900 border border-white/10 relative z-10">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === "login"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white keep-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === "register"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white keep-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google One-Tap / OAuth Button */}
        <button
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs shadow-md hover:shadow-lg transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span>OR WITH EMAIL</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              {/* Username Input */}
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  Username <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono text-cyan-400 font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="fitness_warrior"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Liban Farah"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="text-[11px] font-mono text-slate-300 block mb-1">
              Email Address <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[11px] font-mono text-slate-300 block mb-1">
              Password <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">Country</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Somalia"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{loading ? "Authenticating..." : mode === "login" ? "Sign In to VERIFAI" : "Complete Registration"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Logins Section */}
        {mode === "login" && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              Quick 1-Click Demo Personas:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => quickLogin("admin@verifai.io", "Super Admin")}
                className="px-2 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium text-left transition-colors"
              >
                👮 Super Admin (Hassan)
              </button>
              <button
                type="button"
                onClick={() => quickLogin("inspector@verifai.io", "Inspector")}
                className="px-2 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-medium text-left transition-colors"
              >
                🔍 Field Inspector (Sarah)
              </button>
              <button
                type="button"
                onClick={() => quickLogin("partner@glanbia.com", "Company Rep")}
                className="px-2 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium text-left transition-colors"
              >
                🏢 Brand Rep (Glanbia)
              </button>
              <button
                type="button"
                onClick={() => quickLogin("consumer@verifai.io", "Consumer")}
                className="px-2 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-medium text-left transition-colors"
              >
                👤 Consumer (Ahmed)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Google Account Selector Dialog                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white text-slate-900 p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span className="font-semibold text-sm">Sign in with Google</span>
              </div>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Choose an account to continue to <span className="font-bold text-slate-900">VERIFAI</span>:
            </p>

            {/* Simulated Google User Item 1 */}
            <div
              onClick={() => handleGoogleAuth("ahmed.athlete@gmail.com", "Ahmed Athlete")}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-200"
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                alt="Ahmed Athlete"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-900">Ahmed Athlete</div>
                <div className="text-[11px] text-slate-500">ahmed.athlete@gmail.com</div>
              </div>
            </div>

            {/* Custom Google Email input */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="text-[11px] text-slate-500 font-medium">Or enter your personal Gmail:</div>
              <input
                type="email"
                placeholder="your.name@gmail.com"
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                disabled={!googleEmailInput.includes("@")}
                onClick={() => handleGoogleAuth(googleEmailInput, googleEmailInput.split("@")[0])}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs transition-colors"
              >
                Continue with {googleEmailInput || "Gmail"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
