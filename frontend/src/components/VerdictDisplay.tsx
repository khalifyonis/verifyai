"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
  Flag,
  RotateCcw,
  Building2,
  Calendar,
  Layers,
  MapPin,
  Globe,
  Award,
  Clock,
  Sparkles,
} from "lucide-react";
import { VerificationResult } from "@/lib/api";

interface VerdictDisplayProps {
  result: VerificationResult;
  onReset: () => void;
  onReportFraud: (result: VerificationResult) => void;
}

export function VerdictDisplay({ result, onReset, onReportFraud }: VerdictDisplayProps) {
  useEffect(() => {
    if (result.verdict === "VERIFIED" && result.confidence_score >= 80) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10B981", "#06B6D4", "#6366F1"],
      });
    }
  }, [result.verdict, result.confidence_score]);

  // Verdict design configuration based on Section 8 policy
  const getVerdictConfig = () => {
    switch (result.verdict) {
      case "VERIFIED":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30",
          glow: "shadow-[0_0_40px_rgba(16,185,129,0.15)]",
          badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          icon: ShieldCheck,
          iconColor: "text-emerald-400",
          accentColor: "#10B981",
          statusTag: "VERIFIED",
        };
      case "OFFICIAL_WARNING":
        return {
          bg: "bg-rose-500/10 border-rose-500/30",
          glow: "shadow-[0_0_40px_rgba(244,63,94,0.2)]",
          badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",
          icon: AlertOctagon,
          iconColor: "text-rose-400",
          accentColor: "#F43F5E",
          statusTag: "OFFICIAL WARNING",
        };
      case "SUSPICIOUS":
        return {
          bg: "bg-amber-500/10 border-amber-500/30",
          glow: "shadow-[0_0_40px_rgba(245,158,11,0.15)]",
          badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          icon: AlertTriangle,
          iconColor: "text-amber-400",
          accentColor: "#F59E0B",
          statusTag: "SUSPICIOUS",
        };
      case "NOT_VERIFIED":
      default:
        return {
          bg: "bg-slate-800/40 border-slate-700/50",
          glow: "shadow-[0_0_30px_rgba(100,116,139,0.1)]",
          badge: "bg-slate-700/40 text-slate-300 border-slate-600/40",
          icon: HelpCircle,
          iconColor: "text-cyan-400",
          accentColor: "#06B6D4",
          statusTag: "NOT VERIFIED",
        };
    }
  };

  const config = getVerdictConfig();
  const VerdictIcon = config.icon;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Primary Verdict Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border ${config.bg} ${config.glow} glass-panel`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div
              className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border shrink-0"
              style={{ borderColor: `${config.accentColor}50` }}
            >
              <VerdictIcon className={`w-9 h-9 ${config.iconColor}`} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${config.badge}`}
                >
                  {config.statusTag}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Verification #{result.session_id.slice(0, 8)}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {result.verdict_title}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 max-w-xl leading-relaxed">
                {result.explanation}
              </p>
            </div>
          </div>

          {/* Radial Confidence Gauge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 shrink-0 min-w-[140px] shadow-xs">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${result.confidence_score}, 100`}
                  stroke={config.accentColor}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {result.confidence_score}%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Score</span>
              </div>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Evidence Index</span>
          </div>
        </div>

        {/* Transparent Limitations Callout */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-cyan-800 dark:text-cyan-300 block mb-0.5">Verification Boundaries & Limitations</span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{result.limitations}</p>
          </div>
        </div>

        {/* Actionable Next Steps Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Next Step:
            </span>
            <span className="text-xs text-slate-800 dark:text-slate-200">{result.recommendation}</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {result.verdict !== "VERIFIED" && (
              <button
                onClick={() => onReportFraud(result)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 border border-rose-300 dark:border-rose-500/30 rounded-xl transition-all cursor-pointer"
              >
                <Flag className="w-4 h-4" />
                Report Discrepancy
              </button>
            )}
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Scan Another
            </button>
          </div>
        </div>
      </div>

      {/* 2. Matched Supplement Details (if in registry) */}
      {result.product && (
        <div className="rounded-2xl p-6 glass-panel border border-slate-200 dark:border-white/10 shadow-xs">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Verified Supplement Identity & Formulation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image / Thumbnail */}
            <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 aspect-square flex items-center justify-center p-3">
              {result.product.image_url ? (
                <img
                  src={result.product.image_url}
                  alt={result.product.name}
                  className="object-cover w-full h-full rounded-lg"
                />
              ) : (
                <div className="text-center p-4 text-slate-500 text-xs">Official Photo Pending</div>
              )}
              {result.product.is_recalled && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded bg-rose-500/90 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-md">
                  Recalled
                </div>
              )}
            </div>

            {/* Spec Attributes */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold font-mono">{result.product.brand}</span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{result.product.name}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                  Variant: <span className="font-semibold text-slate-900 dark:text-white">{result.product.variant || "Standard"}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{result.product.description}</p>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block">Category</span>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{result.product.category}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block">GTIN / Barcode</span>
                  <span className="text-xs font-mono font-medium text-cyan-700 dark:text-cyan-300">{result.product.gtin_barcode}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block">Serving Size</span>
                  <span className="text-xs font-medium text-slate-200">{result.product.serving_size || "1 Serving"}</span>
                </div>
              </div>

              {/* Certifications Badges */}
              {result.product.certifications && result.product.certifications.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Tested Certifications:
                  </span>
                  {result.product.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              {/* Batch Ledger Result */}
              {result.batch_matched ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-semibold text-emerald-300">
                        Authorized Batch #{result.batch_matched.batch_number} Registered
                      </span>
                      <p className="text-[11px] text-slate-400">
                        MFG: {result.batch_matched.manufacturing_date || "N/A"} | EXP: {result.batch_matched.expiry_date || "N/A"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                    Batch Verified
                  </span>
                </div>
              ) : result.extracted_data.batch_number ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-300">
                    Scanned batch number <span className="font-mono font-bold">"{result.extracted_data.batch_number}"</span> was not found in manufacturer's authorized production records!
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* 3. Evidence-Based Verification Ledger with Source Citations */}
      <div className="rounded-2xl p-6 glass-panel border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Documented Evidence Records ({result.evidence_records.length})
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {result.evidence_records.filter((e) => e.classification === "SUPPORTING").length} Supporting Claims
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5 space-y-1">
          {result.evidence_records.map((item, idx) => (
            <div key={idx} className="pt-3.5 pb-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {item.classification === "SUPPORTING" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : item.classification === "OFFICIAL_ALERT" ? (
                  <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                ) : item.classification === "CONTRADICTING" ? (
                  <XCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.source_name}</span>
                    <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 px-2 py-0.5 rounded">
                      {item.source_category}
                    </span>
                    {item.is_verified_fact ? (
                      <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Verified Fact
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        AI Observation
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200">{item.claim_supported}</p>

                  {item.extracted_passage && (
                    <blockquote className="text-[11px] font-mono text-slate-600 dark:text-slate-400 border-l-2 border-slate-300 dark:border-slate-700 pl-2 mt-1">
                      "{item.extracted_passage}"
                    </blockquote>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(item.retrieval_timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 underline"
                    >
                      <Globe className="w-3 h-3" />
                      Inspect Source Reference
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-start shrink-0">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                    item.classification === "SUPPORTING"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20"
                      : item.classification === "OFFICIAL_ALERT"
                      ? "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30"
                      : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20"
                  }`}
                >
                  {item.classification.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Sources Consulted Summary */}
      {result.sources_consulted && result.sources_consulted.length > 0 && (
        <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 shadow-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Independent Sources Consulted ({result.sources_consulted.length}):
          </span>
          <div className="flex flex-wrap gap-2">
            {result.sources_consulted.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-cyan-400 text-slate-700 dark:text-slate-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
              >
                {s.name}
                <ExternalLink className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
