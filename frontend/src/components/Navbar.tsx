"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, ScanLine, Database, FileWarning, BarChart3, Sparkles } from "lucide-react";
import { seedDemoDatabase } from "@/lib/api";

interface NavbarProps {
  activeTab: "scan" | "catalog" | "dashboard" | "reports";
  onTabChange: (tab: "scan" | "catalog" | "dashboard" | "reports") => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await seedDemoDatabase();
      setSeedStatus("DB Seeded!");
      setTimeout(() => setSeedStatus(null), 3000);
    } catch (e) {
      setSeedStatus("Seed error");
      setTimeout(() => setSeedStatus(null), 3000);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#070B14]/85 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onTabChange("scan")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-emerald-500/20 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <ShieldCheck className="w-6 h-6 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm -z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                VERI<span className="text-cyan-600 dark:text-cyan-400">FAI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 rounded-full">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Evidence-Based Fitness & Supplement Verification</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 rounded-xl backdrop-blur-md">
          <button
            onClick={() => onTabChange("scan")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "scan"
                ? "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-400 dark:border-cyan-500/30 shadow-xs"
                : "text-slate-700 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.04]"
            }`}
          >
            <ScanLine className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Scan & Verify
          </button>

          <button
            onClick={() => onTabChange("catalog")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "catalog"
                ? "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-400 dark:border-cyan-500/30 shadow-xs"
                : "text-slate-700 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.04]"
            }`}
          >
            <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Product Registry
          </button>

          <button
            onClick={() => onTabChange("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-400 dark:border-cyan-500/30 shadow-xs"
                : "text-slate-700 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.04]"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Inspector Ops
          </button>

          <button
            onClick={() => onTabChange("reports")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "reports"
                ? "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-400 dark:border-cyan-500/30 shadow-xs"
                : "text-slate-700 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.04]"
            }`}
          >
            <FileWarning className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            Active Alerts
          </button>
        </nav>

        {/* Right CTA / Demo Seeder */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            title="Seed sample genuine and counterfeit products"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {seeding ? "Seeding..." : seedStatus || "Seed Demo Data"}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            GS1 Engine Active
          </div>
        </div>
      </div>

      {/* Mobile Tab bar */}
      <div className="flex md:hidden border-t border-white/5 bg-[#070B14] px-2 py-1 justify-around">
        <button
          onClick={() => onTabChange("scan")}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            activeTab === "scan" ? "text-cyan-400 font-semibold" : "text-slate-400"
          }`}
        >
          <ScanLine className="w-4 h-4 mb-0.5" />
          Scan
        </button>
        <button
          onClick={() => onTabChange("catalog")}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            activeTab === "catalog" ? "text-cyan-400 font-semibold" : "text-slate-400"
          }`}
        >
          <Database className="w-4 h-4 mb-0.5" />
          Catalog
        </button>
        <button
          onClick={() => onTabChange("dashboard")}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            activeTab === "dashboard" ? "text-cyan-400 font-semibold" : "text-slate-400"
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          Inspector
        </button>
        <button
          onClick={() => onTabChange("reports")}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            activeTab === "reports" ? "text-cyan-400 font-semibold" : "text-slate-400"
          }`}
        >
          <FileWarning className="w-4 h-4 mb-0.5" />
          Reports
        </button>
      </div>
    </header>
  );
}
