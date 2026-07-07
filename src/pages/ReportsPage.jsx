import { useState, useEffect } from "react";
import { reportsApi } from "../services/dataSourceApi";
import { useToast } from "../context/ToastContext";

const REPORT_TYPES = ["WEEKLY", "MONTHLY", "ANALYSIS", "FUNNEL", "DIGEST", "CUSTOM"];

function SkeletonRow() {
    return (
        <tr className="border-b border-slate-800">
            {[...Array(5)].map((_, i) => (
                <td key={i} className="py-4 px-5">
                    <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4"></div>
                </td>
            ))}
        </tr>
    );
}

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState("WEEKLY");
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => { fetchReports(); }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await reportsApi.list();
            setReports(res.data);
        } catch { toast("Failed to load reports", "error"); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await reportsApi.create(newName, newType);
            toast("Report created!");
            setNewName(""); setNewType("WEEKLY"); setShowCreate(false);
            fetchReports();
        } catch { toast("Failed to create report", "error"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this report?")) return;
        try {
            await reportsApi.delete(id);
            toast("Report deleted");
            setReports(prev => prev.filter(r => r.id !== id));
        } catch { toast("Failed to delete report", "error"); }
    };

    const filtered = reports.filter(r => {
        const matchSearch = r.reportName?.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === "ALL" || r.reportType === filterType;
        return matchSearch && matchType;
    });

    const typeBadgeColor = {
        WEEKLY: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
        MONTHLY: "text-purple-400 bg-purple-500/10 border-purple-500/30",
        ANALYSIS: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
        FUNNEL: "text-green-400 bg-green-500/10 border-green-500/30",
        DIGEST: "text-orange-400 bg-orange-500/10 border-orange-500/30",
        CUSTOM: "text-pink-400 bg-pink-500/10 border-pink-500/30",
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Reports</h1>
                        <p className="text-slate-400">Create and manage analytical reports for your workspace.</p>
                    </div>
                    <button onClick={() => setShowCreate(!showCreate)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2">
                        <span>+</span> New Report
                    </button>
                </div>

                {/* Create Form */}
                {showCreate && (
                    <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 mb-8">
                        <h2 className="text-lg font-semibold mb-4">Create New Report</h2>
                        <form onSubmit={handleCreate} className="flex items-end gap-4 flex-wrap">
                            <div className="flex-1 min-w-48">
                                <label className="block text-slate-400 text-sm mb-1.5">Report Name</label>
                                <input value={newName} onChange={e => setNewName(e.target.value)} required
                                    placeholder="e.g. Weekly Performance Summary"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                            </div>
                            <div className="w-44">
                                <label className="block text-slate-400 text-sm mb-1.5">Type</label>
                                <select value={newType} onChange={e => setNewType(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500">
                                    {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" disabled={saving || !newName}
                                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 font-semibold px-5 py-3 rounded-xl transition">
                                    {saving ? "Saving..." : "Create"}
                                </button>
                                <button type="button" onClick={() => setShowCreate(false)}
                                    className="bg-slate-700 hover:bg-slate-600 font-medium px-5 py-3 rounded-xl transition">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filters + Search */}
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                    <div className="flex-1 relative min-w-64">
                        <span className="absolute left-4 top-3.5 text-slate-500 text-sm">🔍</span>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search reports..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {["ALL", ...REPORT_TYPES].map(t => (
                            <button key={t} onClick={() => setFilterType(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                                    filterType === t ? "bg-cyan-600 border-cyan-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                                }`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                        <span className="text-sm text-slate-400">{filtered.length} report{filtered.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-left">
                                    <th className="py-3 px-5">Report Name</th>
                                    <th className="py-3 px-5">Type</th>
                                    <th className="py-3 px-5">Created By</th>
                                    <th className="py-3 px-5">Created At</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="py-16 text-center text-slate-600">
                                        <div className="text-5xl mb-3">📄</div>
                                        <p className="text-lg font-medium">{search ? "No reports match your search" : "No reports yet"}</p>
                                        <p className="text-sm mt-1">{!search && "Click \"New Report\" to create your first one"}</p>
                                    </td></tr>
                                ) : (
                                    filtered.map(report => (
                                        <tr key={report.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition group">
                                            <td className="py-4 px-5 font-medium text-white">{report.reportName}</td>
                                            <td className="py-4 px-5">
                                                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${typeBadgeColor[report.reportType] || "text-slate-400 border-slate-600"}`}>
                                                    {report.reportType}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-slate-400">{report.createdBy || "—"}</td>
                                            <td className="py-4 px-5 text-slate-400">
                                                {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="py-4 px-5 text-right">
                                                <button onClick={() => handleDelete(report.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition text-xs font-medium">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}