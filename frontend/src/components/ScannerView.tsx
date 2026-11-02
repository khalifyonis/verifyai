"use client";

import React, { useState } from "react";
import {
  ScanLine,
  Camera,
  Upload,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Dumbbell,
  FileText,
  Search,
  Check,
  Image as ImageIcon,
  HelpCircle,
} from "lucide-react";
import { verifyProduct, VerificationResult } from "@/lib/api";
import { BarcodeScannerModal } from "./BarcodeScannerModal";
import { VerdictDisplay } from "./VerdictDisplay";
import { PresetBarcodes } from "./PresetBarcodes";
import { ReportModal } from "./ReportModal";

export function ScannerView() {
  const [barcode, setBarcode] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [productHint, setProductHint] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  // Handle image upload & base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setImagePreview(b64);
      setImageBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleVerify = async (
    customBarcode?: string,
    customBatch?: string,
    customExp?: string,
    customHint?: string
  ) => {
    const codeToVerify = customBarcode !== undefined ? customBarcode : barcode;
    const batchToVerify = customBatch !== undefined ? customBatch : batchNumber;
    const expToVerify = customExp !== undefined ? customExp : expiryDate;
    const hintToVerify = customHint !== undefined ? customHint : productHint;

    if (!codeToVerify.trim() && !imageBase64 && !hintToVerify.trim()) {
      setErrorMsg("Please enter a barcode, scan with camera, or upload a supplement packaging photo.");
      return;
    }

    try {
      setVerifying(true);
      setErrorMsg(null);
      const res = await verifyProduct({
        barcode: codeToVerify.trim() || undefined,
        batch_number: batchToVerify.trim() || undefined,
        expiry_date: expToVerify.trim() || undefined,
        product_name_hint: hintToVerify.trim() || undefined,
        image_base64: imageBase64 || undefined,
        location_name: "Consumer Web Application",
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to complete verification. Please check backend connection.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSelectPreset = (preset: {
    barcode: string;
    batch_number?: string;
    expiry_date?: string;
    product_name_hint?: string;
  }) => {
    setBarcode(preset.barcode);
    setBatchNumber(preset.batch_number || "");
    setExpiryDate(preset.expiry_date || "");
    setProductHint(preset.product_name_hint || "");
    handleVerify(preset.barcode, preset.batch_number || "", preset.expiry_date || "", preset.product_name_hint || "");
  };

  const handleReset = () => {
    setResult(null);
    setBarcode("");
    setBatchNumber("");
    setExpiryDate("");
    setProductHint("");
    setImagePreview(null);
    setImageBase64(null);
    setErrorMsg(null);
  };

  return (
    <div className="w-full">
      {/* If result is ready, display Verdict View */}
      {result ? (
        <VerdictDisplay
          result={result}
          onReset={handleReset}
          onReportFraud={() => setIsReportOpen(true)}
        />
      ) : (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
          {/* Hero Heading */}
          <div className="text-center space-y-3 pt-4 sm:pt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-mono">
              <Dumbbell className="w-3.5 h-3.5" />
              Evidence-Based Gym Supplement & Fitness Product Verification
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Verify Your Supplements with <span className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 dark:from-cyan-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">Trusted Evidence & Records</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Protect your health from counterfeit protein powders, tainted pre-workouts, and unverified creatine. Cross-reference batch records, GS1 registries, and sports certifications.
            </p>
          </div>

          {/* Interactive Scanner Card */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Live Camera Trigger & Image Upload */}
              <div className="space-y-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Step 1: Visual Capture or Camera Scan
                </label>

                {/* Camera Launch Box */}
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full relative group h-44 rounded-2xl border-2 border-dashed border-cyan-400 dark:border-cyan-500/40 hover:border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/20 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer overflow-hidden shadow-2xs"
                >
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      Open Camera Barcode Scanner
                    </span>
                    <span className="text-xs text-cyan-700 dark:text-cyan-300/80">
                      Align container barcode or QR code
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Packaging Photo Dropzone */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="packaging-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="packaging-upload"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                        <ImageIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-900 dark:text-white block">
                          {imagePreview ? "Packaging Photo Attached" : "Upload Tub / Label Photo (Optional)"}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          For AI seal, hologram & batch stamp inspection
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-200 dark:border-cyan-500/20">
                      {imagePreview ? "Replace" : "Browse"}
                    </span>
                  </label>
                </div>

                {imagePreview && (
                  <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 aspect-video max-h-36">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setImageBase64(null);
                      }}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white px-2 py-0.5 rounded text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Supplement Codes & Attributes */}
              <div className="space-y-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Step 2: Enter or Confirm Codes
                </label>

                {/* Barcode Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Barcode / GTIN Number <span className="text-cyan-600 dark:text-cyan-400">*</span>
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">12-14 digits</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="e.g. 0748927028669"
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-mono tracking-wider"
                    />
                    <ScanLine className="w-4 h-4 text-cyan-600 dark:text-cyan-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Product Name / Hint */}
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Product Name / Flavor (Optional)
                  </span>
                  <input
                    type="text"
                    value={productHint}
                    onChange={(e) => setProductHint(e.target.value)}
                    placeholder="e.g. Optimum Nutrition Creatine or Gold Standard Whey"
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                {/* Batch & Expiry Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Batch / LOT Code</span>
                    <input
                      type="text"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      placeholder="e.g. OPN-2026-W98"
                      className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Expiration Date</span>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="e.g. 2027-06-09"
                      className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  type="button"
                  disabled={verifying}
                  onClick={() => handleVerify()}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 hover:opacity-95 shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Evaluating Evidence & Brand Records...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Verify Supplement Authenticity
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Zero hallucinations: deterministic GS1 check + official batch records + transparent evidence citations.
                </p>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Sports Nutrition Presets */}
          <PresetBarcodes onSelectPreset={handleSelectPreset} />
        </div>
      )}

      {/* Camera Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={(decoded) => {
          setBarcode(decoded);
          handleVerify(decoded);
        }}
      />

      {/* Report Fraud Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        defaultBarcode={result?.product?.gtin_barcode || barcode}
        defaultProductName={result?.product?.name || productHint}
      />
    </div>
  );
}
