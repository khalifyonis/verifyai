"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Package,
  Layers,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  Upload,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Eye,
  X,
  Sparkles,
  QrCode,
  Calendar,
  Lock,
  Globe,
  RefreshCw,
  Clock,
  ArrowRight,
  Barcode,
  Tag,
  Shield
} from "lucide-react";
import { getProducts, getScanHistory } from "@/lib/api";
import { ThemeToggle } from "./ThemeToggle";

interface CompanyPartnerPortalProps {
  onSwitchPortal?: (portal: "public" | "admin" | "company") => void;
}

export function CompanyPartnerPortal({ onSwitchPortal }: CompanyPartnerPortalProps) {
  const [activeTab, setActiveTab] = useState<"batches" | "products" | "telemetry" | "coas">("batches");
  const [isRegisterBatchOpen, setIsRegisterBatchOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);

  // New batch form state
  const [newBatchCode, setNewBatchCode] = useState("");
  const [newGtin, setNewGtin] = useState("0748927028669");
  const [newMfgDate, setNewMfgDate] = useState("2024-11-01");
  const [newExpDate, setNewExpDate] = useState("2026-11-01");
  const [newUnits, setNewUnits] = useState("25000");
  const [newSealType, setNewSealType] = useState("Micro-Embossed Golden Hologram + Neck Band");
  const [batchList, setBatchList] = useState([
    {
      id: "b-101",
      productName: "Gold Standard 100% Whey (Double Rich Chocolate)",
      gtin: "0748927028669",
      batchCode: "ON-WHEY-2024-B1",
      mfgDate: "2024-01-15",
      expDate: "2026-06-30",
      unitsProduced: 45000,
      scansCount: 18420,
      status: "Active",
      sealType: "Micro-Embossed Golden Hologram",
      certifications: ["Informed-Choice", "GMP"],
      tamperReports: 0,
    },
    {
      id: "b-102",
      productName: "Micronized Creatine Powder 300g",
      gtin: "0748927054941",
      batchCode: "ON-CREAT-2024-C3",
      mfgDate: "2024-03-01",
      expDate: "2027-02-28",
      unitsProduced: 30000,
      scansCount: 9340,
      status: "Active",
      sealType: "Laser Vacuum Foil + Lot Stamped",
      certifications: ["Creapure Registered", "Informed-Sport"],
      tamperReports: 0,
    },
    {
      id: "b-103",
      productName: "ISO100 Hydrolyzed Whey Protein 5lb (Gourmet Chocolate)",
      gtin: "0705016335123",
      batchCode: "DYM-ISO-2024-09A",
      mfgDate: "2024-04-10",
      expDate: "2026-08-31",
      unitsProduced: 28000,
      scansCount: 7110,
      status: "Active",
      sealType: "Dymatize Tamper-Evident Safety Cap",
      certifications: ["Informed-Choice", "Banned Substance Tested"],
      tamperReports: 1,
    },
    {
      id: "b-104",
      productName: "C4 Original Pre-Workout 30 Servings (Fruit Punch)",
      gtin: "0842595101234",
      batchCode: "CEL-C4-2024-F4",
      mfgDate: "2024-02-20",
      expDate: "2025-12-31",
      unitsProduced: 50000,
      scansCount: 12450,
      status: "Active",
      sealType: "Cellucor Pressure-Sensitive Seal",
      certifications: ["NSF Certified for Sport"],
      tamperReports: 0,
    },
  ]);

  const [counterfeitAlerts, setCounterfeitAlerts] = useState([
    {
      id: "flag-001",
      product: "Gold Standard 100% Whey 5lb",
      barcode: "0748927028669",
      fakeBatch: "ON-FAKE-8899",
      flagReason: "Unregistered Batch Code & Mismatched Font Kerning on Tub Neck",
      reportedLocation: "Mogadishu Retailer / Marketplace",
      timestamp: "Today at 14:22",
      status: "Under Review",
      severity: "High",
    },
    {
      id: "flag-002",
      product: "Micronized Creatine Powder",
      barcode: "0748927054941",
      fakeBatch: "ON-CREAT-EXPIRED",
      flagReason: "Expired Batch Past Shelf Life (Exp: 2023-01-15) being relabeled",
      reportedLocation: "Regional Distributor",
      timestamp: "Yesterday at 18:40",
      status: "Confirmed Tampered",
      severity: "Critical",
    },
  ]);

  const handleRegisterBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchCode) return;
    const newEntry = {
      id: `b-${Date.now()}`,
      productName: newGtin === "0748927028669" ? "Gold Standard 100% Whey" : "Micronized Creatine Powder",
      gtin: newGtin,
      batchCode: newBatchCode.toUpperCase(),
      mfgDate: newMfgDate,
      expDate: newExpDate,
      unitsProduced: parseInt(newUnits) || 10000,
      scansCount: 0,
      status: "Active",
      sealType: newSealType,
      certifications: ["Informed-Choice", "Brand Ledger Verified"],
      tamperReports: 0,
    };
    setBatchList([newEntry, ...batchList]);
    setIsRegisterBatchOpen(false);
    setNewBatchCode("");
  };

  const renderTamperSealBadge = (sealType: string) => {
    if (sealType.includes("Hologram")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 shadow-2xs">
          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{sealType}</span>
        </span>
      );
    }
    if (sealType.includes("Foil") || sealType.includes("Laser")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 shadow-2xs">
          <Shield className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>{sealType}</span>
        </span>
      );
    }
    if (sealType.includes("Cap")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 shadow-2xs">
          <Lock className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>{sealType}</span>
        </span>
      );
    }
    if (sealType.includes("Pressure") || sealType.includes("Seal")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 shadow-2xs">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{sealType}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40 shadow-2xs">
        <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
        <span>{sealType}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D18] text-slate-800 dark:text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & PORTAL SWITCHER                               */}
      {/* ------------------------------------------------------------- */}
      <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#091120] px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-4">
          {/* Origami Logo */}
          <div className="flex items-center gap-3">
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
          </div>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block" />

          {/* Portal Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 px-2.5 py-1 rounded-md tracking-wider">
              COMPANY / BRAND PARTNER PORTAL
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
              <CheckCircle2 className="w-3 h-3" />
              Glanbia / Optimum Nutrition #V-8941
            </span>
          </div>
        </div>

        {/* Universal Switcher & Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Portal Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl text-xs">
            <button
              onClick={() => onSwitchPortal && onSwitchPortal("public")}
              className="px-3 py-1 rounded-lg text-slate-700 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-all font-semibold cursor-pointer"
            >
              Public Portal
            </button>
            <button
              onClick={() => onSwitchPortal && onSwitchPortal("admin")}
              className="px-3 py-1 rounded-lg text-slate-700 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-all font-semibold cursor-pointer"
            >
              Admin Dashboard
            </button>
            <button
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white keep-white font-bold shadow-md"
            >
              Company Portal
            </button>
          </div>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          <button
            onClick={() => setIsRegisterBatchOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white keep-white text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Register Batch</span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. SUB-NAV / SUMMARY BAR                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-100/70 dark:bg-[#0A1323] border-b border-slate-200 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Brand Product & Batch Ledger
              </h1>
              <span className="text-xs bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                Authoritative Manufacturer Node
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Register production runs, update tamper-proof packaging features, and monitor real-time consumer verification telemetry worldwide.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-200/60 dark:bg-[#080E1B] p-1.5 rounded-2xl border border-slate-300 dark:border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab("batches")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTab === "batches" ? "nav-tab-active" : "nav-tab"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Batch Ledger ({batchList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTab === "products" ? "nav-tab-active" : "nav-tab"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Supplement SKUs</span>
            </button>

            <button
              onClick={() => setActiveTab("telemetry")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTab === "telemetry" ? "nav-tab-active" : "nav-tab"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Flagged Scans ({counterfeitAlerts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("coas")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTab === "coas" ? "nav-tab-active" : "nav-tab"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Lab COAs & Certs</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. METRIC KPI CARDS                                           */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Registered Batches */}
          <div className="rounded-2xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-white/10 p-5 relative overflow-hidden group hover:border-cyan-400 dark:hover:border-cyan-500/40 transition-all shadow-xs hover:shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none hidden dark:block" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold tracking-wide">Active Batch Runs</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-700 dark:text-cyan-300 shadow-2xs dark:shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Layers className="w-4.5 h-4.5 text-cyan-700 dark:text-cyan-300" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{batchList.length}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                +2 this month
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              153,000 total supplement units registered
            </div>
          </div>

          {/* Card 2: Consumer Scans */}
          <div className="rounded-2xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-white/10 p-5 relative overflow-hidden group hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all shadow-xs hover:shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none hidden dark:block" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold tracking-wide">Consumer Verifications</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-500/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 shadow-2xs dark:shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                <QrCode className="w-4.5 h-4.5 text-indigo-700 dark:text-indigo-300" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">47,320</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                99.1% Genuine
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              Scanned across 14 countries in 30 days
            </div>
          </div>

          {/* Card 3: Counterfeit Signals */}
          <div className="rounded-2xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-white/10 p-5 relative overflow-hidden group hover:border-amber-400 dark:hover:border-amber-500/40 transition-all shadow-xs hover:shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none hidden dark:block" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold tracking-wide">Counterfeit Flags</span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-700 dark:text-amber-300 shadow-2xs dark:shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{counterfeitAlerts.length}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-500/40 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                Action Needed
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              High-priority alerts awaiting brand response
            </div>
          </div>

          {/* Card 4: Integrity Score */}
          <div className="rounded-2xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-white/10 p-5 relative overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none hidden dark:block" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold tracking-wide">Brand Integrity Grade</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shadow-2xs dark:shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-700 dark:text-emerald-300" />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">AAA+</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-500/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                100% GS1 Compliant
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              Informed-Sport & NSF Ledger Connected
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. TAB CONTENTS                                               */}
        {/* ------------------------------------------------------------- */}

        {/* TAB A: BATCH LEDGER TABLE */}
        {activeTab === "batches" && (
          <div className="rounded-2xl bg-white dark:bg-[#0A1323] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#0C1527]">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Official Batch Verification Ledger
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                  Consumer app scans verify against these exact batch codes, laser engravings, and expiration timestamps.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search batch code or SKU..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-500 transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  onClick={() => setIsRegisterBatchOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Batch
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-[#091120] text-slate-700 dark:text-slate-300 text-[11px] font-mono font-bold border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-4">BATCH CODE</th>
                    <th className="py-3 px-4">SUPPLEMENT PRODUCT / GTIN</th>
                    <th className="py-3 px-4">MFG / EXPIRY DATE</th>
                    <th className="py-3 px-4">TAMPER SEAL FEATURE</th>
                    <th className="py-3 px-4">VERIFICATIONS</th>
                    <th className="py-3 px-4">LEDGER STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {batchList.map((batch) => (
                    <tr key={batch.id} className="hover:bg-cyan-50/50 dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 font-mono font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs">
                          <Tag className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          {batch.batchCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{batch.productName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 mt-0.5 font-medium">
                          <Barcode className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>GTIN:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">{batch.gtin}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded-md">
                          <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Exp: {batch.expDate}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-1 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          Mfg: {batch.mfgDate}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {renderTamperSealBadge(batch.sealType)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                            {batch.scansCount.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">scans</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/50 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {batch.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedBatch(batch);
                            setIsDetailOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 text-xs font-bold transition-all shadow-2xs hover:shadow-cyan-500/20 cursor-pointer inline-flex items-center gap-1.5 ml-auto"
                        >
                          <span>View Dossier</span>
                          <ExternalLink className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB B: SUPPLEMENT SKUS */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white dark:bg-[#0A1323] border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 px-2 py-0.5 rounded">
                  PROTEIN POWDER
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">GS1 Verified</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Gold Standard 100% Whey</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                24g Whey Isolate Blend with 5.5g BCAAs per serving. Verified tamper-evident golden neck band and bottom imprint.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex justify-between">
                <span>GTIN: 0748927028669</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">3 Batches Active</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#0A1323] border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded">
                  CREATINE
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">Creapure® Certified</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Micronized Creatine Powder</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                100% Pure Creatine Monohydrate. Batch numbered with ultraviolet fluorescent ink on tub base.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex justify-between">
                <span>GTIN: 0748927054941</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">2 Batches Active</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#0A1323] border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-500/30 px-2 py-0.5 rounded">
                  PRE-WORKOUT
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">NSF Sport</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">C4 Original Pre-Workout</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Explosive Energy blend with CarnoSyn Beta-Alanine. Heat-sealed inner vacuum membrane.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex justify-between">
                <span>GTIN: 0842595101234</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">1 Batch Active</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: COUNTERFEIT TELEMETRY */}
        {activeTab === "telemetry" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  Consumer Fraud Incident Alerts
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                  When a consumer scans a product that fails the batch ledger, tamper seal check, or matches an unauthorized batch pattern, it is escalated here directly to your brand compliance team.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#0A1323] border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden shadow-xs">
              {counterfeitAlerts.map((alert) => (
                <div key={alert.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-amber-50/20 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-rose-50 dark:bg-red-950 text-rose-700 dark:text-red-400 border border-rose-200 dark:border-red-500/30 px-2 py-0.5 rounded">
                        {alert.severity} SEVERITY
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{alert.timestamp}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">• {alert.reportedLocation}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {alert.product} — Fake Batch: <span className="font-mono text-amber-600 dark:text-amber-400">{alert.fakeBatch}</span>
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Flag Reason: </span>
                      {alert.flagReason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-semibold cursor-pointer transition-colors">
                      Inspect Photo Evidence
                    </button>
                    <button className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors">
                      Issue Warning Notice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB D: LAB COAS */}
        {activeTab === "coas" && (
          <div className="rounded-2xl bg-white dark:bg-[#0A1323] border border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Third-Party Certificates of Analysis (COA)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload independent laboratory heavy metal tests, HPLC protein purity assays, and microbiological safety sheets.
                </p>
              </div>
              <button className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Upload New Lab Assay
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#091120] border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">COA-ON-2024-WHEY.pdf</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">Passed (100%)</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  HPLC Protein Assay: 78.4% total protein content. Zero heavy metals detected (Lead &lt; 0.01 ppm).
                </p>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Eurofins Scientific • Verified Oct 2024</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#091120] border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-400">COA-DYM-ISO-PURE.pdf</span>
                  <span className="text-emerald-400 font-mono">Passed (100%)</span>
                </div>
                <p className="text-xs text-slate-300">
                  LGC Informed-Sport WADA Banned Substances Screen: 285 substances tested. Negative for all anabolics.
                </p>
                <div className="text-[10px] text-slate-500 font-mono">LGC Newmarket Lab • Verified Sep 2024</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 5. REGISTER NEW BATCH MODAL                                   */}
      {/* ------------------------------------------------------------- */}
      {isRegisterBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B1323] border border-slate-200 dark:border-cyan-500/30 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Register Production Batch</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Add an authentic production run to the VERIFAI Brand Ledger</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterBatchOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterBatch} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Product SKU
                </label>
                <select
                  value={newGtin}
                  onChange={(e) => setNewGtin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                >
                  <option value="0748927028669">Optimum Nutrition Gold Standard 100% Whey (0748927028669)</option>
                  <option value="0748927054941">Optimum Nutrition Micronized Creatine 300g (0748927054941)</option>
                  <option value="0705016335123">Dymatize ISO100 Hydrolyzed Whey 5lb (0705016335123)</option>
                  <option value="0842595101234">Cellucor C4 Original Pre-Workout (0842595101234)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Batch Code / Lot No.
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ON-WHEY-2024-B2"
                    value={newBatchCode}
                    onChange={(e) => setNewBatchCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono uppercase outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Units Produced
                  </label>
                  <input
                    type="number"
                    value={newUnits}
                    onChange={(e) => setNewUnits(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Manufacturing Date
                  </label>
                  <input
                    type="date"
                    value={newMfgDate}
                    onChange={(e) => setNewMfgDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={newExpDate}
                    onChange={(e) => setNewExpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tamper-Evident Packaging Feature
                </label>
                <input
                  type="text"
                  value={newSealType}
                  onChange={(e) => setNewSealType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterBatchOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Register to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. BATCH DOSSIER MODAL                                        */}
      {/* ------------------------------------------------------------- */}
      {isDetailOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B1323] border border-slate-200 dark:border-cyan-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                  OFFICIAL BATCH RECORD
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-mono">{selectedBatch.batchCode}</h3>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080E1B] border border-slate-200 dark:border-white/5 space-y-1">
                <div className="text-slate-500 dark:text-slate-400 font-semibold">Product:</div>
                <div className="font-bold text-slate-900 dark:text-white">{selectedBatch.productName}</div>
                <div className="font-mono text-cyan-600 dark:text-cyan-300 text-[11px]">GTIN: {selectedBatch.gtin}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080E1B] border border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold block">Mfg Date</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedBatch.mfgDate}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080E1B] border border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold block">Expiry Date</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedBatch.expDate}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080E1B] border border-slate-200 dark:border-white/5 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold block">Tamper-Proof Seal Specs</span>
                <span className="text-slate-900 dark:text-white font-medium">{selectedBatch.sealType}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080E1B] border border-slate-200 dark:border-white/5 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold block">Certifications Connected</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedBatch.certifications.map((cert: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 text-[10px] font-mono font-semibold">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
