"use client";

import React, { useState } from "react";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Share2,
  Plus,
  X,
  Send,
  Paperclip,
  Check,
  Search,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";

export function CommunityView() {
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [replyText, setReplyText] = useState(
    "Yes, I noticed this too on a batch I bought last week. The 'V' in VERIFAI on the back label was also slightly off-center and didn't have the holographic sheen. Best to check the batch number CF-24091 on the scanner—mine came up as Not Verified!"
  );
  const [notifyReplies, setNotifyReplies] = useState(true);
  const [attachScanHistory, setAttachScanHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("All");

  // Community Threads Data matching design
  const [threads, setThreads] = useState([
    {
      id: "thread-1",
      title: "Fake Vitamin D3 Batches in Mogadishu?",
      author: "Samir K.",
      username: "@samir_k",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      date: "Oct 2026",
      tag: "Verification Help",
      content:
        "Anyone else noticed the blurry font on the back of the bottle? Bought from a shop near K4 junction. Laser code looks wiped.",
      upvotes: 42,
      repliesCount: 9,
      hasVerifiedScan: true,
      replies: [
        {
          id: "rep-1",
          author: "Ahmed",
          username: "@ahmed_fit",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
          date: "Oct 28, 2026",
          text: "Yes, I noticed this too on a batch I bought last week. The 'V' in VERIFAI on the back label was also slightly off-center and didn't have the holographic sheen. Best to check the batch number CF-24091 on the scanner—mine came up as Not Verified!",
        },
      ],
    },
    {
      id: "thread-2",
      title: "Optimum Nutrition Creatine 300g — New Gold Seal vs Old Clear Band",
      author: "Hassan Mohamed",
      username: "@hassan_m",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      date: "Oct 26, 2026",
      tag: "Packaging Guide",
      content:
        "PSA for all gym members: Optimum Nutrition confirmed all genuine imports after July 2026 must feature the golden hologram neck seal. Don't buy clear tape tubs!",
      upvotes: 89,
      repliesCount: 15,
      hasVerifiedScan: true,
      replies: [],
    },
    {
      id: "thread-3",
      title: "Suspicious Pre-Workout lot APX-998 quarantined by inspectors",
      author: "Amina Health Inspector",
      username: "@amina_reg",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
      date: "Oct 22, 2026",
      tag: "Safety Bulletin",
      content:
        "Official laboratory confirmation: Apex Nitric Surge lot APX-998 contains unlisted pharmaceutical stimulants. Please submit reports if you spot it in local gym counters.",
      upvotes: 114,
      repliesCount: 23,
      hasVerifiedScan: true,
      replies: [],
    },
  ]);

  const handleOpenReply = (thread: any) => {
    setSelectedThread(thread);
    setIsReplyModalOpen(true);
  };

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) return;

    const newReply = {
      id: `rep-${Date.now()}`,
      author: "Ahmed",
      username: "@ahmed",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      date: "Just now",
      text: replyText,
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === selectedThread.id) {
          return {
            ...t,
            repliesCount: t.repliesCount + 1,
            replies: [...t.replies, newReply],
          };
        }
        return t;
      })
    );

    setIsReplyModalOpen(false);
    alert("Reply posted to community feed!");
  };

  const filteredThreads = threads.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q);
    const matchTag = filterTag === "All" || t.tag === filterTag;
    return matchSearch && matchTag;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-cyan-500" />
            Community Authenticity Network
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Consumer discussions, batch sightings, counterfeit alerts, and verified product reviews across regional markets.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedThread(threads[0]);
            setIsReplyModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Start New Discussion
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions by product, gym, or batch..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {["All", "Verification Help", "Packaging Guide", "Safety Bulletin"].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  filterTag === tag
                    ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/40 font-bold"
                    : "bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tag}
              </button>
            )
          )}
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {filteredThreads.map((thread) => (
          <div
            key={thread.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#0D1527]/90 border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 transition-all shadow-xs space-y-4"
          >
            {/* Top Author Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={thread.avatar}
                  alt={thread.author}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {thread.author}
                    </span>
                    <span className="text-xs font-mono text-cyan-500">
                      {thread.username}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {thread.date}
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {thread.tag}
              </span>
            </div>

            {/* Thread Content */}
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {thread.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {thread.content}
              </p>
            </div>

            {/* Existing Replies Preview */}
            {thread.replies.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Latest Reply
                </span>
                {thread.replies.map((rep) => (
                  <div key={rep.id} className="flex items-start gap-2.5 text-xs">
                    <img
                      src={rep.avatar}
                      alt={rep.author}
                      className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {rep.author}{" "}
                        <span className="font-mono text-cyan-500 text-[10px]">
                          {rep.username}
                        </span>
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                        "{rep.text}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => alert("Upvoted thread helpfulness!")}
                  className="flex items-center gap-1.5 hover:text-cyan-500 transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{thread.upvotes} Helpful</span>
                </button>
                <button
                  onClick={() => handleOpenReply(thread)}
                  className="flex items-center gap-1.5 hover:text-cyan-500 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{thread.repliesCount} Replies</span>
                </button>
              </div>

              <button
                onClick={() => handleOpenReply(thread)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 text-cyan-600 dark:text-cyan-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reply to Thread
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Post a Reply matching Gemini_Generated_Image_ma28o1ma28o1ma28.jpg EXACTLY */}
      {isReplyModalOpen && selectedThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#0C1424] border border-slate-200 dark:border-cyan-500/30 shadow-2xl overflow-hidden text-slate-900 dark:text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0A101D]">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Post a Reply</h3>
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handlePostReply} className="p-6 space-y-4">
              {/* Original Thread Box matching design (02) */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedThread.avatar}
                    alt={selectedThread.author}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Thread: {selectedThread.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {selectedThread.username} • {selectedThread.date}
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs pl-9 leading-relaxed">
                  "{selectedThread.content}"
                </p>
              </div>

              {/* Rich Text Toolbar matching design */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                <button
                  type="button"
                  className="p-1.5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded cursor-pointer"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded cursor-pointer"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded cursor-pointer"
                  title="Bullet list"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded cursor-pointer"
                  title="Numbered list"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded cursor-pointer"
                  title="Insert Link"
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reply Textarea */}
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-cyan-500/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
              />

              {/* Checkboxes matching design */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyReplies}
                    onChange={(e) => setNotifyReplies(e.target.checked)}
                    className="rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-white/20 text-cyan-600 focus:ring-0"
                  />
                  <span>Notify me of replies to this thread</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={attachScanHistory}
                    onChange={(e) => setAttachScanHistory(e.target.checked)}
                    className="rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-white/20 text-cyan-600 focus:ring-0"
                  />
                  <span className="flex items-center gap-1">
                    Attach Scan History
                    <Paperclip className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  </span>
                </label>
              </div>

              {/* Action Buttons matching design */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsReplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Post Reply</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
