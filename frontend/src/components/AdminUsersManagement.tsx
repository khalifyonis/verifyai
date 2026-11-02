"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MoreVertical,
  CheckCircle2,
  XCircle,
  KeyRound,
  Trash2,
  Edit,
  Mail,
  Building2,
  Globe,
  Lock,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  X,
  ExternalLink,
} from "lucide-react";
import {
  User,
  UserStats,
  RoleItem,
  getAdminUsers,
  getAdminUserStats,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  activateAdminUser,
  deactivateAdminUser,
  resetUserPasswordAdmin,
  getAdminRoles,
} from "@/lib/api";

export function AdminUsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    full_name: "",
    role: "consumer",
    organization_name: "",
    phone: "",
    country: "Somalia",
    is_active: true,
  });
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load users, stats and roles
  const loadData = async () => {
    try {
      setLoading(true);
      const [uList, uStats, rList] = await Promise.all([
        getAdminUsers({
          search: search || undefined,
          role: roleFilter || undefined,
          is_active: statusFilter === "" ? undefined : statusFilter === "active",
        }),
        getAdminUserStats().catch(() => null),
        getAdminRoles().catch(() => []),
      ]);
      setUsers(uList);
      setStats(uStats);
      setRoles(rList);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Actions
  const handleToggleStatus = async (user: User) => {
    try {
      if (user.is_active) {
        await deactivateAdminUser(user.id);
      } else {
        await activateAdminUser(user.id);
      }
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update user status");
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.username || user.email}"? This action is permanent.`)) {
      return;
    }
    try {
      await deleteAdminUser(user.id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);
    try {
      await createAdminUser({
        email: formData.email,
        username: formData.username || undefined,
        password: formData.password,
        full_name: formData.full_name || undefined,
        role: formData.role,
        organization_name: formData.organization_name || undefined,
        phone: formData.phone || undefined,
        country: formData.country || undefined,
        is_active: formData.is_active,
        is_verified: true,
      });
      setFormSuccess("User created successfully!");
      setTimeout(() => {
        setIsCreateOpen(false);
        setFormData({
          email: "",
          username: "",
          password: "",
          full_name: "",
          role: "consumer",
          organization_name: "",
          phone: "",
          country: "Somalia",
          is_active: true,
        });
        loadData();
      }, 700);
    } catch (err: any) {
      setFormError(err.message || "Error creating user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);
    try {
      await updateAdminUser(selectedUser.id, {
        full_name: selectedUser.full_name,
        username: selectedUser.username,
        role: selectedUser.role,
        organization_name: selectedUser.organization_name,
        phone: selectedUser.phone,
        country: selectedUser.country,
        is_active: selectedUser.is_active,
      });
      setFormSuccess("User updated successfully!");
      setTimeout(() => {
        setIsEditOpen(false);
        loadData();
      }, 700);
    } catch (err: any) {
      setFormError(err.message || "Error updating user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (newPasswordInput.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await resetUserPasswordAdmin(selectedUser.id, newPasswordInput);
      setFormSuccess("Password reset successfully!");
      setTimeout(() => {
        setIsResetPassOpen(false);
        setNewPasswordInput("");
      }, 800);
    } catch (err: any) {
      setFormError(err.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
      case "admin":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "inspector":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "company":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Stats Cards Banner                                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D172A] border border-cyan-500/20 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Registered</div>
            <div className="text-2xl font-extrabold font-mono text-white mt-1">
              {stats?.total_users ?? users.length}
            </div>
            <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Across all RBAC roles
            </div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D172A] border border-emerald-500/20 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Accounts</div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
              {stats?.active_users ?? users.filter((u) => u.is_active).length}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <UserCheck className="w-3 h-3 text-emerald-400" /> Operational & Verified
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D172A] border border-amber-500/20 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Inspectors & Officers</div>
            <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1">
              {stats?.roles_breakdown?.["inspector"] ?? users.filter((u) => u.role === "inspector").length}
            </div>
            <div className="text-[10px] text-amber-400 mt-1 flex items-center gap-1 font-mono">
              <Shield className="w-3 h-3 text-amber-400" /> Regulatory Field Staff
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D172A] border border-indigo-500/20 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Brand & Partners</div>
            <div className="text-2xl font-extrabold font-mono text-indigo-400 mt-1">
              {stats?.roles_breakdown?.["company"] ?? users.filter((u) => u.role === "company").length}
            </div>
            <div className="text-[10px] text-indigo-400 mt-1 flex items-center gap-1 font-mono">
              <Building2 className="w-3 h-3 text-indigo-400" /> Verified Manufacturers
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Search, Filter & Action Toolbar                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0D172A] p-4 rounded-2xl border border-white/10">
        <div className="flex flex-1 items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, @username, or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="inspector">Inspector</option>
            <option value="company">Company / Partner</option>
            <option value="consumer">Consumer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Suspended Only</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          <button
            onClick={() => {
              setFormData({
                email: "",
                username: "",
                password: "",
                full_name: "",
                role: "consumer",
                organization_name: "",
                phone: "",
                country: "Somalia",
                is_active: true,
              });
              setFormError(null);
              setFormSuccess(null);
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Users Table                                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-[#0D172A] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 font-semibold">User</th>
                <th className="py-3.5 px-4 font-semibold">Email & Phone</th>
                <th className="py-3.5 px-4 font-semibold">RBAC Role</th>
                <th className="py-3.5 px-4 font-semibold">Organization</th>
                <th className="py-3.5 px-4 font-semibold">Auth Type</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users match your search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* User Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.full_name || u.email}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-cyan-500/30"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white uppercase text-xs">
                              {(u.full_name || u.username || u.email).slice(0, 2)}
                            </div>
                          )}
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#0D172A] ${
                              u.is_active ? "bg-emerald-400" : "bg-rose-500"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            {u.full_name || "Unnamed User"}
                            {u.is_verified && (
                              <span title="Verified Account">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-cyan-400">
                            @{u.username || "no_username"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{u.email}</div>
                      {u.phone && <div className="text-[11px] text-slate-400 font-mono">{u.phone}</div>}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleColor(
                          u.role
                        )}`}
                      >
                        {u.role.replace("_", " ").toUpperCase()}
                      </span>
                    </td>

                    {/* Organization / Country */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{u.organization_name || "—"}</div>
                      {u.country && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-500" /> {u.country}
                        </div>
                      )}
                    </td>

                    {/* Auth Type */}
                    <td className="py-3.5 px-4">
                      {u.auth_provider === "google" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                          <svg className="w-3 h-3" viewBox="0 0 24 24">
                            <path
                              fill="#EA4335"
                              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                            />
                            <path
                              fill="#4285F4"
                              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"
                            />
                          </svg>
                          Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-slate-800 border border-white/10 px-2 py-0.5 rounded-md">
                          <Lock className="w-3 h-3 text-slate-400" />
                          Password
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-400" : "bg-rose-400"}`} />
                        {u.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setSelectedUser({ ...u });
                            setFormError(null);
                            setFormSuccess(null);
                            setIsEditOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setNewPasswordInput("");
                            setFormError(null);
                            setFormSuccess(null);
                            setIsResetPassOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 hover:text-amber-300 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Active / Deactivate */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.is_active
                              ? "bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          }`}
                          title={u.is_active ? "Suspend Account" : "Activate Account"}
                        >
                          {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Modal 1: Create User                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#091120] border border-cyan-500/30 p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New User</h3>
                  <p className="text-xs text-slate-400">Provision account with RBAC privileges</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Username <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                    placeholder="e.g. hassan_inspector"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Email Address <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@domain.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Ahmed Farah"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Password <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="consumer">Consumer (Public Scan Access)</option>
                    <option value="company">Company / Brand Importer</option>
                    <option value="inspector">Inspector (Field Verification)</option>
                    <option value="admin">Admin (Manager)</option>
                    <option value="super_admin">Super Admin (Full System Access)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. Somalia, UAE, USA"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Organization / Brand</label>
                <input
                  type="text"
                  value={formData.organization_name}
                  onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                  placeholder="e.g. Glanbia Nutrition / FDA Border Force"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="create_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="create_is_active" className="text-xs text-slate-300">
                  Account is active immediately upon creation
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold text-xs shadow-lg disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Modal 2: Edit User                                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#091120] border border-cyan-500/30 p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit User: @{selectedUser.username || selectedUser.email}</h3>
                  <p className="text-xs text-slate-400">Update profile details and role permissions</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Username</label>
                  <input
                    type="text"
                    value={selectedUser.username || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={selectedUser.full_name || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="consumer">Consumer</option>
                    <option value="company">Company / Importer</option>
                    <option value="inspector">Inspector</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Country</label>
                  <input
                    type="text"
                    value={selectedUser.country || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Organization / Brand</label>
                <input
                  type="text"
                  value={selectedUser.organization_name || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, organization_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={selectedUser.is_active}
                  onChange={(e) => setSelectedUser({ ...selectedUser, is_active: e.target.checked })}
                  className="rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="edit_is_active" className="text-xs text-slate-300">
                  Account is active (uncheck to suspend user)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold text-xs shadow-lg disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Modal 3: Reset Password                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isResetPassOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#091120] border border-amber-500/30 p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reset User Password</h3>
                  <p className="text-xs text-slate-400">For: {selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsResetPassOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  New Password <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsResetPassOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-white font-bold text-xs shadow-lg disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
