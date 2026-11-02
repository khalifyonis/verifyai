"use client";

import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  FileText,
  Upload,
  AlertTriangle,
  Download,
  MoreHorizontal,
  Flag,
  Headphones,
  CheckCircle2,
  XCircle,
  X,
  ShieldCheck,
  Calendar,
  Layers,
  Filter,
} from "lucide-react";
import { VerificationResult } from "@/lib/api";

interface SearchHistoryViewProps {
  onInspectEvidence: (row: any) => void;
  onOpenReportModal: (product?: any) => void;
}

export function SearchHistoryView({
  onInspectEvidence,
  onOpenReportModal,
}: SearchHistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("Creatine");
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>("Creatine");
  const [timeFilter, setTimeFilter] = useState("Past 30 Days");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Table Data matching Gemini_Generated_Image_cr3w87cr3w87cr3w (2).jpg
  const allHistoryRows = [
    {
      id: "01",
      name: "Creatine Monohydrate",
      brand: "Nutriforge",
      date: "Oct 2026, 03:52 PM",
      status: "VERIFIED",
      barcode: "0748927024104",
      batch: "CF-24091",
      exp: "2028-04",
      category: "Supplements",
      img: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=120&auto=format&fit=crop&q=80",
    },
    {
      id: "02",
      name: "Whey Protein",
      brand: "Prime Labs",
      date: "Oct 2026, 11:48 AM",
      status: "SUSPICIOUS",
      barcode: "0748927024104",
      batch: "FAKE-LOT-999",
      exp: "2029-12-31",
      category: "Supplements",
      img: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=120&auto=format&fit=crop&q=80",
    },
    {
      id: "03",
      name: "Optimum Vitamin D3",
      brand: "Vitamin D3",
      date: "Oct 2026",
      status: "VERIFIED",
      barcode: "0748927028669",
      batch: "OPN-2026-W98",
      exp: "2027-06-09",
      category: "Pharma",
      img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80",
    },
    {
      id: "04",
      name: "Pre-Workout Powder",
      brand: "Pre-Workout",
      date: "Oct 2026",
      status: "NOT VERIFIED",
      barcode: "0890123999992",
      batch: "LOT-GEN-99",
      exp: "2026-08-30",
      category: "Supplements",
      img: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=120&auto=format&fit=crop&q=80",
    },
    {
      id: "05",
      name: "Fish Oil Omega 3",
      brand: "Nutriforge",
      date: "Sep 2026",
      status: "VERIFIED",
      barcode: "0748927021111",
      batch: "FO-8820",
      exp: "2028-01",
      category: "Supplements",
      img: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=120&auto=format&fit=crop&q=80",
    },
    {
      id: "06",
      name: "BCAA Powders",
      brand: "Prime Labs",
      date: "Sep 2026",
      status: "SUSPICIOUS",
      barcode: "0748927022222",
      batch: "BCAA-SUS-01",
      exp: "2027-11",
      category: "Supplements",
      img: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=120&auto=format&fit=crop&q=80",
    },
  ];

  // Filtering
  const filteredRows = allHistoryRows.filter((row) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      row.name.toLowerCase().includes(q) ||
      row.brand.toLowerCase().includes(q) ||
      row.batch.toLowerCase().includes(q) ||
      row.barcode.includes(q);

    const matchesStatus =
      statusFilter === "All Statuses" || row.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Download PDF Handler
  const handleDownloadPDF = () => {
    const reportContent = `
VERIFAI AUDIT & VERIFICATION DOSSIER
===================================
Generated: ${new Date().toLocaleString()}
User: Ahmed (ahmed@verifai.com)
Total Records: ${filteredRows.length}

${filteredRows
  .map(
    (r) =>
      `[${r.id}] ${r.name} - Brand: ${r.brand} | Status: ${r.status} | Batch: ${r.batch} | Exp: ${r.exp} | Date: ${r.date}`
  )
  .join("\n")}
===================================
GS1 & Cryptographic Ledger Validated
`;
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VERIFAI_History_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 2-Column Layout matching Gemini_Generated_Image_cr3w87cr3w87cr3w (2).jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Search History Overview & Table */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 p-6 space-y-5 shadow-xs">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Search History Overview
            </h2>
          </div>

          {/* Top Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search previous checks..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option>Past 30 Days</option>
              <option>Today</option>
              <option>Past 7 Days</option>
              <option>Past 90 Days</option>
              <option>All Time</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option>All Statuses</option>
              <option>VERIFIED</option>
              <option>SUSPICIOUS</option>
              <option>NOT VERIFIED</option>
            </select>

            {/* Filter Toggle Button */}
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All Statuses");
                setActiveFilterTag(null);
              }}
              className="p-2 rounded-xl border border-cyan-400/40 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter Tag Pill (e.g. Q Creatine) */}
          {activeFilterTag && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-400/40 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                <Search className="w-3 h-3 text-cyan-500" />
                {activeFilterTag}
                <button
                  onClick={() => {
                    setActiveFilterTag(null);
                    setSearchQuery("");
                  }}
                  className="hover:text-rose-500 ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {/* History Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              History Table
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                    <th className="pb-3 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">Product Name</th>
                    <th className="pb-3 font-semibold">Brand</th>
                    <th className="pb-3 font-semibold">Scan Date</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors relative"
                    >
                      <td className="py-3.5 font-mono text-slate-500 dark:text-slate-400">
                        {row.id}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={row.img}
                            alt={row.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {row.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Batch: {row.batch}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {row.brand}
                      </td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {row.date}
                      </td>
                      <td className="py-3.5">
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
                      <td className="py-3.5 relative">
                        <div className="flex items-center gap-2">
                          {row.status === "VERIFIED" ? (
                            <button
                              onClick={() => onInspectEvidence(row)}
                              className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Evidence
                            </button>
                          ) : row.status === "SUSPICIOUS" ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => onOpenReportModal(row)}
                                className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Flag className="w-3 h-3" />
                                Report fake
                              </button>
                              <button
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === row.id ? null : row.id
                                  )
                                }
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 cursor-pointer"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu matching Gemini_Generated_Image_wea2k9wea2k9wea2 (2).jpg */}
                              {openDropdownId === row.id && (
                                <div className="absolute right-0 top-12 w-48 rounded-xl bg-[#0E1729] border border-white/10 shadow-2xl p-1.5 z-30 animate-in fade-in text-xs space-y-0.5">
                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      onInspectEvidence(row);
                                    }}
                                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white flex items-center gap-2"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                    Review Evidence
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      onOpenReportModal(row);
                                    }}
                                    className="w-full text-left px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold flex items-center gap-2"
                                  >
                                    <Flag className="w-3.5 h-3.5" />
                                    Report Fake
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      alert("Opening support ticket for this batch...");
                                    }}
                                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white flex items-center gap-2"
                                  >
                                    <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                                    Contact Support
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => onOpenReportModal(row)}
                              className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold transition-colors cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Upload Proof
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Detailed Activity matching Gemini_Generated_Image_cr3w87cr3w87cr3w (2).jpg */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-3xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Detailed Activity
              </h3>
              <span className="text-[10px] text-cyan-500 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded-full font-mono">
                Real-Time
              </span>
            </div>

            {/* Scan Summary Stats */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 block">
                Scan Summary Stats
              </span>
              <div className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
                48
              </div>

              {/* Progress bars */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">32</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[67%]" />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Suspicious
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">12</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[25%]" />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Flagged
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">4</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[8%]" />
                </div>
              </div>
            </div>

            {/* Gauge / Category Distribution */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
              <span className="text-xs font-semibold text-slate-400 block">
                Category Distribution
              </span>

              {/* Semi-circular gauge mock matching design */}
              <div className="relative flex flex-col items-center justify-center pt-2">
                <svg className="w-44 h-24" viewBox="0 0 100 55">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 50 A 40 40 0 0 1 65 15"
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 67 16 A 40 40 0 0 1 85 35"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 86 37 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Supplements (70%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Pharma (22%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    Others (8%)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleDownloadPDF}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download History Report (PDF)
              </button>

              <button
                onClick={() => onOpenReportModal()}
                className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-rose-500/40 text-slate-700 dark:text-slate-300 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                Report Multiple Items
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
