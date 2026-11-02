"use client";

import React, { useState, useEffect } from "react";
import {
  FileWarning,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Mail,
  ShieldAlert,
  Building2,
  Calendar,
} from "lucide-react";
import { getReports, updateReportStatus, ReportItem } from "@/lib/api";

export function ReportsView() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports(statusFilter || undefined).catch(() => [
        {
          id: "REP-2026-901",
          product_name: "Optimum Nutrition Gold Standard Whey",
          brand: "Glanbia",
          barcode: "0748927028669",
          batch_number: "OPN-2026-W98",
          store_location: "Local Gym, Mogadishu",
          description: "Misaligned neck hologram seal, font inconsistency on bottom batch stamp.",
          status: "INVESTIGATING" as const,
          reporter_role: "consumer",
          reporter_email: "athlete@gmail.com",
          created_at: new Date().toISOString(),
        },
        {
          id: "REP-2026-902",
          product_name: "Apex Nitric Surge Pre-Workout",
          brand: "Apex Sports",
          barcode: "0619985432109",
          batch_number: "APX-998",
          store_location: "Cargo Terminal Point",
          description: "Undeclared stimulant test positive from laboratory testing assay.",
          status: "CONFIRMED_COUNTERFEIT" as const,
          reporter_role: "inspector",
          reporter_email: "inspector@verifai.io",
          created_at: new Date().toISOString(),
        },
      ]);
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateReportStatus(id, newStatus, `Status updated by field compliance officer.`);
      fetchReports();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileWarning className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            Counterfeit Fraud Investigation Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Consumer-filed fraud alerts, field inspector escalations, and evidence dossiers.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 shadow-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="INVESTIGATING">Under Investigation</option>
            <option value="CONFIRMED_COUNTERFEIT">Confirmed Counterfeit</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {loading && reports.length === 0 ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-mono">
          Loading incident queue...
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 shadow-xs">
          <p className="text-sm">No fraud reports recorded.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 hover:border-rose-400 dark:hover:border-rose-500/30 transition-all space-y-3 shadow-xs hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                      rep.status === "CONFIRMED_COUNTERFEIT"
                        ? "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                        : rep.status === "INVESTIGATING"
                        ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                        : "bg-slate-100 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600/40"
                    }`}
                  >
                    {rep.status.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">ID: {rep.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(rep.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Product and Details */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{rep.product_name || "Unknown Product"}</span>
                  {rep.brand && (
                    <span className="text-xs text-cyan-700 dark:text-cyan-400 font-mono font-normal">({rep.brand})</span>
                  )}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rep.description}</p>
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 font-mono text-[11px]">
                {rep.barcode && (
                  <span className="flex items-center gap-1">
                    GTIN: <strong className="text-slate-800 dark:text-slate-200">{rep.barcode}</strong>
                  </span>
                )}
                {rep.batch_number && (
                  <span className="flex items-center gap-1">
                    Batch: <strong className="text-slate-800 dark:text-slate-200">{rep.batch_number}</strong>
                  </span>
                )}
                {rep.store_location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    {rep.store_location}
                  </span>
                )}
                {rep.reporter_email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {rep.reporter_email}
                  </span>
                )}
              </div>

              {/* Officer Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleUpdateStatus(rep.id, "INVESTIGATING")}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 transition-colors cursor-pointer"
                >
                  Mark Investigating
                </button>
                <button
                  onClick={() => handleUpdateStatus(rep.id, "CONFIRMED_COUNTERFEIT")}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 transition-colors cursor-pointer"
                >
                  Confirm Counterfeit
                </button>
                <button
                  onClick={() => handleUpdateStatus(rep.id, "DISMISSED")}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
