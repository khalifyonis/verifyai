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
} from "lucide-react";
import { getReports, updateReportStatus, ReportItem } from "@/lib/api";

export function ReportsView() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports(statusFilter || undefined);
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <FileWarning className="w-7 h-7 text-rose-400" />
            Counterfeit Fraud Investigation Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Consumer-filed fraud alerts, field inspector escalations, and evidence dossiers.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300"
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
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading incident queue...</div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-white/10 text-slate-400">
          <p className="text-sm">No fraud reports recorded.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-5 rounded-2xl glass-panel border border-white/10 hover:border-rose-500/30 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                      rep.status === "CONFIRMED_COUNTERFEIT"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : rep.status === "INVESTIGATING"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-slate-700/40 text-slate-300 border border-slate-600/40"
                    }`}
                  >
                    {rep.status.replace(/_/g, " ")}
                  </span>
                  <h4 className="text-base font-bold text-white">
                    {rep.product_name || "Unspecified Suspect Product"}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(rep.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-200">{rep.description}</p>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                {rep.barcode && (
                  <span className="font-mono text-cyan-300">
                    GTIN: {rep.barcode}
                  </span>
                )}
                {rep.store_location && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {rep.store_location}
                  </span>
                )}
                {rep.reporter_email && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    {rep.reporter_email}
                  </span>
                )}
              </div>

              {/* Inspector Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => handleUpdateStatus(rep.id, "INVESTIGATING")}
                  className="px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
                >
                  Mark Investigating
                </button>
                <button
                  onClick={() => handleUpdateStatus(rep.id, "CONFIRMED_COUNTERFEIT")}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-lg transition-colors"
                >
                  Confirm Counterfeit
                </button>
                <button
                  onClick={() => handleUpdateStatus(rep.id, "DISMISSED")}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Dismiss Case
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
