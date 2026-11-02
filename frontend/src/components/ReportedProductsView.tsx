"use client";

import React, { useState } from "react";
import {
  Flag,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  X,
  FileText,
  Search,
  Plus,
  Paperclip,
  ChevronDown,
} from "lucide-react";

interface ReportedProductsViewProps {
  onOpenReportModal?: (product?: any) => void;
}

export function ReportedProductsView({ onOpenReportModal }: ReportedProductsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Form State matching Gemini_Generated_Image_cr3w87cr3w87cr3w.jpg
  const [selectedProduct, setSelectedProduct] = useState({
    name: "Whey Protein",
    brand: "Prime Labs",
    date: "25 Jun 2025",
    status: "Suspicious",
  });
  const [reportReason, setReportReason] = useState("Packaging looks unusual");
  const [detailsText, setDetailsText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedAlert, setSubmittedAlert] = useState(false);

  // Reported Cases Data
  const [reportedCases, setReportedCases] = useState([
    {
      id: "REP-2026-081",
      product: "Whey Protein 2kg",
      brand: "Prime Labs",
      reason: "Batch/Lot seems incorrect",
      location: "Metro Gym Hamar Weyne, Mogadishu",
      dateReported: "Oct 28, 2026",
      status: "UNDER_REVIEW",
      riskLevel: "HIGH",
      batch: "FAKE-LOT-999",
      notes: "Misaligned barcode with illegible manufacturing laser codes.",
      img: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "REP-2026-074",
      product: "Creatine Monohydrate 300g",
      brand: "Nutriforge",
      reason: "Packaging looks unusual",
      location: "Olympic Fitness Center, Hargeisa",
      dateReported: "Oct 25, 2026",
      status: "CONFIRMED_FAKE",
      riskLevel: "CRITICAL",
      batch: "CF-24091-B",
      notes: "Smeared ink stamps on container bottom instead of dot-matrix laser etching.",
      img: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "REP-2026-068",
      product: "Apex Nitric Surge Pre-Workout",
      brand: "Apex Pharma",
      reason: "Product information mismatch",
      location: "Galkayo Supplement Hub",
      dateReported: "Oct 20, 2026",
      status: "QUARANTINED",
      riskLevel: "CRITICAL",
      batch: "APX-998",
      notes: "Tested positive for undeclared DMAA stimulants. Formal health notice issued.",
      img: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "REP-2026-059",
      product: "Optimum Vitamin D3 5000IU",
      brand: "Vitamin D3 Co.",
      reason: "Damaged hologram seal",
      location: "Boosaaso Port Market",
      dateReported: "Oct 15, 2026",
      status: "RESOLVED",
      riskLevel: "LOW",
      batch: "OPN-2026-W98",
      notes: "Distributor verified shipment origin. Outer seal was damaged in ocean transit.",
      img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80",
    },
  ]);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const newCase = {
        id: `REP-2026-0${reportedCases.length + 82}`,
        product: selectedProduct.name,
        brand: selectedProduct.brand,
        reason: reportReason,
        location: "User Direct Submission",
        dateReported: "Just now",
        status: "UNDER_REVIEW",
        riskLevel: "HIGH",
        batch: "SUBMITTED-DIRECT",
        notes: detailsText || "Direct user fraud report submitted with packaging photos.",
        img: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=100&auto=format&fit=crop&q=80",
      };
      setReportedCases([newCase, ...reportedCases]);
      setSubmitting(false);
      setIsModalOpen(false);
      setSubmittedAlert(true);
      setTimeout(() => setSubmittedAlert(false), 5000);
    }, 600);
  };

  const filteredCases = reportedCases.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      c.product.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "Pending" && c.status === "UNDER_REVIEW") ||
      (filterStatus === "Confirmed" && c.status === "CONFIRMED_FAKE") ||
      (filterStatus === "Quarantined" && c.status === "QUARANTINED");
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Flag className="w-6 h-6 text-rose-500" />
            Reported Suspicious Products
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Community fraud surveillance and counterfeit intelligence dossiers submitted for laboratory investigation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.35)] flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Report Suspicious Product
        </button>
      </div>

      {/* Success Notification Alert */}
      {submittedAlert && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Fraud report submitted successfully to compliance teams for review.</span>
          </div>
          <button onClick={() => setSubmittedAlert(false)} className="text-emerald-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by product, brand, or gym location..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {["All", "Pending", "Confirmed", "Quarantined"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filterStatus === status
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40 font-bold"
                  : "bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Reported Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCases.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 hover:border-rose-500/40 transition-all shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={item.img}
                  alt={item.product}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10 shrink-0"
                />
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    {item.product}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {item.brand} • <span className="font-mono text-[11px]">{item.id}</span>
                  </span>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider shrink-0 ${
                  item.status === "CONFIRMED_FAKE"
                    ? "bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30"
                    : item.status === "QUARANTINED"
                    ? "bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-500/30"
                    : item.status === "UNDER_REVIEW"
                    ? "bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30"
                    : "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30"
                }`}
              >
                {item.status.replace("_", " ")}
              </span>
            </div>

            {/* Reason & Location */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-rose-500">Reason Flagged:</span>
                <span className="font-medium">{item.reason}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-500" />
                  {item.location}
                </span>
                <span className="font-mono">{item.dateReported}</span>
              </div>
            </div>

            {/* Notes */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              "{item.notes}"
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
              <span className="text-[11px] font-mono text-slate-400">
                Batch code: <span className="text-slate-700 dark:text-slate-200">{item.batch}</span>
              </span>
              <button
                onClick={() => alert(`Reviewing inspection evidence for ${item.id}...`)}
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 font-semibold cursor-pointer"
              >
                Inspect Case File →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Report Suspicious Product matching Gemini_Generated_Image_cr3w87cr3w87cr3w.jpg EXACTLY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0C1424] border border-rose-300 dark:border-rose-500/30 shadow-2xl overflow-hidden text-slate-900 dark:text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0A101D]">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Report Suspicious Product</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
              {/* Product Info Box matching design */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Product</span>
                  <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{selectedProduct.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Brand</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">{selectedProduct.brand}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Date</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 block mt-0.5">{selectedProduct.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Status</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 block mt-0.5">{selectedProduct.status}</span>
                </div>
              </div>

              {/* Why are you reporting dropdown matching design */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Why are you reporting this product?
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-cyan-500/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option>Packaging looks unusual</option>
                  <option>Batch/Lot seems incorrect</option>
                  <option>Product information mismatch</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Additional details */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Additional details (optional)
                </label>
                <textarea
                  rows={3}
                  value={detailsText}
                  onChange={(e) => setDetailsText(e.target.value)}
                  placeholder="Describe what seems wrong (e.g., blurry font, damaged seal, unexpected odor or color)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 resize-none placeholder-slate-400"
                />
              </div>

              {/* Attach photos matching design */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Attach photos of packaging or issue (optional)
                </label>
                <div
                  onClick={() => alert("Photo attached from device camera/file browser.")}
                  className="w-full border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-cyan-500 rounded-2xl p-4 flex items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white"
                >
                  <Paperclip className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs">Drag & drop or browse</span>
                </div>
              </div>

              {/* Action Buttons matching design */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
