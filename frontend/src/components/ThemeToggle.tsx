"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-300 border cursor-pointer select-none ${
        isDark
          ? "bg-slate-900/80 hover:bg-slate-800 text-amber-300 border-white/10 hover:border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
          : "bg-white hover:bg-slate-100 text-indigo-600 border-slate-200 hover:border-indigo-300 shadow-sm"
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center transition-transform duration-500 transform">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-90 duration-300" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold font-mono tracking-tight">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
