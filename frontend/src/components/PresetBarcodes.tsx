"use client";

import React from "react";
import { Sparkles, ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle, Zap, Dumbbell } from "lucide-react";

interface PresetBarcodesProps {
  onSelectPreset: (preset: {
    barcode: string;
    batch_number?: string;
    expiry_date?: string;
    product_name_hint?: string;
    label: string;
  }) => void;
}

export function PresetBarcodes({ onSelectPreset }: PresetBarcodesProps) {
  const presets = [
    {
      label: "ON Gold Standard Whey 5lb",
      sub: "Double Rich Chocolate 5lb",
      badge: "VERIFIED",
      color: "emerald",
      icon: ShieldCheck,
      barcode: "0748927028669",
      batch_number: "OPN-2026-W98",
      expiry_date: "2027-06-09",
      product_name_hint: "Optimum Nutrition Gold Standard Whey",
      desc: "Authentic GTIN + Informed Sport Batch",
    },
    {
      label: "ON Creatine Monohydrate",
      sub: "Unflavored 300g / 60 Serv",
      badge: "VERIFIED",
      color: "emerald",
      icon: ShieldCheck,
      barcode: "0748927024104",
      batch_number: "ONC-84920",
      expiry_date: "2027-04-14",
      product_name_hint: "Optimum Nutrition Creatine",
      desc: "Creapure quality mark + verified batch",
    },
    {
      label: "Counterfeit Creatine Tub",
      sub: "Cloned GTIN / Fake Lot",
      badge: "SUSPICIOUS",
      color: "amber",
      icon: AlertTriangle,
      barcode: "0748927024104",
      batch_number: "FAKE-LOT-999",
      expiry_date: "2029-12-31",
      product_name_hint: "Optimum Nutrition Creatine",
      desc: "Legit barcode with unregistered batch",
    },
    {
      label: "Apex Pre-Workout Recall",
      sub: "DMAA Contamination",
      badge: "OFFICIAL WARNING",
      color: "rose",
      icon: AlertOctagon,
      barcode: "0619985432109",
      batch_number: "APX-998",
      expiry_date: "2025-11-14",
      product_name_hint: "Apex Nitric Surge",
      desc: "FDA dietary supplement safety alert",
    },
    {
      label: "Unregistered Generic Brand",
      sub: "Niche Protein Powder",
      badge: "NOT VERIFIED",
      color: "slate",
      icon: HelpCircle,
      barcode: "0890123999992",
      batch_number: "GEN-2024",
      expiry_date: "2026-08-30",
      product_name_hint: "Generic Protein Powder",
      desc: "Absent from registry (≠ counterfeit)",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 p-4 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Fitness & Sports Nutrition Verification Presets
          </h4>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">1-Click Test Scenarios</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {presets.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPreset(p)}
              className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-white/5 hover:border-cyan-400 dark:hover:border-cyan-500/40 transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                      p.color === "emerald"
                        ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                        : p.color === "amber"
                        ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                        : p.color === "rose"
                        ? "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                        : "bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600/30"
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block line-clamp-1">
                  {p.label}
                </span>
                <span className="text-[10px] text-cyan-700 dark:text-cyan-300/80 block line-clamp-1">{p.sub}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">{p.desc}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2 block truncate">
                GTIN: {p.barcode}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
