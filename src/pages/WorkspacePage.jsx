import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function StatCard({ label, value, icon, color }) {
    const colors = {
        cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
        green: "text-green-400 border-green-500/20 bg-green-500/5",
        purple: "text-purple-400 border-purple-500/20 bg-purple-500/5",
        orange: "text-orange-400 border-orange-500/20 bg-orange-500/5",
    };
    return (
        <div className={`border rounded-2xl p-5 ${colors[color]}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm">{label}</span>
                <span className="text-xl">{icon}</span>
            </div>
            <div className={`text-3xl font-bold ${colors[color].split(" ")[0]}`}>
                {value ?? "—"}
            </div>
        </div>
    );
}

export default function WorkspacePage() {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ workspaceName: "", ownerName: "" });
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [profileRes, statsRes] = await Promise.all([
                api.get("/tenant/me"),
                api.get("/dashboard/stats"),
            ]);
            setProfile(profileRes.data);
            setStats(statsRes.data);
            setForm({
                workspaceName: profileRes.data.workspaceName || "",
                ownerName: profileRes.data.ownerName || "",
            });
        } catch {
            toast("Failed to load workspace info", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            await api.put(`/tenants/${profile.id}`, form);
            // update localStorage too
            localStorage.setItem("workspaceName", form.workspaceName);
            localStorage.setItem("ownerName", form.ownerName);
            setProfile(prev => ({ ...prev, ...form }));
            setEditing(false);
            toast("Workspace updated successfully!");
        } catch {
            toast("Failed to update workspace", "error");
        } finally {
            setSaving(false);
        }
    };

    const roleBadge = {
        ADMIN: "text-purple-300 border-purple-500/30 bg-purple-500/10",
        MANAGER: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10",
        ANALYST: "text-green-300 border-green-500/30 bg-green-500/10",
        VIEWER: "text-slate-300 border-slate-600 bg-slate-800",
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mb-2" />
                    <div className="h-4 w-72 bg-slate-800 rounded animate-pulse mb-8" />
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-slate-900 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                    <div className="h-64 bg-slate-900 rounded-3xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-1">Workspace</h1>
                    <p className="text-slate-400">Manage your workspace settings and view usage statistics.</p>
                </div>

                {/* Workspace Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Metrics" value={stats?.totalMetrics?.toLocaleString()} icon="📈" color="cyan" />
                    <StatCard label="Data Sources" value={stats?.activeDataSources} icon="📡" color="green" />
                    <StatCard label="Reports" value={stats?.reportsGenerated} icon="📄" color="purple" />
                    <StatCard label="Anomalies (24h)" value={stats?.anomaliesLast24h} icon="🔴" color="orange" />
                </div>

                {/* Workspace Info */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <h2 className="text-xl font-semibold">Workspace Information</h2>
                        {!editing ? (
                            <button onClick={() => setEditing(true)}
                                className="text-sm text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 px-4 py-2 rounded-xl transition hover:bg-cyan-500/10">
                                Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={handleSave} disabled={saving}
                                    className="text-sm bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl transition disabled:opacity-50">
                                    {saving ? "Saving..." : "Save"}
                                </button>
                                <button onClick={() => setEditing(false)}
                                    className="text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl transition">
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { label: "Workspace Name", key: "workspaceName", editable: true },
                            { label: "Owner Name", key: "ownerName", editable: true },
                            { label: "Email", key: "email", editable: false },
                            { label: "Tenant ID", key: "id", editable: false },
                        ].map(field => (
                            <div key={field.key}>
                                <label className="block text-slate-500 text-xs uppercase tracking-wide mb-2">
                                    {field.label}
                                </label>
                                {editing && field.editable ? (
                                    <input
                                        value={form[field.key] || ""}
                                        onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                    />
                                ) : (
                                    <div className="text-white font-medium py-2.5">
                                        {profile?.[field.key] ?? "—"}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div>
                            <label className="block text-slate-500 text-xs uppercase tracking-wide mb-2">Role</label>
                            <div className="py-2.5">
                                <span className={`text-sm px-3 py-1 rounded-full border font-medium ${roleBadge[profile?.role] || roleBadge.VIEWER}`}>
                                    {profile?.role || "ADMIN"}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-500 text-xs uppercase tracking-wide mb-2">Plan</label>
                            <div className="py-2.5">
                                <span className="text-sm px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 font-medium">
                                    Pro
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Note */}
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">🔒</span>
                        <div>
                            <div className="font-semibold text-green-400 mb-1">Data Isolation Active</div>
                            <p className="text-slate-400 text-sm">
                                All your metrics, reports, anomalies, and embed configurations are isolated to this workspace only.
                                No other tenant can access your data. Tenant ID <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">{profile?.id}</code> is
                                enforced on every API request via JWT.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
