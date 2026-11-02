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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Dumbbell className="w-7 h-7 text-cyan-400" />
            Verified Supplement Master Catalog
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Official sports nutrition registry with authorized production lots, banned substance testing certificates, and recall notices.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-center"
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm font-sans"
          />
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading sports nutrition catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-white/10 text-slate-400">
          <p className="text-sm">No supplements found matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl glass-panel border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-cyan-400 font-mono tracking-wide">
                    {p.brand}
                  </span>
                  {p.is_recalled ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold font-mono uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded">
                      <AlertOctagon className="w-3 h-3" />
                      Active Recall
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Catalog
                    </span>
                  )}
                </div>

                {/* Supplement Name & Variant */}
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {p.name}
                </h3>
                {p.variant && (
                  <span className="text-xs font-semibold text-cyan-300/90 block mt-0.5">
                    {p.variant}
                  </span>
                )}
                <p className="text-xs text-slate-400 line-clamp-2 mt-2 mb-3">{p.description}</p>

                {/* Certifications (if any) */}
                {p.certifications && p.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.certifications.map((c, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/50 border border-white/5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GTIN:</span>
                    <span className="font-mono text-cyan-300">{p.gtin_barcode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-slate-200">{p.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Batches Registered:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {p.batches?.length || 1} Production Lots
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {p.serving_size || "Standard Tub"}
                </span>
                <button
                  onClick={() => onVerifyProduct(p.gtin_barcode)}
                  className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl glass-panel border border-cyan-500/30 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/60">
              <h3 className="font-semibold text-white">Register Supplement Master</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div>
                <label className="text-xs text-slate-300">Supplement Title</label>
                <input
                  required
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Gold Standard 100% Whey"
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300">Brand Owner</label>
                  <input
                    required
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="e.g. Optimum Nutrition"
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs bg-slate-900"
                  >
                    <option value="Whey Protein & Protein Powders">Whey Protein & Powders</option>
                    <option value="Creatine Monohydrate">Creatine Monohydrate</option>
                    <option value="Pre-Workout & Energy Formulations">Pre-Workout & Energy</option>
                    <option value="BCAAs & Amino Acids">BCAAs & Amino Acids</option>
                    <option value="Electrolytes & Hydration">Electrolytes & Hydration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300">Variant / Flavor / Weight</label>
                  <input
                    type="text"
                    value={newVariant}
                    onChange={(e) => setNewVariant(e.target.value)}
                    placeholder="e.g. Double Rich Choc 5lb"
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300">GTIN / Barcode (EAN-13)</label>
                  <input
                    required
                    type="text"
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    placeholder="e.g. 0748927028669"
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300">Description & Active Ingredients</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Official formulation specs, neck seal security, serving size..."
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold"
                >
                  {creating ? "Saving..." : "Save Supplement Master"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
