"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  AlertOctagon,
  Search,
  CheckCircle2,
  XCircle,
  Share2,
  Download,
  Flag,
  MapPin,
  Calendar,
  Layers,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

interface SafetyAlertsViewProps {
  onReportSpotted?: (alertTitle?: string) => void;
}

export function SafetyAlertsView({ onReportSpotted }: SafetyAlertsViewProps) {
  const [selectedAlertId, setSelectedAlertId] = useState("alert-1");
  const [categoryFilter, setCategoryFilter] = useState("All Alerts");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);

  // Alerts List matching Gemini_Generated_Image_cr3w87cr3w87cr3w (1).jpg
  const alertsList = [
    {
      id: "alert-1",
      category: "Supplements",
      level: "HIGH RISK - FAKE DETECTED",
      levelColor: "rose",
      title: "Mogadishu Alert: Fake Nutriforge Creatine Batches",
      date: "Oct 28, 2026",
      batchCode: "Batch CF-24091",
      warningText:
        "Warning: Counterfeit Nutriforge Creatine Batches detected in Mogadishu fitness centers. Containers feature low-grade ink stamps and altered QR codes.",
      affectedAreas: "Mogadishu, Hamar Weyne Gyms, Bakara Commercial Market",
      authenticImg:
        "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&auto=format&fit=crop&q=80",
      counterfeitImg:
        "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&auto=format&fit=crop&q=80",
      authenticFeatures: [
        "Crisp laser dot-matrix batch etching on container underside",
        "Official golden holographic neck seal with VERIFAI micro-pattern",
        "GS1 verified GTIN barcode: 0748927024104",
      ],
      counterfeitFeatures: [
        "Blurry label printing with smudged registration text",
        "Missing hologram seal; replaced with generic transparent cellophane",
        "Inconsistent tub bottom plastic seam moulding and chalky odor",
      ],
    },
    {
      id: "alert-2",
      category: "Supplements",
      level: "SUSPICIOUS - Prime Labs batch warning",
      levelColor: "amber",
      title: "Prime Labs Whey Protein Batch Warning",
      date: "Oct 28, 2026",
      batchCode: "Batch PL-WHEY-99",
      warningText:
        "Warning: Prime Labs imported products batch warning. Inconsistent protein nitrogen assays reported by regional consumer testing laboratories.",
      affectedAreas: "Hargeisa, Borama, and Berbera Gym Nutrition Stores",
      authenticImg:
        "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80",
      counterfeitImg:
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80",
      authenticFeatures: [
        "Embossed brand logo on tub shoulder",
        "UV-luminescent security thread behind nutritional fact table",
        "Lot code PL-2026-N44 registered in manufacturer cloud ledger",
      ],
      counterfeitFeatures: [
        "Flat plastic shoulder without embossed stamp",
        "Missing UV verification thread",
        "Unregistered batch number causing scanner mismatch",
      ],
    },
    {
      id: "alert-3",
      category: "Pharmaceuticals",
      level: "ADVISORY - Expiry date tampering",
      levelColor: "yellow",
      title: "Expiry Date Tampering on Imported Multivitamins",
      date: "Oct 28, 2026",
      batchCode: "Batch VIT-2024-X",
      warningText:
        "Warning: Expiry date tampering on imported vitamins. Counterfeiters applied secondary label stickers masking 2024 expired production dates.",
      affectedAreas: "Puntland (Boosaaso, Garowe Pharmacies)",
      authenticImg:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
      counterfeitImg:
        "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=400&auto=format&fit=crop&q=80",
      authenticFeatures: [
        "Single-layer thermal label directly bonded to bottle resin",
        "Indelible jet-print date: EXP 2027-08",
        "Intact pharmaceutical induction seal under cap",
      ],
      counterfeitFeatures: [
        "Double-layer sticker with peeled paper residue underneath",
        "Overprinted expiry date using rubbing alcohol soluble ink",
        "Broken foil seal with manual re-gluing signs",
      ],
    },
  ];

  const selectedAlert =
    alertsList.find((a) => a.id === selectedAlertId) || alertsList[0];

  const filteredAlerts = alertsList.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.warningText.toLowerCase().includes(q) ||
      a.batchCode.toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === "All Alerts" || a.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Filter Bar matching Gemini_Generated_Image_cr3w87cr3w87cr3w (1).jpg */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts, brands..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 text-xs">
          {["All Alerts", "Supplements", "Pharmaceuticals", "Food"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-cyan-500 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-cyan-500"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main 2-Column Layout matching Gemini_Generated_Image_cr3w87cr3w87cr3w (1).jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (01): Alerts List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredAlerts.map((item) => {
            const isSelected = item.id === selectedAlert.id;
            const isHighRisk = item.levelColor === "rose";

            return (
              <div
                key={item.id}
                onClick={() => setSelectedAlertId(item.id)}
                className={`p-4 rounded-3xl transition-all cursor-pointer border relative shadow-xs ${
                  isSelected
                    ? isHighRisk
                      ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                      : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    : "bg-white dark:bg-[#0D1527]/90 border-slate-200 dark:border-white/10 hover:border-cyan-500/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertOctagon
                    className={`w-3.5 h-3.5 ${
                      isHighRisk ? "text-rose-500" : "text-amber-500"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-mono font-bold tracking-wider ${
                      isHighRisk
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {item.level}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                  {item.title}
                </h3>

                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  Reported: {item.date}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {item.warningText}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column (02): Alert Details & Side-by-Side Comparison */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Alert Details: {selectedAlert.title.replace("Mogadishu Alert: ", "")}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Cross-referenced with GS1 Ledger & Regional Health Inspectorate
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
              {selectedAlert.batchCode}
            </span>
          </div>

          {/* Side-by-Side Comparison Cards matching design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Authentic Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Authentic
                </span>
                <span className="text-[10px] font-mono text-emerald-500">Verified</span>
              </div>

              <div className="relative h-44 rounded-xl overflow-hidden bg-black/20">
                <img
                  src={selectedAlert.authenticImg}
                  alt="Authentic Packaging"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1.5">
                  Key Identifiers:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  {selectedAlert.authenticFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Counterfeit Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Counterfeit
                </span>
                <span className="text-[10px] font-mono text-rose-500">Fake</span>
              </div>

              <div className="relative h-44 rounded-xl overflow-hidden bg-black/20">
                <img
                  src={selectedAlert.counterfeitImg}
                  alt="Counterfeit Packaging"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1.5">
                  Key Identifiers:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  {selectedAlert.counterfeitFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Affected Areas */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 space-y-1 text-xs">
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-500" />
              Affected Regional Areas:
            </span>
            <p className="text-slate-600 dark:text-slate-300 font-medium pl-5 text-[11px]">
              {selectedAlert.affectedAreas}
            </p>
          </div>

          {/* Action Buttons matching design */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <button
              onClick={() =>
                alert("Opening full-resolution side-by-side inspection viewer...")
              }
              className="py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-cyan-500 hover:bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all cursor-pointer text-center"
            >
              View Comparison Photos
            </button>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert("Safety bulletin link copied to clipboard!");
              }}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-cyan-400 text-slate-700 dark:text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Alert
            </button>

            <button
              onClick={() =>
                alert("Downloading certified PDF safety advisory bulletin...")
              }
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-cyan-400 text-slate-700 dark:text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Alerts
            </button>

            <button
              onClick={() => {
                if (onReportSpotted) onReportSpotted(selectedAlert.title);
                else alert(`Reporting sighting of ${selectedAlert.title}...`);
              }}
              className="py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-rose-500 hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.35)] transition-all cursor-pointer text-center"
            >
              Report If Spotted Nearby
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
