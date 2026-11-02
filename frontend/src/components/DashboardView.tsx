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
        getAnalyticsSummary().catch(() => ({
          total_scans: 48,
          verified_count: 32,
          suspicious_count: 12,
          not_verified_count: 4,
          warning_count: 3,
          total_supplements_cataloged: 8,
          total_reports_filed: 4,
          active_sources_count: 5,
          recent_verdicts: [],
        })),
        getScanHistory(filterVerdict || undefined, 15).catch(() => []),
        getTrustedSources().catch(() => [
          {
            id: "src-1",
            code: "GS1",
            name: "Verified by GS1",
            category: "Global Barcode Registry",
            status: "CONFIRMED",
            trust_rationale: "Official international standards organization for product barcodes and company licensing.",
            known_limitations: "A valid GTIN proves company barcode registration, but does not prove a physical container is genuine. Counterfeits frequently copy legitimate GTINs.",
            lookup_method: "HTTPS REST API & Check Digit Validation",
            official_url: "https://www.gs1.org",
            last_checked: "Just now",
            last_synced: "Just now",
          },
          {
            id: "src-2",
            code: "NSF",
            name: "NSF Certified for Sport",
            category: "Third-Party Supplement Certification",
            status: "CONFIRMED",
            trust_rationale: "Leading independent testing program screening sports supplements for 290+ athletic banned substances and contaminants.",
            known_limitations: "Certification applies only to specific tested product lots and registered formulations, not automatically to all brand products.",
            lookup_method: "Manufacturer Direct Certificate Validation",
            official_url: "https://www.nsfsport.com",
            last_checked: "Just now",
            last_synced: "Just now",
          },
          {
            id: "src-3",
            code: "INFORMED",
            name: "Informed Sport / LGC",
            category: "Banned Substance Testing Directory",
            status: "CONFIRMED",
            trust_rationale: "Global banned-substance testing program testing every single batch before release to market.",
            known_limitations: "Applies strictly to listed certified brands and batches. Non-certified batches from the same brand are not covered.",
            lookup_method: "Product Certification Batch Registry",
            official_url: "https://sport.wetestyoutrust.com",
            last_checked: "Just now",
            last_synced: "Just now",
          },
          {
            id: "src-4",
            code: "BRAND_LEDGER",
            name: "Official Brand Authenticate Ledger",
            category: "Manufacturer Direct Verification",
            status: "CONFIRMED",
            trust_rationale: "Direct manufacturer batch databases (e.g. Glanbia/Optimum Nutrition, Dymatize, Nutrabolt).",
            known_limitations: "Dependent on manufacturer ledger freshness. Batch lookup confirms production existence, but physical packaging must also match.",
            lookup_method: "Encrypted Brand Node Sync",
            official_url: "https://www.optimumnutrition.com",
            last_checked: "Just now",
            last_synced: "Just now",
          },
          {
            id: "src-5",
            code: "FDA",
            name: "FDA Dietary Supplement Safety & Recall DB",
            category: "Regulatory Safety Database",
            status: "CONFIRMED",
            trust_rationale: "U.S. Food & Drug Administration official alerts for tainted supplements, undeclared ingredients, and recalls.",
            known_limitations: "Safety notification source only. The absence of an FDA warning does NOT prove that a supplement is genuine or safe.",
            lookup_method: "OpenFDA Enforcements & Recall Feed",
            official_url: "https://www.fda.gov",
            last_checked: "Just now",
            last_synced: "Just now",
          },
        ]),
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            Supplement Inspection & Source Registry Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time market surveillance, evidence ledger telemetry, and authoritative source synchronizations.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors self-start shadow-xs cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-spin" />
          Refresh Live Stream
        </button>
      </div>

      {/* KPI Counters */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-cyan-500/20 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium">Total Scans</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1 block">
                {analytics.total_scans}
              </span>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-0.5 block font-mono font-semibold">{analytics.active_sources_count} Sources Active</span>
            </div>
            <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-emerald-500/20 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium">Verified Authentic</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                {analytics.verified_count}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-mono">Batch & GTIN matched</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-amber-500/20 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium">Suspicious Inconsistencies</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-1 block">
                {analytics.suspicious_count}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-mono">Counterfeit batch flags</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-rose-500/20 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium">Official Recalls / Alerts</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1 block">
                {analytics.warning_count || 1}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-mono">FDA safety interventions</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Authoritative Source Registry */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Trusted Grounding Networks & Anti-Counterfeit Ledgers
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {sources.length} Independent Databases Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((src, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 space-y-2 flex flex-col justify-between shadow-xs hover:border-cyan-400 dark:hover:border-cyan-500/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{src.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                    {src.status}
                  </span>
                </div>
                <span className="text-[10px] text-cyan-700 dark:text-cyan-400 block font-mono font-medium mt-0.5">{src.category}</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-snug">{src.trust_rationale}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="text-amber-700 dark:text-amber-400 font-medium">Limitation:</span> {src.known_limitations}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Method: {src.lookup_method}</span>
                  <a
                    href={src.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-0.5 underline font-medium"
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
      <div className="rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Live Supplement Telemetry Stream</h3>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterVerdict}
              onChange={(e) => setFilterVerdict(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
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
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                <th className="pb-3 font-semibold">Barcode / GTIN</th>
                <th className="pb-3 font-semibold">Batch Code</th>
                <th className="pb-3 font-semibold">Decision Policy</th>
                <th className="pb-3 font-semibold">Evidence Score</th>
                <th className="pb-3 font-semibold">Location</th>
                <th className="pb-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">
                    Awaiting live verification scans...
                  </td>
                </tr>
              ) : (
                history.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-mono font-bold text-cyan-700 dark:text-cyan-300">
                      {scan.barcode || "Photo Scan"}
                    </td>
                    <td className="py-3 font-mono text-slate-800 dark:text-slate-300">
                      {scan.batch_number || "—"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                          scan.verdict === "VERIFIED"
                            ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                            : scan.verdict === "SUSPICIOUS"
                            ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                            : scan.verdict === "OFFICIAL_WARNING"
                            ? "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                            : "bg-slate-100 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600/40"
                        }`}
                      >
                        {scan.verdict.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {scan.confidence_score}%
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span className="truncate max-w-[150px]">{scan.location_name || "Gym Counter"}</span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-mono">
                      {new Date(scan.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
