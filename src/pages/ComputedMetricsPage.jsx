import { useState, useEffect } from "react";
import { computedMetricsApi } from "../services/dataSourceApi";
import { useToast } from "../context/ToastContext";

const SAMPLE_FORMULAS = [
    { name: "Conversion Rate", formula: "Signups / Visitors * 100" },
    { name: "ARPU", formula: "Revenue / ActiveUsers" },
    { name: "Growth Rate", formula: "(MRR - prevMRR) / prevMRR * 100" },
    { name: "Churn %", formula: "Cancelled / TotalUsers * 100" },
];

export default function ComputedMetricsPage() {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [formula, setFormula] = useState("");
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => { fetchMetrics(); }, []);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const res = await computedMetricsApi.list();
            setMetrics(res.data);
        } catch { toast("Failed to load computed metrics", "error"); }
        finally { setLoading(false); }
    };

    const handlePreview = () => {
        if (!formula) return;
        // Client-side simulation
        const mockValues = { Revenue: 45000, ActiveUsers: 1200, Signups: 340, Visitors: 8900, MRR: 12000, prevMRR: 10500 };
        let result = formula;
        Object.entries(mockValues).forEach(([k, v]) => { result = result.replaceAll(k, v); });
        try { setPreview(eval(result).toFixed(2)); } // Safe for demo formulas
        catch { setPreview("Error in formula"); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name || !formula) return;
        setSaving(true);
        try {
            await computedMetricsApi.save(name, formula);
            toast("Computed metric created!");
            setName(""); setFormula(""); setPreview(null);
            fetchMetrics();
        } catch { toast("Failed to save metric", "error"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try {
            await computedMetricsApi.delete(id);
            toast("Metric deleted");
            fetchMetrics();
        } catch { toast("Failed to delete", "error"); }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-1">Computed Metrics</h1>
                    <p className="text-slate-400">Create custom metrics using mathematical formulas on top of your raw data.</p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8 mb-10">
                    {/* Create Form */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-7">
                        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                            <span className="text-2xl">🔢</span> New Formula
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Metric Name</label>
                                <input value={name} onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Conversion Rate"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Formula</label>
                                <textarea value={formula} onChange={e => setFormula(e.target.value)}
                                    rows={3} placeholder="e.g. Signups / Visitors * 100"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 font-mono text-sm" />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={handlePreview}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 font-medium py-2.5 rounded-xl transition text-sm">
                                    Preview
                                </button>
                                <button type="submit" disabled={saving || !name || !formula}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 font-semibold py-2.5 rounded-xl transition text-sm">
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                            {preview !== null && (
                                <div className="bg-slate-800 rounded-xl p-4 text-center">
                                    <div className="text-slate-400 text-xs mb-1">Preview Result</div>
                                    <div className="text-2xl font-bold text-cyan-400">{preview}</div>
                                </div>
                            )}
                        </form>

                        <div className="mt-6">
                            <div className="text-slate-500 text-xs mb-3 uppercase tracking-wide">Quick Templates</div>
                            {SAMPLE_FORMULAS.map(f => (
                                <button key={f.name} onClick={() => { setName(f.name); setFormula(f.formula); setPreview(null); }}
                                    className="w-full text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-2 transition">
                                    <div className="text-sm font-medium text-white">{f.name}</div>
                                    <div className="text-xs font-mono text-cyan-400/70 mt-0.5 truncate">{f.formula}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Metrics list */}
                    <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-7">
                        <h2 className="text-lg font-semibold mb-5">Saved Formulas ({metrics.length})</h2>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : metrics.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                                <div className="text-5xl mb-3">🔢</div>
                                <p className="text-lg font-medium">No computed metrics yet</p>
                                <p className="text-sm mt-1">Use the form to create your first formula</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {metrics.map(m => (
                                    <div key={m.id} className="flex items-center gap-4 bg-slate-800/40 border border-slate-700 rounded-xl px-5 py-4 hover:border-slate-600 transition group">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-white">{m.metricName}</div>
                                            <div className="text-xs font-mono text-cyan-400/80 mt-0.5 truncate">{m.formula}</div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">Custom</div>
                                        </div>
                                        <button onClick={() => handleDelete(m.id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm transition ml-2">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
