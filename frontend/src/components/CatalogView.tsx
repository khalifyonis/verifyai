"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Search,
  Plus,
  ShieldCheck,
  AlertOctagon,
  Layers,
  Building2,
  Calendar,
  ExternalLink,
  X,
  Award,
  Dumbbell,
} from "lucide-react";
import { getProducts, createProduct, ProductItem } from "@/lib/api";

interface CatalogViewProps {
  onVerifyProduct: (barcode: string) => void;
}

export function CatalogView({ onVerifyProduct }: CatalogViewProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form state
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("Whey Protein & Protein Powders");
  const [newBarcode, setNewBarcode] = useState("");
  const [newVariant, setNewVariant] = useState("");
  const [newServing, setNewServing] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const cat = selectedCategory === "All" ? undefined : selectedCategory;
      const data = await getProducts(search || undefined, cat);
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [search, selectedCategory]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBrand || !newBarcode) return;

    try {
      setCreating(true);
      await createProduct({
        name: newName,
        brand: newBrand,
        category: newCategory,
        gtin_barcode: newBarcode,
        variant: newVariant,
        serving_size: newServing,
        description: newDesc,
        authorized_regions: "Global",
      });
      setIsAddModalOpen(false);
      setNewName("");
      setNewBrand("");
      setNewBarcode("");
      setNewVariant("");
      setNewServing("");
      setNewDesc("");
      fetchCatalog();
    } catch (err: any) {
      alert(err?.message || "Failed to register product");
    } finally {
      setCreating(false);
    }
  };

  const categories = [
    "All",
    "Whey Protein & Protein Powders",
    "Creatine Monohydrate",
    "Pre-Workout & Energy Formulations",
    "BCAAs & Amino Acids",
    "Electrolytes & Hydration",
    "Vitamins & Minerals",
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Dumbbell className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            Verified Supplement Master Catalog
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Official sports nutrition registry with authorized production lots, banned substance testing certificates, and recall notices.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register Supplement
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand, supplement name, flavor, or GTIN barcode..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-colors shadow-xs"
          />
          <Search className="w-4 h-4 text-cyan-600 dark:text-cyan-400 absolute left-3.5 top-3" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-bold shadow-xs"
                  : "bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading sports nutrition catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 shadow-xs">
          <p className="text-sm">No supplements found matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 hover:border-cyan-400 dark:hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 font-mono tracking-wide">
                    {p.brand}
                  </span>
                  {p.is_recalled ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold font-mono uppercase bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 px-2 py-0.5 rounded">
                      <AlertOctagon className="w-3 h-3" />
                      Active Recall
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold font-mono uppercase bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Catalog
                    </span>
                  )}
                </div>

                {/* Supplement Name & Variant */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {p.name}
                </h3>
                {p.variant && (
                  <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300/90 block mt-0.5">
                    {p.variant}
                  </span>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 mb-3">{p.description}</p>

                {/* Certifications (if any) */}
                {p.certifications && p.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.certifications.map((c, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">GTIN:</span>
                    <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold">{p.gtin_barcode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Category:</span>
                    <span className="text-slate-700 dark:text-slate-200">{p.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Batches Registered:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                      {p.batches?.length || 1} Production Lots
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {p.serving_size || "Standard Tub"}
                </span>
                <button
                  onClick={() => onVerifyProduct(p.gtin_barcode)}
                  className="flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Verify Barcode
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplement Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#091120] border border-slate-200 dark:border-cyan-500/30 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60">
              <h3 className="font-semibold text-slate-900 dark:text-white">Register Supplement Master</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-medium block mb-1">
                  Product / Supplement Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold Standard 100% Whey"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-medium block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Optimum Nutrition"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-medium block mb-1">GTIN Barcode *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0748927028669"
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-medium block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  {categories.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-medium block mb-1">Flavor / Variant</label>
                  <input
                    type="text"
                    placeholder="e.g. Double Rich Chocolate"
                    value={newVariant}
                    onChange={(e) => setNewVariant(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-medium block mb-1">Serving Size / Weight</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 lbs (2.27 kg)"
                    value={newServing}
                    onChange={(e) => setNewServing(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-medium block mb-1">Official Description</label>
                <textarea
                  rows={2}
                  placeholder="Official formulation specs and packaging security details..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-md shadow-cyan-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {creating ? "Registering..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
