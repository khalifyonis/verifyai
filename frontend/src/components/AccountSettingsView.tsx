"use client";

import React, { useState } from "react";
import {
  Settings,
  Bell,
  Mail,
  ShieldCheck,
  Lock,
  User,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
} from "lucide-react";
import { User as UserType } from "@/lib/api";

interface AccountSettingsViewProps {
  currentUser?: UserType | null;
  onUpdateUser?: (u: UserType) => void;
}

export function AccountSettingsView({
  currentUser,
  onUpdateUser,
}: AccountSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "notifications" | "connected"
  >("notifications");

  // Notification Preferences Toggles matching Gemini_Generated_Image_ma28o1ma28o1ma28 (5).jpg
  const [localSafetyAlerts, setLocalSafetyAlerts] = useState(true);
  const [emailReports, setEmailReports] = useState(true);
  const [verificationActivity, setVerificationActivity] = useState(true);
  const [marketingAlerts, setMarketingAlerts] = useState(false);
  const [verificationAccounts, setVerificationAccounts] = useState(true);

  // Profile Form state
  const [fullName, setFullName] = useState(currentUser?.full_name || "Ahmed");
  const [email, setEmail] = useState(
    currentUser?.email || "ahmed@verifai.com"
  );
  const [country, setCountry] = useState(currentUser?.country || "Somalia");
  const [twoFactorActive, setTwoFactorActive] = useState(true);
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSave = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 4000);
  };

  const handleReset = () => {
    setLocalSafetyAlerts(true);
    setEmailReports(true);
    setVerificationActivity(true);
    setMarketingAlerts(false);
    setVerificationAccounts(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 2-Column Layout matching Gemini_Generated_Image_ma28o1ma28o1ma28 (5).jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (01): Account Settings & Notification Preferences (8 Cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs">
          {/* Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-cyan-500" />
              Account Settings
            </h2>
          </div>

          {/* Saved Notification */}
          {savedBanner && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Preferences saved successfully to your cloud profile!</span>
            </div>
          )}

          {/* Tabs matching design */}
          <div className="flex flex-wrap items-center gap-6 border-b border-slate-100 dark:border-white/10 pb-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-3 transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "text-cyan-500 border-b-2 border-cyan-500 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`pb-3 transition-all cursor-pointer ${
                activeTab === "security"
                  ? "text-cyan-500 border-b-2 border-cyan-500 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`pb-3 transition-all cursor-pointer ${
                activeTab === "notifications"
                  ? "text-cyan-500 border-b-2 border-cyan-500 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Notification Preferences
            </button>
            <button
              onClick={() => setActiveTab("connected")}
              className={`pb-3 transition-all cursor-pointer ${
                activeTab === "connected"
                  ? "text-cyan-500 border-b-2 border-cyan-500 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Connected Accounts
            </button>
          </div>

          {/* TAB 1: NOTIFICATION PREFERENCES (Matching design screenshot 02) */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Notification Preferences
              </span>

              <div className="space-y-3">
                {/* 1. Local Safety Alerts */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        Local Safety Alerts
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Get real-time push alerts about newly reported suspicious products in your region
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLocalSafetyAlerts(!localSafetyAlerts)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      localSafetyAlerts ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-1 ${
                        localSafetyAlerts ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Email Reports */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        Email Reports
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Weekly summaries of your verify checks and reported product case status
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEmailReports(!emailReports)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      emailReports ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-1 ${
                        emailReports ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Verification Activity */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        Verification Activity
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Verify reported suspicious products and ledger updates
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setVerificationActivity(!verificationActivity)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      verificationActivity ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-1 ${
                        verificationActivity ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Marketing Alerts */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        Marketing Alerts
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Receive occasional news about brand partnerships and certified health discounts
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMarketingAlerts(!marketingAlerts)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      marketingAlerts ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-1 ${
                        marketingAlerts ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* 5. Verification Accounts */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        Verification Accounts
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Verify reported monthly verification audit activity
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setVerificationAccounts(!verificationAccounts)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      verificationAccounts ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-1 ${
                        verificationAccounts ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Personal Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                    Full Name
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                    Email Address
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                    Country / Region
                  </label>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                    Portal Access Role
                  </label>
                  <input
                    readOnly
                    value="Public Consumer (Verified)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 text-cyan-600 dark:text-cyan-400 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Authentication & Passwords
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Two-Factor Authentication (2FA)
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Protect your consumer account with authenticator TOTP codes.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONNECTED ACCOUNTS */}
          {activeTab === "connected" && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Third-Party Single Sign-On
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-amber-500 text-base">G</span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Google Account
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ahmed@verifai.com
                    </span>
                  </div>
                </div>
                <span className="text-xs text-emerald-500 font-semibold">
                  Connected
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Account Overview matching Gemini_Generated_Image_ma28o1ma28o1ma28 (5).jpg (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-3xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 p-6 space-y-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Account Overview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
              Quick review a quick review of Ahmed's credentials.
            </p>

            {/* Profile Information Box matching design */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Profile Information
              </span>

              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                  alt="Ahmed"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500"
                />
                <div>
                  <span className="text-[11px] text-slate-400 block">Photo</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    {fullName}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate">
                  {email}
                </span>
              </div>
            </div>

            {/* Security Status matching design */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Security Status
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    Two-factor authentication is{" "}
                    <span className="font-bold font-mono">active</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Pro factor authentication accepted</span>
                </div>
              </div>
            </div>

            {/* Action Buttons matching design */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleSave}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Preferences
              </button>

              <button
                onClick={handleReset}
                className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-400 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
