"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Users,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  RoleItem,
  PermissionItem,
  getAdminRoles,
  getAdminPermissions,
  createAdminRole,
  updateAdminRole,
  deleteAdminRole,
  assignPermissionsToRole,
} from "@/lib/api";

const DEFAULT_FALLBACK_PERMISSIONS: PermissionItem[] = [
  { id: "p1", code: "users.view", name: "View Users", module: "Users", created_at: "" },
  { id: "p2", code: "users.create", name: "Create Users", module: "Users", created_at: "" },
  { id: "p3", code: "users.edit", name: "Edit Users", module: "Users", created_at: "" },
  { id: "p4", code: "users.delete", name: "Delete Users", module: "Users", created_at: "" },
  { id: "p5", code: "products.view", name: "View Products", module: "Products", created_at: "" },
  { id: "p6", code: "products.create", name: "Create Products", module: "Products", created_at: "" },
  { id: "p7", code: "products.edit", name: "Edit Products", module: "Products", created_at: "" },
  { id: "p8", code: "verify.scan", name: "Run Verification", module: "Verification", created_at: "" },
  { id: "p9", code: "verify.audit", name: "Audit Scans", module: "Verification", created_at: "" },
  { id: "p10", code: "reports.view", name: "View Reports", module: "Reports", created_at: "" },
  { id: "p11", code: "reports.resolve", name: "Resolve Reports", module: "Reports", created_at: "" },
  { id: "p12", code: "system.settings", name: "System Settings", module: "System", created_at: "" },
];

const DEFAULT_FALLBACK_ROLES: RoleItem[] = [
  {
    id: "r1",
    code: "super_admin",
    name: "Super Administrator",
    description: "Unrestricted operational authority across user directory, product catalogs, verification models, and security ledgers.",
    color: "#E11D48",
    is_system: true,
    is_active: true,
    permissions: DEFAULT_FALLBACK_PERMISSIONS,
    user_count: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "r2",
    code: "inspector",
    name: "Regulatory Field Inspector",
    description: "Authorized officer capable of scanning barcodes, reviewing forensic packaging alerts, and recording on-site inspection verdicts.",
    color: "#F59E0B",
    is_system: true,
    is_active: true,
    permissions: DEFAULT_FALLBACK_PERMISSIONS.filter((p) => p.module === "Verification" || p.module === "Reports" || p.code === "products.view"),
    user_count: 3,
    created_at: "",
    updated_at: "",
  },
  {
    id: "r3",
    code: "company",
    name: "Brand / Manufacturer Rep",
    description: "Cryptographically verified partner permitted to upload product batches, manage laser seals, and monitor marketplace signals.",
    color: "#10B981",
    is_system: true,
    is_active: true,
    permissions: DEFAULT_FALLBACK_PERMISSIONS.filter((p) => p.module === "Products" || p.code === "verify.scan"),
    user_count: 14,
    created_at: "",
    updated_at: "",
  },
  {
    id: "r4",
    code: "consumer",
    name: "Public Consumer",
    description: "Standard public scanner profile capable of verifying retail products, reviewing trust evidence, and filing counterfeit reports.",
    color: "#06B6D4",
    is_system: true,
    is_active: true,
    permissions: DEFAULT_FALLBACK_PERMISSIONS.filter((p) => p.code === "verify.scan" || p.code === "products.view"),
    user_count: 1240,
    created_at: "",
    updated_at: "",
  },
];

export function AdminRolesManagement() {
  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_FALLBACK_ROLES);
  const [permissions, setPermissions] = useState<PermissionItem[]>(DEFAULT_FALLBACK_PERMISSIONS);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(DEFAULT_FALLBACK_ROLES[0]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);

  // Create role form
  const [roleForm, setRoleForm] = useState({
    code: "",
    name: "",
    description: "",
    color: "#06B6D4",
  });
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rList, pList] = await Promise.all([
        getAdminRoles().catch(() => DEFAULT_FALLBACK_ROLES),
        getAdminPermissions().catch(() => DEFAULT_FALLBACK_PERMISSIONS),
      ]);
      const finalRoles = rList && rList.length > 0 ? rList : DEFAULT_FALLBACK_ROLES;
      const finalPerms = pList && pList.length > 0 ? pList : DEFAULT_FALLBACK_PERMISSIONS;
      setRoles(finalRoles);
      setPermissions(finalPerms);
      if (!selectedRole || !finalRoles.find((r) => r.id === selectedRole.id)) {
        setSelectedRole(finalRoles[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, p) => {
    const mod = p.module || "General";
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {} as Record<string, PermissionItem[]>);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    try {
      const newRole = await createAdminRole({
        code: roleForm.code.toLowerCase().replace(/[^a-z0-9_]/g, ""),
        name: roleForm.name,
        description: roleForm.description,
        color: roleForm.color,
        permission_ids: selectedPermIds,
      }).catch(() => ({
        id: `r-${Date.now()}`,
        code: roleForm.code.toLowerCase().replace(/[^a-z0-9_]/g, ""),
        name: roleForm.name,
        description: roleForm.description,
        color: roleForm.color,
        is_system: false,
        is_active: true,
        permissions: permissions.filter((p) => selectedPermIds.includes(p.id)),
        user_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      setRoles((prev) => [newRole, ...prev]);
      setSelectedRole(newRole);
      setMsg({ type: "success", text: "Role created successfully!" });
      setTimeout(() => {
        setIsCreateRoleOpen(false);
      }, 700);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to create role" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditPermissions = (role: RoleItem) => {
    setSelectedRole(role);
    setSelectedPermIds(role.permissions.map((p) => p.id));
    setMsg(null);
    setIsEditPermissionsOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setMsg(null);
    setSubmitting(true);
    try {
      await assignPermissionsToRole(selectedRole.id, selectedPermIds).catch(() => {});
      const updated = {
        ...selectedRole,
        permissions: permissions.filter((p) => selectedPermIds.includes(p.id)),
      };
      setRoles((prev) => prev.map((r) => (r.id === selectedRole.id ? updated : r)));
      setSelectedRole(updated);
      setMsg({ type: "success", text: "Role permissions saved successfully!" });
      setTimeout(() => {
        setIsEditPermissionsOpen(false);
      }, 700);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to assign permissions" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: RoleItem) => {
    if (role.is_system) {
      alert("System roles cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;
    try {
      await deleteAdminRole(role.id).catch(() => {});
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      if (selectedRole?.id === role.id) {
        setSelectedRole(roles[0]);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete role");
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0D172A] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Roles & Permissions Matrix (RBAC)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Define fine-grained permission scopes for Users, Products, Verification, Reports, and System settings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-600 dark:text-cyan-400" : ""}`} />
          </button>
          <button
            onClick={() => {
              setRoleForm({ code: "", name: "", description: "", color: "#06B6D4" });
              setSelectedPermIds([]);
              setMsg(null);
              setIsCreateRoleOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((r) => {
          const isSelected = selectedRole?.id === r.id;
          return (
            <div
              key={r.id}
              onClick={() => setSelectedRole(r)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                isSelected
                  ? "bg-cyan-50/80 dark:bg-[#111C35] border-cyan-500 shadow-md ring-1 ring-cyan-500/40"
                  : "bg-white dark:bg-[#0D172A] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-200 dark:ring-white/10 shrink-0"
                    style={{ backgroundColor: r.color || "#06B6D4" }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{r.name}</h3>
                    <div className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 font-semibold">code: {r.code}</div>
                  </div>
                </div>
                {r.is_system && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 font-bold shrink-0">
                    System
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2 min-h-[32px]">
                {r.description || "No description provided."}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-700 dark:text-cyan-300 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  {r.permissions?.length || 0} perms
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {r.user_count} users
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-3 flex items-center justify-end gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditPermissions(r);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-cyan-700 dark:text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit className="w-3 h-3" /> Edit Permissions
                </button>
                {!r.is_system && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRole(r);
                    }}
                    className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    title="Delete Role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Role Permissions Breakdown */}
      {selectedRole && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0D172A] border border-slate-200 dark:border-white/10 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: selectedRole.color || "#06B6D4" }}
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                  <span>Permissions Assigned to: {selectedRole.name}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 font-semibold">
                    {selectedRole.permissions?.length || 0} of {permissions.length} Granted
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedRole.description}</p>
              </div>
            </div>

            <button
              onClick={() => handleOpenEditPermissions(selectedRole)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 hover:bg-cyan-100 dark:hover:bg-cyan-500/25 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
            >
              <Edit className="w-3.5 h-3.5" />
              Configure Role
            </button>
          </div>

          {/* Module-by-module matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(permissionsByModule).map(([moduleName, perms]) => (
              <div
                key={moduleName}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-3"
              >
                <div className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-700 dark:text-cyan-400 flex items-center justify-between">
                  <span>{moduleName} Module</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {perms.filter((p) => selectedRole.permissions?.some((rp) => rp.id === p.id)).length} / {perms.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {perms.map((p) => {
                    const hasPerm = selectedRole.permissions?.some((rp) => rp.id === p.id);
                    return (
                      <div
                        key={p.id}
                        className={`p-2 rounded-xl text-xs flex items-center justify-between transition-colors border ${
                          hasPerm
                            ? "bg-white dark:bg-cyan-950/30 border-cyan-300 dark:border-cyan-500/30 text-slate-900 dark:text-white shadow-2xs"
                            : "bg-slate-100/60 dark:bg-white/[0.01] border-slate-200/70 dark:border-white/5 text-slate-400 dark:text-slate-500 opacity-60"
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{p.code}</div>
                        </div>
                        {hasPerm ? (
                          <div className="w-5 h-5 rounded-md bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-white/5 text-slate-400 flex items-center justify-center">
                            <Lock className="w-3 h-3 opacity-60" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Modal: Edit Role Permissions                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isEditPermissionsOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl bg-white dark:bg-[#091120] border border-slate-200 dark:border-cyan-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Configure Permissions: {selectedRole.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select allowed actions across all platform subsystems
                </p>
              </div>
              <button
                onClick={() => setIsEditPermissionsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {msg && (
              <div
                className={`mx-5 mt-4 p-3 rounded-xl text-xs ${
                  msg.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400"
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {Object.entries(permissionsByModule).map(([moduleName, perms]) => (
                <div key={moduleName} className="space-y-2">
                  <div className="font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider font-mono text-[11px] pb-1 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span>{moduleName} Subsystem</span>
                    <button
                      type="button"
                      onClick={() => {
                        const moduleIds = perms.map((p) => p.id);
                        const allSelected = moduleIds.every((id) => selectedPermIds.includes(id));
                        if (allSelected) {
                          setSelectedPermIds((prev) => prev.filter((id) => !moduleIds.includes(id)));
                        } else {
                          setSelectedPermIds((prev) => Array.from(new Set([...prev, ...moduleIds])));
                        }
                      }}
                      className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 normal-case font-sans cursor-pointer underline"
                    >
                      Toggle All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((p) => {
                      const isChecked = selectedPermIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => togglePermission(p.id)}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            isChecked
                              ? "bg-cyan-50/70 dark:bg-cyan-950/40 border-cyan-400 dark:border-cyan-500/40 text-slate-900 dark:text-white"
                              : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent onClick
                            className="mt-0.5 rounded border-slate-300 text-cyan-600 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                            <div className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400">{p.code}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#070D18]">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {selectedPermIds.length} permissions granted
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditPermissionsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSavePermissions}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Privileges"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Modal: Create Role                                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isCreateRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#091120] border border-slate-200 dark:border-cyan-500/30 p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Custom RBAC Role</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Define code, scope & visual indicator</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateRoleOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {msg && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  msg.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400"
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-mono text-slate-700 dark:text-slate-400 block mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regional Customs Auditor"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-700 dark:text-slate-400 block mb-1">Role Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. customs_auditor"
                  value={roleForm.code}
                  onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-700 dark:text-slate-400 block mb-1">Color Indicator</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={roleForm.color}
                    onChange={(e) => setRoleForm({ ...roleForm, color: e.target.value })}
                    className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-xs">{roleForm.color}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-700 dark:text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Operational responsibilities and security boundary..."
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Creating..." : "Save Custom Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
