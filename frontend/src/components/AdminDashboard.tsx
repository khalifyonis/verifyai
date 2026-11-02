"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Building2,
  BarChart3,
  Users,
  FileWarning,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Filter,
  Eye,
  X,
  FileText,
  Shield,
  KeyRound,
  Check,
  CheckCheck,
  AlertOctagon,
  Sparkles,
  Menu,
} from "lucide-react";
import { getAnalyticsSummary, getScanHistory, getReports, getProducts, AnalyticsSummary } from "@/lib/api";
import { ThemeToggle } from "./ThemeToggle";
import { AdminUsersManagement } from "./AdminUsersManagement";
import { AdminRolesManagement } from "./AdminRolesManagement";
import { CatalogView } from "./CatalogView";
import { ReportsView } from "./ReportsView";
import { DashboardView } from "./DashboardView";

interface AdminDashboardProps {
  onSwitchPortal?: (portal: "public" | "admin" | "company") => void;
}

export function AdminDashboard({ onSwitchPortal }: AdminDashboardProps) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedQueueItem, setSelectedQueueItem] = useState<any | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [companySearch, setCompanySearch] = useState("");
  const [auditFilter, setAuditFilter] = useState("all");

  // Review Queue interactive filter & live items
  const [queueFilter, setQueueFilter] = useState<"all" | "critical" | "ocr" | "field">("all");
  const [queueItems, setQueueItems] = useState([
    {
      id: "REV-901",
      product: "Optimum Nutrition Gold Standard 100% Whey",
      brand: "Glanbia / ON",
      batch: "OPN-2026-W98",
      expiry: "2027-06-09",
      barcode: "0748927028669",
      category: "Whey Protein",
      location: "Downtown Sports Mart, Shelf 2",
      status: "CRITICAL_FRAUD",
      statusTitle: "Tamper Neck Seal Misaligned",
      severity: "CRITICAL",
      confidence: 42.0,
      detail: "AI Packaging Forensics detected an unauthorized neck seal font, altered bottom batch stamp, and suspect hologram reflection. Dispatched for laboratory authentication.",
      image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=300&auto=format&fit=crop&q=80",
      date: "12m ago",
      type: "critical",
    },
    {
      id: "REV-902",
      product: "Apex Nitric Surge Hardcore Pre-Workout",
      brand: "Apex Sports Labs",
      batch: "APX-998",
      expiry: "2026-11-14",
      barcode: "0619985432109",
      category: "Pre-Workout Energy",
      location: "Mogadishu Border Cargo Terminal",
      status: "PROHIBITED_SUBSTANCE",
      statusTitle: "FDA Recall: Undeclared Stimulant",
      severity: "CRITICAL",
      confidence: 96.0,
      detail: "Official FDA Alert confirmed dangerous 1,3-dimethylamylamine (DMAA/DMHA derivatives) in sample. Seizure order in effect across all regional border checkpoints.",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80",
      date: "28m ago",
      type: "critical",
    },
    {
      id: "REV-903",
      product: "Cellucor C4 Extreme Pre-Workout Powder",
      brand: "Nutrabolt",
      batch: "C4-2025-BR",
      expiry: "2026-05-14",
      barcode: "0842595100012",
      category: "Pre-Workout",
      location: "Fitness First Retail Counter",
      status: "OCR_VERIFIED",
      statusTitle: "OCR & GS1 Match Confirmed",
      severity: "VERIFIED",
      confidence: 98.4,
      detail: "OCR successfully extracted laser batch stamp 'C4-2025-BR' matching Nutrabolt production golden record. Tamper seal verified intact with GS1 checksum valid.",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80",
      date: "1h ago",
      type: "ocr",
    },
    {
      id: "REV-904",
      product: "Dymatize ISO100 Gourmet Vanilla Isolate",
      brand: "BellRing Brands",
      batch: "DYM-2026-V01",
      expiry: "2027-04-12",
      barcode: "0705016112345",
      category: "Hydrolyzed Isolate",
      location: "Metro Gym Nutrition Corner",
      status: "INSPECTOR_PENDING",
      statusTitle: "Field Inspector Sampling Notice",
      severity: "INSPECTOR",
      confidence: 89.2,
      detail: "Field Inspector Dr. Sarah Al-Mansoor collected physical sample for routine HPLC purity analysis. Nitrogen assay confirmed 25.1g protein per scoop.",
      image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&auto=format&fit=crop&q=80",
      date: "2h ago",
      type: "field",
    },
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApproveQueueItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setQueueItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "APPROVED", severity: "VERIFIED", statusTitle: "Authorized by Compliance Officer" } : item
      )
    );
    triggerToast("Item authorized and verified in central database.");
    setIsDossierOpen(false);
  };

  const handleRejectQueueItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setQueueItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "CONFIRMED_COUNTERFEIT", severity: "CRITICAL", statusTitle: "Public Counterfeit Notice Issued" } : item
      )
    );
    triggerToast("Counterfeit warning broadcast to inspection task force.");
    setIsDossierOpen(false);
  };

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [sum, scans, reps] = await Promise.all([
          getAnalyticsSummary(),
          getScanHistory(undefined, 8),
          getReports(),
        ]);
        setAnalytics(sum);
        setRecentScans(scans);
        setReports(reps);
      } catch (e) {
        console.error(e);
      }
    }
    loadAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D18] text-slate-800 dark:text-slate-100 flex font-sans select-none antialiased">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. ADMIN SIDEBAR (Responsive drawer)                          */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:static w-64 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#091120] flex flex-col justify-between p-4 shrink-0 transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
              <div className="w-full h-full bg-white dark:bg-[#091120] rounded-[10px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan-600 dark:text-cyan-400 fill-current">
                  <path d="M12 2L2 7l10 15 10-15-10-5zm0 3.5L18.5 8 12 18 5.5 8 12 5.5z" />
                </svg>
              </div>
            </div>
            <span className="text-lg font-extrabold tracking-wider font-mono text-slate-900 dark:text-white shrink-0">
              VERI<span className="text-cyan-600 dark:text-cyan-400">FAI</span>
            </span>
            <span className="text-[9px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30 px-1.5 py-0.5 rounded shrink-0">
              ADMIN
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveMenu("dashboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeMenu === "dashboard" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveMenu("products")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeMenu === "products" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
            </button>

            <button
              onClick={() => setActiveMenu("companies")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeMenu === "companies" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Companies</span>
            </button>

            <button
              onClick={() => setActiveMenu("users")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeMenu === "users" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users Directory</span>
            </button>

            <button
              onClick={() => setActiveMenu("roles")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeMenu === "roles" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Roles & RBAC</span>
            </button>

            <button
              onClick={() => setActiveMenu("analytics")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeMenu === "analytics" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => onSwitchPortal && onSwitchPortal("company")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sidebar-btn transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Company Portal</span>
            </button>

            <button
              onClick={() => setActiveMenu("reports")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeMenu === "reports" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <FileWarning className="w-4 h-4" />
              <span>Report</span>
            </button>

            <button
              onClick={() => setActiveMenu("audit")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeMenu === "audit" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Audit Log</span>
            </button>

            <button
              onClick={() => setActiveMenu("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeMenu === "settings" ? "sidebar-btn-active" : "sidebar-btn"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Portal Switcher at Bottom */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2 block">
            Switch Portals
          </span>
          <button
            onClick={() => onSwitchPortal && onSwitchPortal("public")}
            className="w-full text-left px-3 py-2 rounded-lg bg-cyan-50 dark:bg-white/5 hover:bg-cyan-100 dark:hover:bg-white/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-transparent text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Public User Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSwitchPortal && onSwitchPortal("company")}
            className="w-full text-left px-3 py-2 rounded-lg bg-indigo-50 dark:bg-white/5 hover:bg-indigo-100 dark:hover:bg-white/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-transparent text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Company / Partner</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN ADMIN WORKSPACE                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 dark:bg-[#070D18]">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0A1323] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 md:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
              Central Anti-Counterfeit Telemetry & Compliance
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Portal Switcher Pills */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl text-xs">
              <button
                onClick={() => onSwitchPortal && onSwitchPortal("public")}
                className="px-3 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 transition-all font-medium cursor-pointer"
              >
                Public Portal
              </button>
              <button
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-white keep-white font-semibold shadow-md"
              >
                Admin Dashboard
              </button>
              <button
                onClick={() => onSwitchPortal && onSwitchPortal("company")}
                className="px-3 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 transition-all font-medium cursor-pointer"
              >
                Company Portal
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-48 pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-500 outline-none transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500" />
            </button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Lead Compliance Officer"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-500"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Admin</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          {activeMenu === "users" && <AdminUsersManagement />}
          {activeMenu === "roles" && <AdminRolesManagement />}

          {activeMenu === "dashboard" && (
            <>
              {/* Top 3 Metric Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Verified Companies */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-cyan-500/20 hover:border-cyan-400 dark:hover:border-cyan-500/50 transition-all shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Verified Companies</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">1,882</span>
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/30 px-1.5 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              {/* Cyan Sparkline Chart SVG */}
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <svg className="w-32 h-8 text-cyan-600 dark:text-cyan-400" viewBox="0 0 100 25" fill="none">
                  <path
                    d="M0 20 Q 20 15, 40 18 T 70 8 T 100 5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path
                    d="M0 20 Q 20 15, 40 18 T 70 8 T 100 5 L 100 25 L 0 25 Z"
                    fill="rgba(6, 182, 212, 0.15)"
                  />
                </svg>
                <span className="text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-300">+12% this month</span>
              </div>
            </div>

            {/* Card 2: Active Reports */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Reports</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">12</span>
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 px-1.5 py-0.5 rounded">
                      Pending
                    </span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <FileWarning className="w-5 h-5" />
                </div>
              </div>
              {/* Yellow Sparkline Chart SVG */}
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <svg className="w-32 h-8 text-amber-500 dark:text-amber-400" viewBox="0 0 100 25" fill="none">
                  <path
                    d="M0 15 Q 25 22, 50 12 T 80 16 T 100 8"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path
                    d="M0 15 Q 25 22, 50 12 T 80 16 T 100 8 L 100 25 L 0 25 Z"
                    fill="rgba(245, 158, 11, 0.15)"
                  />
                </svg>
                <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300">4 high priority</span>
              </div>
            </div>

            {/* Card 3: Pending Reviews */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-rose-500/20 hover:border-rose-400 dark:hover:border-rose-500/50 transition-all shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pending Reviews</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">7</span>
                    <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/30 px-1.5 py-0.5 rounded">
                      Reported
                    </span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              {/* Coral Bar Chart SVG */}
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-end gap-1.5 h-6">
                  <div className="w-2.5 bg-rose-500/40 h-3 rounded-t" />
                  <div className="w-2.5 bg-rose-500/60 h-4 rounded-t" />
                  <div className="w-2.5 bg-rose-500/80 h-2.5 rounded-t" />
                  <div className="w-2.5 bg-rose-500 h-5 rounded-t" />
                  <div className="w-2.5 bg-rose-400 h-6 rounded-t" />
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300">Inspector sign-off</span>
              </div>
            </div>
          </div>

          {/* Middle Row: Review Queue (Left 45%) + Verification Trends (Right 55%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Review Queue */}
            <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Review Queue</h3>
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono font-bold">1,947 Items</span>
              </div>

              <div className="space-y-2.5">
                {/* Queue Item 1: Verified */}
                <div
                  onClick={() => {
                    setSelectedQueueItem({
                      title: "Verified Companies Queue",
                      count: "1,882 companies",
                      detail: "All active registered sports nutrition companies with confirmed brand authorization certificates.",
                    });
                    setIsDossierOpen(true);
                  }}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-cyan-50/70 dark:bg-[#0D1527] dark:hover:bg-[#0C1527] border border-slate-200 dark:border-white/5 hover:border-cyan-400/50 dark:hover:border-cyan-500/30 flex items-center justify-between cursor-pointer transition-all shadow-2xs hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">Verified</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">1,882 companies</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Queue Item 2: OCR */}
                <div
                  onClick={() => {
                    setSelectedQueueItem({
                      title: "OCR Packaging Extractions",
                      count: "58 new reports",
                      detail: "Incoming photos with extracted laser batch stamps and expiry dates pending AI confidence confirmation.",
                    });
                    setIsDossierOpen(true);
                  }}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-[#0D1527] dark:hover:bg-[#0C1527] border border-slate-200 dark:border-white/5 hover:border-indigo-400/50 dark:hover:border-cyan-500/30 flex items-center justify-between cursor-pointer transition-all shadow-2xs hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">OCR Verification</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">58 new reports</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Queue Item 3: Send */}
                <div
                  onClick={() => {
                    setSelectedQueueItem({
                      title: "Manufacturer Batch Requests",
                      count: "4 new reports",
                      detail: "Dispatched batch verification inquiries to Glanbia and Dymatize brand security desks.",
                    });
                    setIsDossierOpen(true);
                  }}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/70 dark:bg-[#0D1527] dark:hover:bg-[#0C1527] border border-slate-200 dark:border-white/5 hover:border-amber-400/50 dark:hover:border-cyan-500/30 flex items-center justify-between cursor-pointer transition-all shadow-2xs hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">Send / Dispatch</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">4 new reports</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Queue Item 4: Field Reports */}
                <div
                  onClick={() => {
                    setSelectedQueueItem({
                      title: "Field Inspector Investigations",
                      count: "3 investigations",
                      detail: "Physical retail sampling dispatched for suspected counterfeit pre-workout powder in local gym kiosks.",
                    });
                    setIsDossierOpen(true);
                  }}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-rose-50/70 dark:bg-[#0D1527] dark:hover:bg-[#0C1527] border border-slate-200 dark:border-white/5 hover:border-rose-400/50 dark:hover:border-cyan-500/30 flex items-center justify-between cursor-pointer transition-all shadow-2xs hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileWarning className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors">Field Reports</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">3 investigations</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>

            {/* Verification Trends Glowing Multi-Line Wave Chart */}
            <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 p-6 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Verification Trends</h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Weekly throughput & market anomalies</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-3 text-[10px] font-mono mr-2">
                    <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" /> Genuine
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Batch Matched
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Anomalies
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer transition-colors">
                    Past 7 Days ▾
                  </span>
                </div>
              </div>

              {/* Glowing Multi-Wave Chart Canvas */}
              <div className="relative h-60 w-full pt-4">
                {/* Y-Axis Grid Lines & Labels */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-slate-400 dark:text-slate-600">
                  <div className="border-b border-white/5 pb-1 flex justify-between">
                    <span>250</span>
                    <span className="w-full border-b border-dashed border-white/5 ml-4" />
                  </div>
                  <div className="border-b border-white/5 pb-1 flex justify-between">
                    <span>150</span>
                    <span className="w-full border-b border-dashed border-white/5 ml-4" />
                  </div>
                  <div className="border-b border-white/5 pb-1 flex justify-between">
                    <span>100</span>
                    <span className="w-full border-b border-dashed border-white/5 ml-4" />
                  </div>
                  <div className="border-b border-white/5 pb-1 flex justify-between">
                    <span>50</span>
                    <span className="w-full border-b border-dashed border-white/5 ml-4" />
                  </div>
                  <div className="pb-1 flex justify-between">
                    <span>0</span>
                    <span className="w-full border-b border-white/10 ml-4" />
                  </div>
                </div>

                {/* SVG Glowing Smooth Waves */}
                <svg className="w-full h-full pl-6 overflow-visible" viewBox="0 0 700 200" fill="none">
                  <defs>
                    <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="emeraldGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Wave 1: Cyan (Genuine) */}
                  <path
                    d="M 0 140 C 100 80, 200 160, 300 90 C 400 30, 500 110, 600 50 C 650 30, 700 70, 700 70"
                    stroke="#06B6D4"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  />
                  <path
                    d="M 0 140 C 100 80, 200 160, 300 90 C 400 30, 500 110, 600 50 C 650 30, 700 70, 700 70 L 700 200 L 0 200 Z"
                    fill="url(#cyanGlow)"
                  />

                  {/* Wave 2: Emerald (Batch Matched) */}
                  <path
                    d="M 0 165 C 100 120, 200 180, 300 130 C 400 70, 500 140, 600 90 C 650 75, 700 110, 700 110"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]"
                  />

                  {/* Wave 3: Amber (Anomalies / Suspicious) */}
                  <path
                    d="M 0 185 C 100 170, 200 190, 300 165 C 400 150, 500 175, 600 140 C 650 130, 700 155, 700 155"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                  />
                </svg>

                {/* X-Axis Days of Week Labels */}
                <div className="flex justify-between pl-6 text-[10px] font-mono text-slate-400 pt-2">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>
          </>
          )}

          {/* 2. PRODUCTS MODULE */}
          {activeMenu === "products" && (
            <div className="space-y-6 animate-in fade-in">
              <CatalogView
                onVerifyProduct={(code) => {
                  setSelectedQueueItem({
                    id: "GTIN-" + code.slice(-6),
                    product: "Supplement Product (Barcode: " + code + ")",
                    brand: "Authoritative Central Registry",
                    batch: "BATCH-" + Math.floor(1000 + Math.random() * 9000),
                    statusTitle: "GS1 Barcode Record Verified",
                    severity: "VERIFIED",
                    confidence: 99.0,
                    detail: "Barcode " + code + " cross-referenced with manufacturer batch production ledger. Authenticity parameters confirmed.",
                  });
                  setIsDossierOpen(true);
                }}
              />
            </div>
          )}

          {/* 3. COMPANIES MODULE */}
          {activeMenu === "companies" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Building2 className="w-7 h-7 text-cyan-500 dark:text-cyan-400" />
                    Authorized Supplement Brands & Manufacturers
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    1,882 registered nutrition brands connected via cryptographically signed manufacturer nodes.
                  </p>
                </div>
                <button
                  onClick={() => triggerToast("Registration invitation dispatched to brand compliance team.")}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Register Brand Partner</span>
                </button>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-cyan-500/20 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Registered Brands</span>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">1,882</div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">+14 new this quarter</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-emerald-500/20 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Network Compliance Score</span>
                  <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">99.8%</div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">All tamper-seal ledgers verified</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-amber-500/20 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Audits in Progress</span>
                  <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">6 Brands</div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">Annual cGMP recertification</span>
                </div>
              </div>

              {/* Companies Table */}
              <div className="rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search supplement brand or manufacturer..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-[#091120] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Showing 5 Authoritative Brand Nodes</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-[#091120] text-slate-600 dark:text-slate-400 text-[11px] font-mono border-b border-slate-200 dark:border-white/5">
                      <tr>
                        <th className="p-3.5">Brand / Manufacturer</th>
                        <th className="p-3.5">Category Specialization</th>
                        <th className="p-3.5">HQ / Manufacturing Origin</th>
                        <th className="p-3.5">Active Batches</th>
                        <th className="p-3.5">Compliance</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-200">
                      {[
                        {
                          name: "Optimum Nutrition (Glanbia Nutritionals)",
                          category: "Whey Protein, Creatine, Amino Acids",
                          origin: "Downers Grove, Illinois, USA",
                          batches: "48 Batches",
                          score: "99.8%",
                          badge: "VERIFIED GOLD",
                        },
                        {
                          name: "Nutrabolt (Cellucor / XTEND)",
                          category: "Pre-Workouts, Intra-Workout BCAA",
                          origin: "Austin, Texas, USA",
                          batches: "26 Batches",
                          score: "99.4%",
                          badge: "VERIFIED GOLD",
                        },
                        {
                          name: "Dymatize Nutrition (Post Holdings)",
                          category: "ISO 100 Hydrolyzed Whey, Mass Gainer",
                          origin: "Dallas, Texas, USA",
                          batches: "31 Batches",
                          score: "99.1%",
                          badge: "VERIFIED GOLD",
                        },
                        {
                          name: "Iovate Health Sciences (MuscleTech)",
                          category: "NitroTech Whey, CellTech Creatine",
                          origin: "Oakville, Ontario, Canada",
                          batches: "19 Batches",
                          score: "98.7%",
                          badge: "TIER 1 ACTIVE",
                        },
                        {
                          name: "Thorne HealthTech",
                          category: "Clinical Grade Supplements, NSF Sport",
                          origin: "Summerville, South Carolina, USA",
                          batches: "42 Batches",
                          score: "100.0%",
                          badge: "VERIFIED GOLD",
                        },
                      ]
                        .filter((c) => c.name.toLowerCase().includes(companySearch.toLowerCase()))
                        .map((c, i) => (
                          <tr key={i} className="hover:bg-cyan-50/40 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                              <span>{c.name}</span>
                            </td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300">{c.category}</td>
                            <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{c.origin}</td>
                            <td className="p-3.5 font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{c.batches}</td>
                            <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{c.score}</td>
                            <td className="p-3.5">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                                {c.badge}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => triggerToast(`Auditing partner telemetry for ${c.name}...`)}
                                className="px-3 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                View Dossier
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. ANALYTICS MODULE */}
          {activeMenu === "analytics" && (
            <div className="space-y-6 animate-in fade-in">
              <DashboardView />
            </div>
          )}

          {/* 5. REPORTS MODULE */}
          {activeMenu === "reports" && (
            <div className="space-y-6 animate-in fade-in">
              <ReportsView />
            </div>
          )}

          {/* 6. AUDIT LOG MODULE */}
          {activeMenu === "audit" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Clock className="w-7 h-7 text-cyan-500 dark:text-cyan-400" />
                    Cryptographic Immutable Audit Ledger
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    SHA-256 sealed operational records of compliance approvals, batch authorisations, and fraud alerts.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ledger Integrity 100% Intact</span>
                </div>
              </div>

              {/* Audit Table */}
              <div className="rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">Recent Compliance & Security Events</span>
                  <span>Real-time append-only stream</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-[#091120] text-slate-600 dark:text-slate-400 text-[11px] font-mono border-b border-slate-200 dark:border-white/5">
                      <tr>
                        <th className="p-3.5">Event ID</th>
                        <th className="p-3.5">Timestamp</th>
                        <th className="p-3.5">Officer / System Actor</th>
                        <th className="p-3.5">Operation Performed</th>
                        <th className="p-3.5">Target Entity</th>
                        <th className="p-3.5">IP Address</th>
                        <th className="p-3.5 text-right">Hash Signature</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-200 font-mono">
                      {[
                        {
                          id: "LOG-9812",
                          time: "3m ago",
                          actor: "Chief Inspector Hassan",
                          action: "Batch Run Authorized",
                          target: "Optimum Nutrition (OPN-2026-W98)",
                          ip: "192.168.1.104",
                          hash: "8f4a...92b1",
                          color: "text-emerald-400",
                        },
                        {
                          id: "LOG-9811",
                          time: "19m ago",
                          actor: "AI Forensics Engine",
                          action: "Counterfeit Tamper Seal Flagged",
                          target: "Apex Nitric Surge (APX-998)",
                          ip: "10.0.4.12",
                          hash: "3c1e...77d4",
                          color: "text-amber-400",
                        },
                        {
                          id: "LOG-9810",
                          time: "48m ago",
                          actor: "Officer Amina Farah",
                          action: "GS1 Barcode Ledger Synchronized",
                          target: "Cellucor C4 Extreme (0842595100012)",
                          ip: "192.168.1.88",
                          hash: "a2b9...14e2",
                          color: "text-cyan-400",
                        },
                        {
                          id: "LOG-9809",
                          time: "1h 12m ago",
                          actor: "Field Compliance Force",
                          action: "Seizure Notice Broadcast",
                          target: "Kismayo Regional Gym Distributor",
                          ip: "192.168.1.15",
                          hash: "7f90...33c8",
                          color: "text-rose-400",
                        },
                        {
                          id: "LOG-9808",
                          time: "3h ago",
                          actor: "Glanbia Brand Security Node",
                          action: "New Lab Assay COA Uploaded",
                          target: "COA-ON-2024-WHEY.pdf",
                          ip: "54.210.88.9",
                          hash: "91e4...bb50",
                          color: "text-cyan-400",
                        },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="p-3.5 text-cyan-400 font-bold">{item.id}</td>
                          <td className="p-3.5 text-slate-400">{item.time}</td>
                          <td className="p-3.5 text-white font-sans font-medium">{item.actor}</td>
                          <td className={`p-3.5 font-bold ${item.color}`}>{item.action}</td>
                          <td className="p-3.5 text-slate-300 font-sans">{item.target}</td>
                          <td className="p-3.5 text-slate-400">{item.ip}</td>
                          <td className="p-3.5 text-right text-cyan-300">{item.hash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 7. SETTINGS MODULE */}
          {activeMenu === "settings" && (
            <div className="space-y-6 animate-in fade-in max-w-4xl">
              <div>
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                  <Settings className="w-7 h-7 text-cyan-400" />
                  System Security & Verification Parameters
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Configure AI OCR tolerance, GS1 ledger webhooks, and regulatory enforcement thresholds.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#0D172A] border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    AI Packaging Forensics & Tolerance Thresholds
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#091120] border border-white/5">
                      <div>
                        <span className="font-bold text-white block">Tamper Neck Seal AI Confidence Requirement</span>
                        <span className="text-slate-400 text-[11px]">Reject scans if holographic print accuracy falls below threshold</span>
                      </div>
                      <span className="font-mono text-cyan-400 font-bold px-2 py-1 bg-cyan-950 rounded">95.0%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#091120] border border-white/5">
                      <div>
                        <span className="font-bold text-white block">Automated Field Task Force Seizure Dispatch</span>
                        <span className="text-slate-400 text-[11px]">Automatically broadcast notices when banned DMAA/DMHA stimulants detected</span>
                      </div>
                      <span className="text-emerald-400 font-mono text-[11px] font-bold">ENABLED</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#091120] border border-white/5">
                      <div>
                        <span className="font-bold text-white block">Global GS1 Barcode Registry Webhook</span>
                        <span className="text-slate-400 text-[11px]">Real-time synchronization with international supplement databases</span>
                      </div>
                      <span className="text-emerald-400 font-mono text-[11px] font-bold">CONNECTED (200 OK)</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D172A] border border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">System Visual Theme Mode</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Toggle between high-contrast dark cybersecurity mode and crisp light daylight mode.</p>
                  </div>
                  <ThemeToggle showLabel />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold text-xs shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-cyan-400/40">
          <Sparkles className="w-4 h-4 text-cyan-200 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Forensic Dossier Inspection Modal */}
      {isDossierOpen && selectedQueueItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#091120] border border-cyan-500/30 p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                {selectedQueueItem.image && (
                  <img
                    src={selectedQueueItem.image}
                    alt={selectedQueueItem.product || selectedQueueItem.title}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-cyan-500/40 shrink-0"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {selectedQueueItem.id || "QUEUE-ITEM"}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                      {selectedQueueItem.statusTitle || selectedQueueItem.status || "Investigation"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedQueueItem.product || selectedQueueItem.title}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    {selectedQueueItem.brand && `${selectedQueueItem.brand} • `}
                    {selectedQueueItem.batch || selectedQueueItem.count}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDossierOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Evidence & Forensics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Barcode (GTIN-13)</span>
                <div className="font-mono text-cyan-300 font-semibold">{selectedQueueItem.barcode || "0748927028669"}</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono pt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> GS1 Checksum Valid
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Batch & Shelf Life</span>
                <div className="font-mono text-white font-semibold">
                  {selectedQueueItem.batch || "OPN-2026-W98"} (Exp: {selectedQueueItem.expiry || "2027-06"})
                </div>
                <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                  Reported at: {selectedQueueItem.location || "Central Regional Point"}
                </div>
              </div>
            </div>

            {/* AI Forensics Finding */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Forensic Analysis & Visual Discrepancy Findings
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedQueueItem.detail}
              </p>
            </div>

            {/* Compliance Decision Actions */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsDossierOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Dismiss Window
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleRejectQueueItem(selectedQueueItem.id, e)}
                  className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  Confirm Counterfeit & Issue Recall
                </button>

                <button
                  type="button"
                  onClick={(e) => handleApproveQueueItem(selectedQueueItem.id, e)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  Authorize & Release Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
