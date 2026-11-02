"use client";

import React, { useState } from "react";
import { X, Flag, Send, CheckCircle2, AlertTriangle, MapPin, Mail } from "lucide-react";
import { submitReport } from "@/lib/api";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBarcode?: string;
  defaultProductName?: string;
}

export function ReportModal({
  isOpen,
  onClose,
  defaultBarcode = "",
  defaultProductName = "",
}: ReportModalProps) {
  const [productName, setProductName] = useState(defaultProductName);
  const [barcode, setBarcode] = useState(defaultBarcode);
  const [storeLocation, setStoreLocation] = useState("");
  const [description, setDescription] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setSubmitting(true);
      await submitReport({
        product_name: productName,
        barcode: barcode,
        store_location: storeLocation,
        description: description,
        reporter_email: reporterEmail || undefined,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2500);
    } catch (err) {
      alert("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl glass-panel border border-rose-300 dark:border-rose-500/30 overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-rose-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Report Suspicious Product</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Incident Report Dispatched</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Thank you for protecting public consumer safety. This case has been escalated to authorized field inspectors and brand protection teams.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Pfizer Lipitor 20mg"
                className="w-full px-3 py-2 rounded-lg glass-input text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Barcode / GTIN</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 8901234567891"
                className="w-full px-3 py-2 rounded-lg glass-input text-sm font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Store / Purchase Location
              </label>
              <input
                type="text"
                value={storeLocation}
                onChange={(e) => setStoreLocation(e.target.value)}
                placeholder="e.g. Central Market Chemist, Shelf #4"
                className="w-full px-3 py-2 rounded-lg glass-input text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Your Email (Optional, for case updates)
              </label>
              <input
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="consumer@example.com"
                className="w-full px-3 py-2 rounded-lg glass-input text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Discrepancy Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe why this product looks suspicious (e.g. altered expiry dates, blurry printing, missing hologram)..."
                className="w-full px-3 py-2 rounded-lg glass-input text-sm resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? "Submitting..." : "Send to Compliance Team"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
