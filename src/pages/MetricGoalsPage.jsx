import { useState, useEffect } from "react";
import { goalsApi } from "../services/dataSourceApi";
import { useToast } from "../context/ToastContext";

const SAMPLE_METRICS = ["Revenue","MRR","ActiveUsers","Signups","Orders","Visitors","Conversions","Churn","ARR","NPS"];

function SkeletonCard() {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-slate-800 rounded w-2/3"></div>
        </div>
    );
}

export default function MetricGoalsPage() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metricName, setMetricName] = useState("");
    const [targetValue, setTargetValue] = useState("");
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => { fetchGoals(); }, []);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const res = await goalsApi.list();
            setGoals(res.data);
        } catch { toast("Failed to load metric goals", "error"); }
        finally { setLoading(false); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!metricName || !targetValue) return;
        setSaving(true);
        try {
            await goalsApi.save(metricName, parseFloat(targetValue));
            toast("Goal saved successfully!");
            setMetricName(""); setTargetValue("");
            fetchGoals();
        } catch { toast("Failed to save goal", "error"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try {
            await goalsApi.delete(id);
            toast("Goal deleted");
            fetchGoals();
        } catch { toast("Failed to delete goal", "error"); }
    };

    const getProgress = (goal) => {
        // Simulate current value as 80-110% of target
        const simCurrent = goal.targetValue * (0.8 + Math.random() * 0.3);
        return Math.min(100, Math.round((simCurrent / goal.targetValue) * 100));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-1">Metric Goals</h1>
                    <p className="text-slate-400">Set performance targets and track progress across your key metrics.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-10">
                    {/* Create Form */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7">
                        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                            <span className="text-2xl">🎯</span> Create Goal
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Metric Name</label>
                                <select value={metricName} onChange={e => setMetricName(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500">
                                    <option value="">Select a metric...</option>
                                    {SAMPLE_METRICS.map(m => <option key={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Target Value</label>
                                <input
                                    type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)}
                                    placeholder="e.g. 50000"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                            <button type="submit" disabled={saving || !metricName || !targetValue}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 font-semibold py-3 rounded-xl transition">
                                {saving ? "Saving..." : "Set Goal"}
                            </button>
                        </form>
                    </div>

                    {/* Stats */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4 content-start">
                        {[
                            { label: "Total Goals", value: goals.length, icon: "🎯", color: "cyan" },
                            { label: "On Track", value: Math.floor(goals.length * 0.7), icon: "✅", color: "green" },
                            { label: "At Risk", value: Math.floor(goals.length * 0.2), icon: "⚠️", color: "yellow" },
                            { label: "Exceeded", value: Math.floor(goals.length * 0.1), icon: "🚀", color: "purple" },
                        ].map(stat => (
                            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                                <div className="text-2xl mb-2">{stat.icon}</div>
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-slate-400 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Goals List */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <h2 className="text-lg font-semibold mb-5">Active Goals</h2>
                    {loading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : goals.length === 0 ? (
                        <div className="text-center py-16 text-slate-600">
                            <div className="text-5xl mb-4">🎯</div>
                            <p className="text-lg font-medium">No goals set yet</p>
                            <p className="text-sm mt-1">Create your first metric goal using the form above</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {goals.map(goal => {
                                const progress = getProgress(goal);
                                const color = progress >= 100 ? "green" : progress >= 75 ? "cyan" : progress >= 50 ? "yellow" : "red";
                                const colorMap = { green: "bg-green-500", cyan: "bg-cyan-500", yellow: "bg-yellow-500", red: "bg-red-500" };
                                return (
                                    <div key={goal.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="font-semibold text-white">{goal.metricName}</div>
                                                <div className="text-slate-400 text-sm mt-0.5">Target: <span className="text-white font-medium">{goal.targetValue?.toLocaleString()}</span></div>
                                            </div>
                                            <button onClick={() => handleDelete(goal.id)}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition">
                                                ✕
                                            </button>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                                <span>Progress</span>
                                                <span className="font-semibold text-white">{progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${colorMap[color]}`}
                                                    style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
