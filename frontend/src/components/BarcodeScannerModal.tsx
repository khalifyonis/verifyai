"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: BarcodeScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "verifai-camera-scanner-view";

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    const startScanner = async () => {
      setErrorMessage(null);
      setIsScanning(true);

      try {
        const scanner = new Html5Qrcode(containerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
          ],
          verbose: false,
        });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: cameraFacing },
          {
            fps: 15,
            qrbox: { width: 280, height: 180 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success
            if (navigator.vibrate) {
              navigator.vibrate(100);
            }
            onScanSuccess(decodedText);
            stopScanner();
            onClose();
          },
          (error) => {
            // Ignore ongoing frame misses
          }
        );
      } catch (err: any) {
        setErrorMessage(
          err?.message || "Unable to access camera. Please verify camera permissions or test with demo presets."
        );
        setIsScanning(false);
      }
    };

    // Small delay to ensure modal DOM is mounted
    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, cameraFacing]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (e) {
        // cleanup ignore
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Live Barcode & QR Scanner</h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Container */}
        <div className="relative bg-black min-h-[340px] flex items-center justify-center overflow-hidden">
          <div id={containerId} className="w-full h-full" />

          {/* Scanner Overlay Box */}
          {isScanning && !errorMessage && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-72 h-48 border-2 border-dashed border-cyan-400/70 rounded-xl flex items-center justify-center">
                {/* Glowing Laser Scanline */}
                <div className="animate-scanline" />

                {/* Corner Marks */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                <span className="text-xs text-cyan-300 font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                  Align Barcode / QR Code
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-6 text-center max-w-sm">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-sm text-slate-200 mb-2 font-medium">Camera Notice</p>
              <p className="text-xs text-slate-400 mb-4">{errorMessage}</p>
              <button
                onClick={() => {
                  stopScanner();
                  onClose();
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold"
              >
                Use Manual Barcode Entry
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-white/10 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            GS1 EAN-13, UPC-A & 2D DataMatrix
          </span>
          <button
            onClick={() => setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"))}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Switch Camera
          </button>
        </div>
      </div>
    </div>
  );
}
