"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Activity,
  MapPin,
  Clock,
  Globe,
  CheckCircle2,
  ExternalLink,
  Filter,
  Info,
} from "lucide-react";
import { getAnalyticsSummary, getScanHistory, getTrustedSources, AnalyticsSummary, TrustedSourceItem } from "@/lib/api";

export function DashboardView() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [sources, setSources] = useState<TrustedSourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVerdict, setFilterVerdict] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumData, histData, sourcesData] = await Promise.all([
        getAnalyticsSummary(),
        getScanHistory(filterVerdict || undefined, 15),
        getTrustedSources(),
      ]);
      setAnalytics(sumData);
      setHistory(histData);
      setSources(sourcesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterVerdict]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            Supplement Inspection & Source Registry Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time market surveillance, evidence ledger telemetry, and authoritative source synchronizations.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors self-start"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          Refresh Live Stream
        </button>
      </div>

      {/* KPI Counters */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Scans</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1 block">
                {analytics.total_scans}
              </span>
              <span className="text-[11px] text-cyan-400 mt-0.5 block">{analytics.active_sources_count} Sources Active</span>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl glass-panel border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Verified Authentic</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-1 block">
                {analytics.verified_count}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Batch & GTIN matched</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl glass-panel border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Suspicious Inconsistencies</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 mt-1 block">
                {analytics.suspicious_count}
              </span>
              <span className="text-[11px] text-amber-400/80 mt-0.5 block">Counterfeit batch flags</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl glass-panel border border-rose-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Official Recalls / Alerts</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-400 mt-1 block">
                {analytics.warning_count}
              </span>
              <span className="text-[11px] text-rose-400/80 mt-0.5 block">FDA safety interventions</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Trusted Sources Registry Table */}
      <div className="rounded-2xl glass-panel border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Authoritative Trusted Sources Registry</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {sources.length} Independent Databases Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white line-clamp-1">{src.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    {src.status}
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400 block font-mono mt-0.5">{src.category}</span>
                <p className="text-[11px] text-slate-300 mt-1.5 leading-snug">{src.trust_rationale}</p>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-1">
                <p className="text-[10px] text-slate-400">
                  <span className="text-amber-400/90 font-medium">Limitation:</span> {src.known_limitations}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Method: {src.lookup_method}</span>
                  <a
                    href={src.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 underline"
                  >
                    Portal
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Verification Log Stream */}
      <div className="rounded-2xl glass-panel border border-white/10 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="font-bold text-white text-base">Live Supplement Telemetry Stream</h3>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterVerdict}
              onChange={(e) => setFilterVerdict(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300"
            >
              <option value="">All Decisions</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="SUSPICIOUS">SUSPICIOUS</option>
              <option value="OFFICIAL_WARNING">OFFICIAL WARNING</option>
              <option value="NOT_VERIFIED">NOT VERIFIED</option>
            </select>
          </div>
        </div>

        {/* Scan Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono uppercase tracking-wider">
                <th className="pb-3 font-semibold">Barcode / GTIN</th>
                <th className="pb-3 font-semibold">Batch Code</th>
                <th className="pb-3 font-semibold">Decision Policy</th>
                <th className="pb-3 font-semibold">Evidence Score</th>
                <th className="pb-3 font-semibold">Location</th>
                <th className="pb-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((scan) => (
                <tr key={scan.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 font-mono font-medium text-cyan-300">
                    {scan.barcode || "Photo Scan"}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {scan.batch_number || "—"}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                        scan.verdict === "VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : scan.verdict === "SUSPICIOUS"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : scan.verdict === "OFFICIAL_WARNING"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-slate-700/40 text-slate-300 border border-slate-600/40"
                      }`}
                    >
                      {scan.verdict.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-200">
                    {scan.confidence_score}%
                  </td>
                  <td className="py-3 text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate max-w-[150px]">{scan.location_name || "Gym Counter"}</span>
                  </td>
                  <td className="py-3 text-slate-500 font-mono">
                    {new Date(scan.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
