"use client";

import React, { useState } from "react";
import {
  Headphones,
  Search,
  HelpCircle,
  ScanLine,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  FileQuestion,
  Lock,
} from "lucide-react";

export function SupportView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ticket" | "kb">("ticket");
  const [openFaqId, setOpenFaqId] = useState<number | null>(0);

  // Live Chatbot Widget State matching Gemini_Generated_Image_ma28o1ma28o1ma28 (2).jpg
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "user",
      text: "My camera can't scan the barcode, what should I do?",
      time: "2:41 PM",
    },
    {
      sender: "bot",
      text: "Hi! If the camera won't scan the barcode, please:\n1. Ensure there is enough lighting.\n2. Keep the phone parallel to the label and 2-3 inches away.\n3. Make sure the entire barcode is within the scanning brackets.\nYou can also manually type the number below if it still fails.",
      time: "2:41 PM",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Ticket Form State
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDetails, setTicketDetails] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // FAQs
  const faqs = [
    {
      question: "How does VERIFAI verify whether a supplement is authentic?",
      answer:
        "VERIFAI uses a multi-layer verification pipeline: (1) GS1 Registry validation to verify GTIN brand ownership, (2) Cryptographic batch ledger matching against manufacturer production hashes, (3) Optical character recognition (OCR) inspection of expiration dates and lot numbers, and (4) FDA/regional health recall cross-referencing.",
    },
    {
      question: "What should I do if a product returns 'SUSPICIOUS'?",
      answer:
        "Do not consume the supplement or open the seal. Review the documented Evidence Dossier to understand which fields mismatched (e.g. invalid lot code or unverified manufacturer ledger). You can click 'Report Fake' to submit a fraud notice to regional consumer protection inspectors.",
    },
    {
      question: "Where can I find the batch number and expiry date?",
      answer:
        "On most plastic supplement tubs (like Optimum Nutrition or Prime Labs), batch codes and expiry dates are laser dot-matrix printed on the underside bottom of the container or directly beside the barcode label.",
    },
    {
      question: "Can I use VERIFAI offline without internet?",
      answer:
        "Scanning barcodes and packaging photos can be performed on your device; however, validating cryptographic hashes against verified brand databases requires active network connectivity.",
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: userText, time: "Just now" },
    ]);
    setChatInput("");
    setIsBotTyping(true);

    setTimeout(() => {
      let botResponse =
        "Thank you for contacting VERIFAI AI Support! Our team has logged your query. If this relates to batch integrity, ensure you cross-reference the 6-digit laser etching on the underside.";
      const lower = userText.toLowerCase();

      if (lower.includes("fake") || lower.includes("counterfeit")) {
        botResponse =
          "If you suspect a counterfeit product, navigate to the 'Reported Products' tab in the left sidebar to submit a fraud report with photos. Our compliance laboratory will analyze the batch.";
      } else if (lower.includes("batch") || lower.includes("lot")) {
        botResponse =
          "Valid batch numbers follow manufacturer standards (e.g., 'CF-24091' or 'ONC-84920'). Genuine tubs feature slight tactile texture on the printed dots.";
      } else if (lower.includes("creatine") || lower.includes("protein")) {
        botResponse =
          "For Optimum Nutrition Creatine, verify that the golden hologram neck seal is intact and the bottom barcode matches EAN 0748927024104.";
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: botResponse, time: "Just now" },
      ]);
      setIsBotTyping(false);
    }, 800);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => setTicketSubmitted(false), 5000);
    setTicketSubject("");
    setTicketDetails("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 2-Column Layout matching Gemini_Generated_Image_ma28o1ma28o1ma28 (2).jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (01): Support Center & Knowledge Base (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 p-6 space-y-5 shadow-xs">
            {/* Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <Headphones className="w-6 h-6 text-cyan-500" />
                Support Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Find answers, explore verification tutorials, or chat directly with our AI verification assistant.
              </p>
            </div>

            {/* Big Search Bar matching design */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="How can we help you today?"
                className="w-full pl-5 pr-14 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-xs"
              />
              <button
                type="button"
                className="absolute right-2 top-2 p-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Quick Cards matching design */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Getting Started */}
              <div
                onClick={() => setOpenFaqId(0)}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-2 shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block mb-0.5">
                    Getting Started
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    FAQ and basics to profile and standards.
                  </p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full w-[70%]" />
                </div>
              </div>

              {/* Verification Guide */}
              <div
                onClick={() => setOpenFaqId(2)}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-2 shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <ScanLine className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block mb-0.5">
                    Verification Guide
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    Barcode and packaging scan tips or printing guide.
                  </p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[85%]" />
                </div>
              </div>

              {/* Account & Security */}
              <div
                onClick={() => setOpenFaqId(1)}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-2 shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block mb-0.5">
                    Account & Security
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    Password and data settings to protect checks.
                  </p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[45%]" />
                </div>
              </div>
            </div>

            {/* Tabs matching design: Submit a Ticket | Knowledge Base */}
            <div className="flex items-center gap-6 border-b border-slate-100 dark:border-white/10 pt-2 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("ticket")}
                className={`pb-2.5 transition-all cursor-pointer ${
                  activeTab === "ticket"
                    ? "text-cyan-500 border-b-2 border-cyan-500 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Submit a Ticket
              </button>
              <button
                onClick={() => setActiveTab("kb")}
                className={`pb-2.5 transition-all cursor-pointer ${
                  activeTab === "kb"
                    ? "text-cyan-500 border-b-2 border-cyan-500 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Knowledge Base & Guides
              </button>
            </div>

            {/* Tab 1: Submit a Ticket Form */}
            {activeTab === "ticket" ? (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                {ticketSubmitted && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Support ticket #TK-8492 received! Response expected within 2 hours.</span>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Ticket Subject
                  </label>
                  <input
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Inconclusive barcode scan for Optimum Nutrition Creatine"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Describe your issue
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={ticketDetails}
                    onChange={(e) => setTicketDetails(e.target.value)}
                    placeholder="Provide details about the container, store location, or scanner error..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-cyan-500 hover:bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all cursor-pointer"
                >
                  Send Support Ticket
                </button>
              </form>
            ) : (
              /* Tab 2: FAQs & Guides */
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-mono">
                  Browse FAQs
                </span>
                <div className="space-y-2">
                  {faqs.map((faq, idx) => {
                    const isOpen = openFaqId === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqId(isOpen ? null : idx)}
                          className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-3.5 pb-3.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/50 dark:border-white/5 pt-2">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (02): Live VERIFAI AI Support Chat Widget (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 shadow-xs flex flex-col h-[520px] overflow-hidden">
            {/* Chatbot Header matching design */}
            <div className="p-4 bg-gradient-to-r from-cyan-500/20 via-indigo-500/10 to-transparent border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    VERIFAI AI Support
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-400/30">
                AI Assistant
              </span>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-start gap-2 max-w-[85%]">
                    {msg.sender === "bot" && (
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl leading-relaxed whitespace-pre-line text-xs ${
                        msg.sender === "user"
                          ? "bg-cyan-500 text-white rounded-br-xs shadow-xs"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-bl-xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                    {msg.time}
                  </span>
                </div>
              ))}

              {isBotTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                  <Bot className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>VERIFAI AI is formulating response...</span>
                </div>
              )}
            </div>

            {/* Chat Input matching design */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
