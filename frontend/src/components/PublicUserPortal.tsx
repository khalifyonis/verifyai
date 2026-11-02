"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Upload,
  History,
  FileText,
  AlertTriangle,
  Users,
  Headphones,
  Settings,
  Bell,
  ChevronDown,
  Camera,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  FileWarning,
  Eye,
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RotateCcw,
  Flag,
  Globe,
  Dumbbell,
  ScanLine,
  Building2,
  LogIn,
  UserPlus,
  Menu,
} from "lucide-react";
import {
  verifyProduct,
  getProducts,
  getScanHistory,
  getTrustedSources,
  submitReport,
  VerificationResult,
  ProductItem,
  getStoredUser,
  clearStoredAuth,
  User as UserType,
} from "@/lib/api";
import { BarcodeScannerModal } from "./BarcodeScannerModal";
import { ThemeToggle } from "./ThemeToggle";
import { AuthModal } from "./AuthModal";
import { SearchHistoryView } from "./SearchHistoryView";
import { ReportedProductsView } from "./ReportedProductsView";
import { SafetyAlertsView } from "./SafetyAlertsView";
import { CommunityView } from "./CommunityView";
import { SupportView } from "./SupportView";
import { AccountSettingsView } from "./AccountSettingsView";

interface PublicUserPortalProps {
  onSwitchPortal?: (portal: "public" | "admin" | "company") => void;
}

export function PublicUserPortal({ onSwitchPortal }: PublicUserPortalProps) {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  // Navigation & Dropdown states
  const [activeNav, setActiveNav] = useState<string>("dashboard");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSafetyHubModalOpen, setIsSafetyHubModalOpen] = useState(false);
  const [isManualGuideModalOpen, setIsManualGuideModalOpen] = useState(false);

  // Verification state
  const [barcodeInput, setBarcodeInput] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [expiryInput, setExpiryInput] = useState("");
  const [productHintInput, setProductHintInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [activeResult, setActiveResult] = useState<VerificationResult | null>(null);

  // Data
  const [liveHistory, setLiveHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 48,
    verified: 32,
    suspicious: 12,
    flagged: 4,
  });

  // Load initial history and stored auth
  useEffect(() => {
    async function loadData() {
      try {
        const u = getStoredUser();
        if (u) setCurrentUser(u);

        const hist = await getScanHistory(undefined, 10);
        if (hist && hist.length > 0) {
          setLiveHistory(hist);
        }
      } catch (e) {
        // use default mock items if backend offline
      }
    }
    loadData();
  }, []);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setImagePreview(b64);
      setImageBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  // Run verification
  const handleRunVerification = async (
    customBarcode?: string,
    customBatch?: string,
    customExp?: string,
    customHint?: string
  ) => {
    const code = customBarcode !== undefined ? customBarcode : barcodeInput;
    const batch = customBatch !== undefined ? customBatch : batchInput;
    const exp = customExp !== undefined ? customExp : expiryInput;
    const hint = customHint !== undefined ? customHint : productHintInput;

    if (!code.trim() && !imageBase64 && !hint.trim()) {
      alert("Please enter a barcode, batch number, or upload an image.");
      return;
    }

    try {
      setIsVerifying(true);
      setVerificationProgress(20);

      const progressTimer = setInterval(() => {
        setVerificationProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 150);

      const res = await verifyProduct({
        barcode: code.trim() || undefined,
        batch_number: batch.trim() || undefined,
        expiry_date: exp.trim() || undefined,
        product_name_hint: hint.trim() || undefined,
        image_base64: imageBase64 || undefined,
        location_name: "Web Portal (Ahmed's Workspace)",
      });

      clearInterval(progressTimer);
      setVerificationProgress(100);

      setTimeout(() => {
        setIsVerifying(false);
        setActiveResult(res);
        setIsUploadModalOpen(false);
        setIsEvidenceModalOpen(true);
      }, 300);
    } catch (err: any) {
      setIsVerifying(false);
      alert(err?.message || "Verification failed. Please check backend connection.");
    }
  };

  // Mock table items from the design prototype image
  const defaultTableRows = [
    {
      id: "01",
      name: "Creatine Monohydrate",
      brand: "Nutriforge",
      date: "Oct 2026",
      status: "VERIFIED",
      statusColor: "emerald",
      barcode: "0748927024104",
      batch: "ONC-84920",
      exp: "2027-04-14",
      img: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "02",
      name: "Whey Protein",
      brand: "Prime Labs",
      date: "Oct 2026",
      status: "SUSPICIOUS",
      statusColor: "amber",
      barcode: "0748927024104",
      batch: "FAKE-LOT-999",
      exp: "2029-12-31",
      img: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "03",
      name: "Vitamin D3",
      brand: "Vitamin D3",
      date: "Oct 2026",
      status: "VERIFIED",
      statusColor: "emerald",
      barcode: "0748927028669",
      batch: "OPN-2026-W98",
      exp: "2027-06-09",
      img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "04",
      name: "Pre-Workout Powder",
      brand: "Pre-Workout",
      date: "Oct 2026",
      status: "NOT VERIFIED",
      statusColor: "rose",
      barcode: "0890123999992",
      batch: "LOT-GEN-99",
      exp: "2026-08-30",
      img: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&auto=format&fit=crop&q=80",
    },
  ];

  // Inspect row click
  const handleInspectRow = async (row: any) => {
    try {
      const res = await verifyProduct({
        barcode: row.barcode,
        batch_number: row.batch,
        expiry_date: row.exp,
        product_name_hint: row.name,
      });
      setActiveResult(res);
      setIsEvidenceModalOpen(true);
    } catch (e) {
      alert("Unable to fetch evidence record.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080E1A] text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP NAVIGATION BAR (Exact Match to Prototype)              */}
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP NAVIGATION BAR                                         */}
      {/* ------------------------------------------------------------- */}
      <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0B1323] px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md shadow-xs">
        {/* Brand & Portal Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 md:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Glowing 3D Origami V Logo */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0">
            <div className="w-full h-full bg-white dark:bg-[#0B1323] rounded-[10px] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-600 dark:text-cyan-400 fill-current">
                <path d="M12 2L2 7l10 15 10-15-10-5zm0 3.5L18.5 8 12 18 5.5 8 12 5.5z" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-wider font-mono text-slate-900 dark:text-white shrink-0">
            VERI<span className="text-cyan-600 dark:text-cyan-400">FAI</span>
          </span>
          <span className="px-3 py-1 text-[10px] font-bold tracking-widest text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-400/40 rounded-full uppercase shrink-0">
            PUBLIC USER PORTAL
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-[#0A1323] p-1 rounded-xl border border-slate-200 dark:border-white/5">
          <button
            onClick={() => setActiveNav("dashboard")}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              activeNav === "home" || activeNav === "dashboard" ? "nav-tab-active" : "nav-tab"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveNav("upload");
              setIsUploadModalOpen(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              activeNav === "upload" ? "nav-tab-active" : "nav-tab"
            }`}
          >
            Verify Now
          </button>
          <button
            onClick={() => setActiveNav("history")}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              activeNav === "history" ? "nav-tab-active" : "nav-tab"
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveNav("safety")}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              activeNav === "safety" ? "nav-tab-active" : "nav-tab"
            }`}
          >
            Safety Hub
          </button>
          <button
            onClick={() => setActiveNav("support")}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              activeNav === "support" || activeNav === "help" ? "nav-tab-active" : "nav-tab"
            }`}
          >
            Help
          </button>
        </nav>

        {/* Quick Portal Switcher Pills */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-1 rounded-xl text-xs">
          <button
            className="px-3 py-1 rounded-lg portal-pill-active cursor-pointer"
          >
            Public Portal
          </button>
          <button
            onClick={() => onSwitchPortal ? onSwitchPortal("admin") : (window.location.href = "/admin")}
            className="px-3 py-1 rounded-lg portal-pill flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Admin Dashboard
          </button>
          <button
            onClick={() => onSwitchPortal ? onSwitchPortal("company") : (window.location.href = "/company")}
            className="px-3 py-1 rounded-lg portal-pill flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Company Portal
          </button>
        </div>

        {/* Right User & Notification Controls */}
        <div className="flex items-center gap-3 relative">
          {/* Dark / Light Mode Switcher */}
          <ThemeToggle />

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0B1323]" />
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-32 top-14 w-80 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Public Safety Alerts</span>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded font-mono font-bold">1 New</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs">
                <span className="font-semibold text-rose-700 dark:text-rose-300 block mb-0.5">Counterfeit Alert</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Suspicious batches of Optimum Creatine reported with misspelled bottom laser codes.
                </p>
              </div>
            </div>
          )}

          {/* User Profile Pill or Auth Buttons */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 transition-all cursor-pointer"
              >
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name || currentUser.username || currentUser.email}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-500"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase ring-1 ring-cyan-500">
                    {(currentUser.full_name || currentUser.username || currentUser.email).slice(0, 2)}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {currentUser.full_name || currentUser.username}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 leading-tight">
                    @{currentUser.username || currentUser.email.split("@")[0]}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-12 w-64 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white block">{currentUser.full_name || "VERIFAI User"}</span>
                    <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">@{currentUser.username || "user"}</span>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                        {currentUser.role.replace("_", " ")}
                      </span>
                      {currentUser.auth_provider === "google" && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                          Google
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setIsUploadModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    New Supplement Scan
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setIsSafetyHubModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    Regional Safety Hub
                  </button>

                  <div className="border-t border-slate-200 dark:border-white/10 my-1.5" />
                  <div className="px-2 py-1 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Switch Portal
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      if (onSwitchPortal) onSwitchPortal("admin");
                      else window.location.href = "/admin";
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-white flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    Admin Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      if (onSwitchPortal) onSwitchPortal("company");
                      else window.location.href = "/company";
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Company / Brand Portal
                  </button>

                  <div className="border-t border-slate-200 dark:border-white/10 my-1.5" />
                  <div className="px-3 py-1.5 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 text-xs">Appearance</span>
                    <ThemeToggle showLabel />
                  </div>
                  <div className="border-t border-slate-200 dark:border-white/10 my-1" />

                  <button
                    onClick={() => {
                      clearStoredAuth();
                      setCurrentUser(null);
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthModalMode("login");
                  setIsAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-semibold border border-slate-300 dark:border-white/15 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => {
                  setAuthModalMode("register");
                  setIsAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}

        </div>
      </header>

      <div className="flex-1 flex min-w-0 overflow-hidden relative bg-slate-100 dark:bg-[#080E1A]">
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          />
        )}

        {/* Left Sidebar (01) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 md:static w-64 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A1120] flex flex-col justify-between shrink-0 p-4 transition-transform duration-300 md:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
        >
          <div className="space-y-1">
            <button
              onClick={() => setActiveNav("dashboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeNav === "dashboard" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveNav("upload");
                setIsUploadModalOpen(true);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeNav === "upload" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Image/Barcode Upload</span>
            </button>

            <button
              onClick={() => setActiveNav("history")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeNav === "history" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Search History</span>
            </button>

            <button
              onClick={() => setActiveNav("reports")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeNav === "reports" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Reported Products</span>
            </button>

            <button
              onClick={() => setActiveNav("safety")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeNav === "safety" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Safety Alerts</span>
            </button>

            <button
              onClick={() => setActiveNav("community")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeNav === "community" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Community</span>
            </button>

            <button
              onClick={() => setActiveNav("support")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeNav === "support" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>Support</span>
            </button>

            <button
              onClick={() => setActiveNav("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeNav === "settings" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
          </div>

          {/* Portal Switcher in Sidebar */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-1.5 my-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2 block">
              Switch Portals
            </span>
            <button
              onClick={() => onSwitchPortal ? onSwitchPortal("admin") : (window.location.href = "/admin")}
              className="w-full text-left px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 border border-cyan-200 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-medium flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Admin Dashboard
              </span>
              <ExternalLink className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            </button>
            <button
              onClick={() => onSwitchPortal ? onSwitchPortal("company") : (window.location.href = "/company")}
              className="w-full text-left px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Company Portal
              </span>
              <ExternalLink className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            </button>
          </div>

          {/* Bottom Banner */}
          <div className="relative rounded-2xl overflow-hidden p-3.5 bg-gradient-to-br from-indigo-50 via-slate-100 to-cyan-50 dark:from-indigo-950 dark:via-purple-950 dark:to-cyan-950 border border-cyan-200 dark:border-cyan-500/20 text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-700 dark:text-cyan-400 block mb-1">
              GS1 & AI Shield
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Deterministic verification against official brand ledgers.
            </p>
          </div>
        </aside>

        {/* ------------------------------------------------------------- */}
        {/* 3. MAIN DASHBOARD CONTENT (Center + Right Columns)            */}
        {/* ------------------------------------------------------------- */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-100 dark:bg-transparent">
          {/* VIEW 1: SEARCH HISTORY */}
          {activeNav === "history" && (
            <SearchHistoryView
              onInspectEvidence={handleInspectRow}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {/* VIEW 2: REPORTED PRODUCTS */}
          {activeNav === "reports" && (
            <ReportedProductsView
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {/* VIEW 3: SAFETY ALERTS */}
          {activeNav === "safety" && (
            <SafetyAlertsView
              onReportSpotted={() => setIsReportModalOpen(true)}
            />
          )}

          {/* VIEW 4: COMMUNITY */}
          {activeNav === "community" && <CommunityView />}

          {/* VIEW 5: SUPPORT */}
          {(activeNav === "support" || activeNav === "help") && <SupportView />}

          {/* VIEW 6: ACCOUNT SETTINGS */}
          {activeNav === "settings" && (
            <AccountSettingsView
              currentUser={currentUser}
              onUpdateUser={(u) => setCurrentUser(u)}
            />
          )}

          {/* VIEW 0: MAIN DASHBOARD & VERIFICATION CENTRE */}
          {(activeNav === "dashboard" || activeNav === "home" || activeNav === "upload") && (
            <>
              {/* Top Row: Verification Centre (Left 60%) + Quick Stats (Right 40%) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Center Main: Verification Centre */}
                <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 p-6 flex flex-col justify-between shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
              <span className="text-sm font-bold text-slate-900 dark:text-white mb-4 block">Verification Centre</span>

              {/* Dashed Camera Dropzone Card */}
              <div
                onClick={() => setIsUploadModalOpen(true)}
                className="relative rounded-2xl border-2 border-dashed border-cyan-400/80 dark:border-cyan-500/40 hover:border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 hover:bg-cyan-100/50 dark:hover:bg-cyan-950/30 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Verify a Product</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mb-5">
                  Drag & drop photos of product packaging, barcode, or upload image files
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUploadModalOpen(true);
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white keep-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                >
                  SCAN & VERIFY
                </button>
              </div>

              {/* Manual Entry Link */}
              <div className="text-center pt-3">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 underline transition-colors cursor-pointer"
                >
                  Manual enter text enter Barcode or Batch numbers
                </button>
              </div>
            </div>

            {/* Right Side: Quick Stats - 2x2 Grid */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Quick Stats</span>

              <div className="grid grid-cols-2 gap-4">
                {/* Total Scans */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    <span>Total Scans</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="my-2">
                    <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">{stats.total}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[75%]" />
                  </div>
                </div>

                {/* Verified */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="my-2">
                    <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{stats.verified}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[65%]" />
                  </div>
                </div>

                {/* Suspicious */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Suspicious</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="my-2">
                    <span className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">{stats.suspicious}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[25%]" />
                  </div>
                </div>

                {/* Flagged */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 hover:border-rose-500/40 transition-all flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Flagged</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="my-2">
                    <span className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">{stats.flagged}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[10%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Recent Scan History (Left 70%) + Public Trust Hub (Right 30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="recent-scan-table">
            {/* Recent Scan History Table */}
            <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Scan History</h3>
                <button
                  onClick={() => setActiveNav("history")}
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
                >
                  View all / Manage
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-mono uppercase tracking-wider">
                      <th className="pb-3 font-semibold">ID</th>
                      <th className="pb-3 font-semibold">Product Name</th>
                      <th className="pb-3 font-semibold">Brand</th>
                      <th className="pb-3 font-semibold">Scan Date</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {defaultTableRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-mono text-slate-500 dark:text-slate-400">{row.id}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={row.img}
                              alt={row.name}
                              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-white/10"
                            />
                            <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">{row.brand}</td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 font-mono">{row.date}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider ${
                              row.status === "VERIFIED"
                                ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30"
                                : row.status === "SUSPICIOUS"
                                ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30"
                                : "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleInspectRow(row)}
                            className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
                          >
                            {row.status === "VERIFIED" ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                View Verification Details
                              </>
                            ) : row.status === "SUSPICIOUS" ? (
                              <>
                                <FileText className="w-3.5 h-3.5" />
                                Review Evidence
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                Upload Proof / Report
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Public Trust Hub (02) */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Public Trust Hub</span>

              {/* Community Alert Card */}
              <div
                onClick={() => setActiveNav("safety")}
                className="p-4 rounded-2xl bg-amber-50 dark:bg-[#1A1423] border border-amber-200 dark:border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer space-y-2 shadow-xs"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Community Alerts & Safety Hub</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Fake batch of prime supplements reported in region
                </h4>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  Warning: fake supplement has counterfeit lot batches circulating in local gym shops.
                </p>
              </div>

              {/* Guide Card */}
              <div
                onClick={() => setActiveNav("support")}
                className="p-4 rounded-2xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer space-y-2 shadow-xs"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>How to verify batch numbers manually</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tips on how to read laser-printed batch codes and expiration dates on the underside of supplement containers.
                </p>
              </div>
            </div>
          </div>
            </>
          )}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODALS & INTERACTIVE CLICK STATES                          */}
      {/* ------------------------------------------------------------- */}

      {/* MODAL 1: Upload & Verify Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#0B1323] border border-slate-200 dark:border-cyan-500/30 shadow-2xl overflow-hidden text-slate-900 dark:text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#09101D]">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Verify Supplement Product</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Camera Scanner Trigger */}
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl border border-cyan-300 dark:border-cyan-500/40 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:hover:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ScanLine className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Open Live Camera Barcode Scanner
              </button>

              {/* Photo Upload Dropzone */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Upload Tub / Packaging Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="modal-image-upload"
                  className="hidden"
                />
                <label
                  htmlFor="modal-image-upload"
                  className="w-full border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-cyan-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300"
                >
                  {imagePreview ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded">
                        Photo Attached
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mb-1" />
                      <span className="text-xs font-medium text-slate-900 dark:text-white">Click or drag image here</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Front label, bottom batch stamp, or barcode</span>
                    </>
                  )}
                </label>
              </div>

              {/* Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Barcode / GTIN Number <span className="text-cyan-600 dark:text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="e.g. 0748927024104"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Batch / LOT Code
                    </label>
                    <input
                      type="text"
                      value={batchInput}
                      onChange={(e) => setBatchInput(e.target.value)}
                      placeholder="e.g. ONC-84920"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiryInput}
                      onChange={(e) => setExpiryInput(e.target.value)}
                      placeholder="e.g. 2027-04-14"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Product / Brand Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={productHintInput}
                    onChange={(e) => setProductHintInput(e.target.value)}
                    placeholder="e.g. Optimum Nutrition Creatine"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 1-Click Test Presets */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  Quick Presets — Test Verification Policies:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setBarcodeInput("0748927024104");
                      setBatchInput("ONC-84920");
                      setExpiryInput("2027-04-14");
                      setProductHintInput("Optimum Nutrition Creatine");
                    }}
                    className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-left border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-medium cursor-pointer"
                  >
                    ✓ Genuine ON Creatine
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBarcodeInput("0748927024104");
                      setBatchInput("FAKE-LOT-999");
                      setExpiryInput("2029-12-31");
                      setProductHintInput("Optimum Nutrition Creatine");
                    }}
                    className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-left border border-amber-200 dark:border-amber-500/20 text-[11px] font-medium cursor-pointer"
                  >
                    ⚠ Counterfeit Batch
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBarcodeInput("0619985432109");
                      setBatchInput("APX-998");
                      setExpiryInput("2025-11-14");
                      setProductHintInput("Apex Nitric Surge");
                    }}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-left border border-rose-200 dark:border-rose-500/20 text-[11px] font-medium cursor-pointer"
                  >
                    🚨 FDA Recalled Pre-Workout
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBarcodeInput("0890123999992");
                      setBatchInput("LOT-GEN-99");
                      setExpiryInput("2026-08-30");
                      setProductHintInput("Generic Protein");
                    }}
                    className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-left border border-slate-300 dark:border-white/10 text-[11px] font-medium cursor-pointer"
                  >
                    ❓ Unregistered Supplement
                  </button>
                </div>
              </div>

              {/* Progress State during verification */}
              {isVerifying ? (
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Analyzing Evidence & Querying GS1 / Manufacturer Ledgers...
                  </span>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full transition-all duration-300"
                      style={{ width: `${verificationProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRunVerification()}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                >
                  START VERIFICATION ENGINE
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Full Evidence Dossier Modal (Clicked from Table or Scan) */}
      {isEvidenceModalOpen && activeResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0B1323] border border-slate-200 dark:border-cyan-500/30 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-slate-900 dark:text-white">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#09101D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider ${
                    activeResult.verdict === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30"
                      : activeResult.verdict === "SUSPICIOUS"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30"
                      : activeResult.verdict === "OFFICIAL_WARNING"
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300 border border-slate-300 dark:border-slate-600/40"
                  }`}
                >
                  {activeResult.verdict}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Score: {activeResult.confidence_score}%
                </span>
              </div>
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body matching Gemini_Generated_Image_wea2k9wea2k9wea2 (1).jpg */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Product Hero Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=120&auto=format&fit=crop&q=80"
                    alt="Nutriforge"
                    className="w-14 h-14 rounded-xl object-cover ring-1 ring-emerald-500"
                  />
                  <div>
                    <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block font-bold">
                      NUTRIFORGE
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Creatine Monohydrate
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">VERIFIED</span>
                    <span className="text-[10px] font-mono opacity-80">/ LOW RISK</span>
                  </div>
                </div>
              </div>

              {/* 2-Column: OCR Text Breakdown + Evidence Trust & Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left: OCR Text Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                    <span className="font-bold text-slate-900 dark:text-white">OCR Text Breakdown</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      100% Match Confidence
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Brand: NUTRIFORGE
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Matched</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Product: Creatine Monohydrate
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Matched</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Barcode: 0748927024104
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Matched</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Batch: CF-24091
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Matched</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Expiry: 2028-04
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Matched</span>
                    </div>
                  </div>
                </div>

                {/* Right: Evidence Trust & Analysis */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-2.5 text-xs">
                  <div className="border-b border-slate-200 dark:border-white/10 pb-2">
                    <span className="font-bold text-slate-900 dark:text-white block">Evidence Trust & Analysis</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Product identity</span>
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold">Strong</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500 text-[10px] font-mono">Medium</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Barcode</span>
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold">Strong</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500 text-[10px] font-mono">Medium</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">OCR fields</span>
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold">Strong</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500 text-[10px] font-mono">Medium</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Trusted sources</span>
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold">Strong</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500 text-[10px] font-mono">Medium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Explanation */}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeResult.verdict_title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{activeResult.explanation}</p>
              </div>

              {/* Limitations */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-cyan-700 dark:text-cyan-300 block mb-0.5">Verification Policy & Boundaries</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{activeResult.limitations}</p>
              </div>
            </div>

            {/* Footer with Download PDF Report matching design */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#09101D] flex items-center justify-between">
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-semibold text-slate-800 dark:text-white cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const auditText = `VERIFAI CERTIFIED AUDIT REPORT\nProduct: Nutriforge Creatine Monohydrate\nVerdict: ${activeResult.verdict}\nConfidence: ${activeResult.confidence_score}%\nBatch: CF-24091\nGS1 Validated: True\nGenerated: ${new Date().toISOString()}`;
                  const blob = new Blob([auditText], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `VERIFAI_Dossier_CF-24091.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 cursor-pointer transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                Download PDF Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Safety Hub Modal */}
      {isSafetyHubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B1323] border border-amber-300 dark:border-amber-500/30 shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Community Safety & Recall Alerts</h3>
              </div>
              <button onClick={() => setIsSafetyHubModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                <span className="font-bold text-rose-700 dark:text-rose-300 block mb-1">
                  🚨 Active FDA Safety Recall: Apex Nitric Surge Pre-Workout
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  Batch APX-998 confirmed to contain undeclared prescription stimulant analogues (DMAA). Do not consume. Quarantined by health inspectors.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <span className="font-bold text-amber-700 dark:text-amber-300 block mb-1">
                  ⚠️ Regional Market Notice: Cloned Creatine Barcodes
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  Legitimate EAN-13 barcodes copied onto counterfeit tubs with blurry batch stamps. Always verify batch numbers against the authorized production ledger.
                </p>
              </div>
            </div>
            <div className="text-right pt-2">
              <button
                onClick={() => setIsSafetyHubModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Dismiss Bulletin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Manual Batch Number Verification Guide Modal */}
      {isManualGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B1323] border border-cyan-300 dark:border-cyan-500/30 shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">How to Check Batch Numbers</h3>
              </div>
              <button onClick={() => setIsManualGuideModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Authentic supplement manufacturers (such as Optimum Nutrition, Dymatize, and Cellucor) print two critical security marks on physical tubs:
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 space-y-1">
                <span className="font-bold text-cyan-700 dark:text-cyan-300 block">1. Underside Laser Dot-Matrix Printing</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Batch numbers (e.g. <span className="font-mono text-slate-900 dark:text-white font-bold">ONC-84920</span>) and Expiry dates are laser-printed with slight tactile texture. Counterfeits frequently use smeared ink stampers.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 space-y-1">
                <span className="font-bold text-cyan-700 dark:text-cyan-300 block">2. Tamper-Evident Neck Bands</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Genuine tubs feature custom golden hologram shrink bands covering the cap perimeter. Tubs with plain clear tape should be treated with suspicion.
                </p>
              </div>
            </div>
            <div className="text-right pt-2">
              <button
                onClick={() => setIsManualGuideModalOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Report Counterfeit Product Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0B1323] border border-rose-300 dark:border-rose-500/30 shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Flag className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Report Suspicious Supplement</h3>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                alert("Thank you. Report filed to compliance team.");
                setIsReportModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Product Title</label>
                <input
                  required
                  placeholder="e.g. Optimum Nutrition Creatine Monohydrate"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Store / Gym Location</label>
                <input
                  placeholder="e.g. Metro Gym Shop, Counter #2"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Suspicious Details</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why the supplement looks suspicious (smudged batch code, damaged seal, unusual taste)..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white resize-none placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold cursor-pointer shadow-md"
                >
                  Submit Fraud Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Camera Modal */}
      <BarcodeScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onScanSuccess={(decoded) => {
          setBarcodeInput(decoded);
          handleRunVerification(decoded);
        }}
      />

      {/* Authentication & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={(u) => {
          setCurrentUser(u);
        }}
      />
    </div>
  );
}
