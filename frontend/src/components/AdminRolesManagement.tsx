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

export function AdminRolesManagement() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [loading, setLoading] = useState(true);

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
        getAdminRoles(),
        getAdminPermissions(),
      ]);
      setRoles(rList);
      setPermissions(pList);
      if (rList.length > 0 && !selectedRole) {
        setSelectedRole(rList[0]);
      } else if (selectedRole) {
        const updated = rList.find((r) => r.id === selectedRole.id);
        if (updated) setSelectedRole(updated);
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
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {} as Record<string, PermissionItem[]>);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    try {
      await createAdminRole({
        code: roleForm.code.toLowerCase().replace(/[^a-z0-9_]/g, ""),
        name: roleForm.name,
        description: roleForm.description,
        color: roleForm.color,
        permission_ids: selectedPermIds,
      });
      setMsg({ type: "success", text: "Role created successfully!" });
      setTimeout(() => {
        setIsCreateRoleOpen(false);
        setRoleForm({ code: "", name: "", description: "", color: "#06B6D4" });
        setSelectedPermIds([]);
        loadData();
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
    setSubmitting(true);
    try {
      const updated = await assignPermissionsToRole(selectedRole.id, selectedPermIds);
      setSelectedRole(updated);
      setMsg({ type: "success", text: "Permissions updated successfully!" });
      setTimeout(() => {
        setIsEditPermissionsOpen(false);
        loadData();
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
      await deleteAdminRole(role.id);
      loadData();
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0D172A] p-4 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            Roles & Permissions Matrix (RBAC)
          </h2>
          <p className="text-xs text-slate-400">
            Define fine-grained permission scopes for Users, Products, Verification, Reports, and System settings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
          <button
            onClick={() => {
              setRoleForm({ code: "", name: "", description: "", color: "#06B6D4" });
              setSelectedPermIds([]);
              setMsg(null);
              setIsCreateRoleOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 text-white font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)]"
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
                  ? "bg-[#111C35] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50"
                  : "bg-[#0D172A] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full ring-2 ring-white/10"
                    style={{ backgroundColor: r.color || "#06B6D4" }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{r.name}</h3>
                    <div className="text-[10px] font-mono text-cyan-400">code: {r.code}</div>
                  </div>
                </div>
                {r.is_system && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    System
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-3 line-clamp-2 min-h-[32px]">
                {r.description || "No description provided."}
              </p>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-300">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  {r.permissions.length} perms
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
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
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-[11px] font-medium flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" /> Edit Permissions
                </button>
                {!r.is_system && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRole(r);
                    }}
                    className="p-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
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
        <div className="p-6 rounded-3xl bg-[#0D172A] border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedRole.color || "#06B6D4" }}
              />
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Permissions Assigned to: {selectedRole.name}
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {selectedRole.permissions.length} of {permissions.length} Granted
                  </span>
                </h3>
                <p className="text-xs text-slate-400">{selectedRole.description}</p>
              </div>
            </div>

            <button
              onClick={() => handleOpenEditPermissions(selectedRole)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 text-xs font-bold transition-all"
            >
              <Edit className="w-3.5 h-3.5" />
              Configure Role
            </button>
          </div>

          {/* Module-by-module matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(permissionsByModule).map(([moduleName, perms]) => {
              const assignedCount = perms.filter((p) =>
                selectedRole.permissions.some((rp) => rp.id === p.id)
              ).length;

              return (
                <div key={moduleName} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">
                      {moduleName}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        assignedCount === perms.length
                          ? "bg-emerald-500/10 text-emerald-400"
                          : assignedCount > 0
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {assignedCount}/{perms.length} Granted
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {perms.map((p) => {
                      const hasPerm = selectedRole.permissions.some((rp) => rp.id === p.id);
                      return (
                        <div
                          key={p.id}
                          className={`flex items-start gap-2 p-2 rounded-xl text-xs transition-colors ${
                            hasPerm
                              ? "bg-cyan-500/10 text-cyan-200 border border-cyan-500/20"
                              : "bg-white/[0.01] text-slate-500 opacity-60"
                          }`}
                        >
                          <div className="mt-0.5">
                            {hasPerm ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200">{p.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{p.code}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Modal: Create Custom Role                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isCreateRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl bg-[#091120] border border-cyan-500/30 p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Custom Role</h3>
                  <p className="text-xs text-slate-400">Define code, metadata, and default permissions</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateRoleOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {msg && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  msg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Role Code <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roleForm.code}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      })
                    }
                    placeholder="e.g. lab_auditor"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Display Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    placeholder="e.g. Lab Forensic Auditor"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Responsibilities and access scope of this role..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Role Color Tag</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={roleForm.color}
                    onChange={(e) => setRoleForm({ ...roleForm, color: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-slate-300">{roleForm.color}</span>
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Assign Initial Permissions:</span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {selectedPermIds.length} Selected
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-4 p-3 rounded-2xl bg-slate-950 border border-white/10">
                  {Object.entries(permissionsByModule).map(([mod, perms]) => (
                    <div key={mod} className="space-y-2">
                      <div className="text-[11px] font-mono font-bold uppercase text-cyan-400 border-b border-white/5 pb-1">
                        {mod}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((p) => {
                          const isChecked = selectedPermIds.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className={`flex items-start gap-2 p-2 rounded-xl cursor-pointer text-xs border transition-all ${
                                isChecked
                                  ? "bg-cyan-500/10 border-cyan-500/30 text-white"
                                  : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(p.id)}
                                className="mt-0.5 rounded border-white/20 bg-slate-900 text-cyan-500"
                              />
                              <div>
                                <div className="font-semibold">{p.name}</div>
                                <div className="text-[10px] font-mono text-slate-500">{p.code}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 text-white font-bold text-xs shadow-lg disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Modal: Edit Permissions for Selected Role                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isEditPermissionsOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl bg-[#091120] border border-cyan-500/30 p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Configure: {selectedRole.name}</h3>
                  <p className="text-xs text-slate-400">Toggle permissions granted to this role</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditPermissionsOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {msg && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  msg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                }`}
              >
                {msg.text}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-cyan-400">
                {selectedPermIds.length} of {permissions.length} Permissions Selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPermIds(permissions.map((p) => p.id))}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-xs"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPermIds([])}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-xs"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-4 max-h-96 overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-white/10">
              {Object.entries(permissionsByModule).map(([mod, perms]) => (
                <div key={mod} className="space-y-2">
                  <div className="text-xs font-mono font-bold uppercase text-cyan-400 border-b border-white/10 pb-1">
                    {mod}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((p) => {
                      const isChecked = selectedPermIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-start gap-2 p-2.5 rounded-xl cursor-pointer text-xs border transition-all ${
                            isChecked
                              ? "bg-cyan-500/10 border-cyan-500/30 text-white"
                              : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(p.id)}
                            className="mt-0.5 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-0"
                          />
                          <div>
                            <div className="font-semibold">{p.name}</div>
                            <div className="text-[10px] font-mono text-slate-500">{p.code}</div>
                            {p.description && (
                              <div className="text-[10px] text-slate-400 mt-0.5">{p.description}</div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditPermissionsOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 text-white font-bold text-xs shadow-lg disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
