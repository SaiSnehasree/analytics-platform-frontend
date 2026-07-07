import { useState, useEffect, useCallback } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar,
    AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

// ─── Widget catalogue ────────────────────────────────────────────────────────
const WIDGET_CATALOGUE = [
    { type: "KPI_CARD",    label: "KPI Card",       icon: "🔢", w: 3, h: 2 },
    { type: "TREND_LINE",  label: "Trend Line",     icon: "📈", w: 4, h: 3 },
    { type: "BAR_CHART",   label: "Bar Chart",      icon: "📊", w: 4, h: 3 },
    { type: "ANOMALIES",   label: "Anomaly Feed",   icon: "🚨", w: 3, h: 3 },
    { type: "GOALS",       label: "Goals Progress", icon: "🎯", w: 4, h: 3 },
    { type: "ACTIVITY",    label: "Activity Feed",  icon: "⚡", w: 3, h: 3 },
    { type: "REPORTS",     label: "Reports Summary",icon: "📄", w: 3, h: 2 },
    { type: "SOURCES",     label: "Data Sources",   icon: "📡", w: 3, h: 2 },
];

// ─── Tooltip style ───────────────────────────────────────────────────────────
const tooltipStyle = { contentStyle: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }, labelStyle: { color: "#94a3b8" } };

// ─── Individual widget renderer ──────────────────────────────────────────────
function WidgetContent({ type, metrics, recentMetrics, stats }) {
    const metricNames = Object.keys(metrics);

    switch (type) {
        case "KPI_CARD": {
            const name = metricNames[0] || "Metric";
            const vals = metrics[name] || [];
            const latest = vals.at(-1)?.value ?? 0;
            const prev   = vals.at(-3)?.value ?? latest;
            const change = prev > 0 ? ((latest - prev) / prev * 100).toFixed(1) : 0;
            const up = change >= 0;
            return (
                <div className="flex flex-col items-center justify-center h-full text-center px-2">
                    <p className="text-slate-400 text-xs mb-1 truncate w-full">{name}</p>
                    <p className="text-4xl font-bold text-white">{latest > 1000 ? (latest / 1000).toFixed(1) + "k" : latest.toFixed(0)}</p>
                    <span className={`text-xs mt-2 px-2 py-0.5 rounded-full ${up ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>
                        {up ? "▲" : "▼"} {Math.abs(change)}%
                    </span>
                </div>
            );
        }
        case "TREND_LINE": {
            const name = metricNames[0] || "Metric";
            const data = (metrics[name] || []).map(d => ({ time: new Date(d.time).toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: d.value }));
            return data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1e293b" />
                        <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
                        <Tooltip {...tooltipStyle} />
                        <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fill="url(#trendGrad)" dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            ) : <Empty text="No metric data" />;
        }
        case "BAR_CHART": {
            const data = metricNames.slice(0, 5).map(name => {
                const vals = metrics[name] || [];
                const avg = vals.reduce((s, d) => s + d.value, 0) / (vals.length || 1);
                return { name: name.slice(0, 8), value: Math.round(avg) };
            });
            return data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid stroke="#1e293b" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[4,4,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : <Empty text="No metric data" />;
        }
        case "ANOMALIES": {
            const items = stats?.recentAnomalies || [];
            const sc = { CRITICAL: "text-red-400", HIGH: "text-orange-400", MEDIUM: "text-yellow-400" };
            return items.length > 0 ? (
                <div className="overflow-y-auto h-full">
                    {items.map((a, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                            <span className="text-xs text-white truncate">{a.metricName}</span>
                            <span className={`text-xs font-bold ${sc[a.severity] || "text-slate-400"}`}>{a.severity}</span>
                        </div>
                    ))}
                </div>
            ) : <Empty text="No anomalies" icon="✅" />;
        }
        case "GOALS": {
            const goals = stats?.goalsProgress || [];
            return goals.length > 0 ? (
                <div className="overflow-y-auto h-full space-y-2">
                    {goals.map((g, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span className="text-white">{g.metricName}</span>
                                <span>{Math.round(g.progress)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${g.progress >= 100 ? "bg-green-500" : g.progress >= 70 ? "bg-cyan-500" : "bg-yellow-500"}`}
                                    style={{ width: `${Math.min(100, g.progress)}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : <Empty text="No goals set" />;
        }
        case "ACTIVITY": {
            const points = recentMetrics.slice(-8).map(d => ({
                time: new Date(d.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                value: d.value,
            }));
            return points.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={points}>
                        <XAxis dataKey="time" tick={{ fontSize: 8, fill: "#64748b" }} />
                        <Tooltip {...tooltipStyle} />
                        <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            ) : <Empty text="No live activity yet" />;
        }
        case "REPORTS": {
            const count = stats?.reportsGenerated ?? "—";
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-4xl mb-1">📄</span>
                    <span className="text-3xl font-bold text-white">{count}</span>
                    <span className="text-slate-400 text-xs mt-1">Reports created</span>
                </div>
            );
        }
        case "SOURCES": {
            const count = stats?.activeDataSources ?? "—";
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-4xl mb-1">📡</span>
                    <span className="text-3xl font-bold text-white">{count}</span>
                    <span className="text-slate-400 text-xs mt-1">Active sources</span>
                </div>
            );
        }
        default: return null;
    }
}

function Empty({ text, icon = "📭" }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
            <span className="text-3xl">{icon}</span>
            <span className="text-xs">{text}</span>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function DashboardBuilderPage() {
    const [widgets, setWidgets] = useState([]);
    const [layout, setLayout] = useState([]);
    const [locked, setLocked] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedFlash, setSavedFlash] = useState(false);
    const [stats, setStats] = useState(null);
    const [metrics, setMetrics] = useState({});        // { metricName: [{time, value}] }
    const [recentMetrics, setRecentMetrics] = useState([]);
    const [containerWidth, setContainerWidth] = useState(1100);
    const toast = useToast();

    useEffect(() => {
        loadLayout();
        fetchData();
        // measure grid container width
        const el = document.getElementById("grid-container");
        if (el) setContainerWidth(el.clientWidth - 32);
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, recentRes] = await Promise.all([
                api.get("/dashboard/stats"),
                api.get("/dashboard/metrics/recent?days=7"),
            ]);
            setStats(statsRes.data);
            setRecentMetrics(recentRes.data || []);

            // Build metrics map: { metricName: [{time, value}] }
            const names = statsRes.data?.availableMetrics || [];
            const metricsMap = {};
            await Promise.all(names.slice(0, 5).map(async name => {
                try {
                    const r = await api.get(`/dashboard/metrics/${encodeURIComponent(name)}/history?days=14`);
                    metricsMap[name] = r.data;
                } catch { /* no data for this metric */ }
            }));
            setMetrics(metricsMap);
        } catch (e) { console.error(e); }
    };

    const loadLayout = async () => {
        try {
            const res = await api.get("/dashboard-builder/layout");
            const stored = JSON.parse(res.data.layoutJson || "[]");
            if (Array.isArray(stored) && stored.length > 0) {
                setWidgets(stored);
                setLayout(stored.map(w => w.gridItem));
            }
        } catch (e) { console.error(e); }
    };

    const addWidget = useCallback((catalogueItem) => {
        const id = `w_${Date.now()}`;
        const cols = 12;
        const existingX = widgets.length * catalogueItem.w;
        const newWidget = {
            id,
            type: catalogueItem.type,
            title: catalogueItem.label,
            gridItem: { i: id, x: existingX % cols, y: Infinity, w: catalogueItem.w, h: catalogueItem.h },
        };
        setWidgets(prev => [...prev, newWidget]);
        setLayout(prev => [...prev, newWidget.gridItem]);
    }, [widgets]);

    const removeWidget = useCallback((id) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
        setLayout(prev => prev.filter(l => l.i !== id));
    }, []);

    const onLayoutChange = useCallback((newLayout) => {
        setLayout(newLayout);
        setWidgets(prev => prev.map(w => ({
            ...w,
            gridItem: newLayout.find(l => l.i === w.id) || w.gridItem,
        })));
    }, []);

    const saveLayout = async () => {
        setSaving(true);
        const payload = widgets.map(w => ({
            ...w,
            gridItem: layout.find(l => l.i === w.id) || w.gridItem,
        }));
        try {
            await api.post("/dashboard-builder/save", { layoutJson: JSON.stringify(payload) });
            setSavedFlash(true);
            toast("Layout saved!");
            setTimeout(() => setSavedFlash(false), 2500);
        } catch { toast("Failed to save layout", "error"); }
        finally { setSaving(false); }
    };

    const clearLayout = () => {
        if (!confirm("Clear all widgets?")) return;
        setWidgets([]);
        setLayout([]);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard Builder</h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Drag · Resize · Rearrange · Save — your layout persists automatically.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={clearLayout} disabled={widgets.length === 0}
                            className="text-xs px-3 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition disabled:opacity-30">
                            Clear All
                        </button>
                        <button onClick={() => setLocked(l => !l)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${locked ? "border-yellow-500/40 text-yellow-400 bg-yellow-500/10" : "border-slate-700 text-slate-400 hover:text-white"}`}>
                            {locked ? "🔒 Locked" : "🔓 Editing"}
                        </button>
                        <button onClick={saveLayout} disabled={saving}
                            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${savedFlash ? "bg-green-600 text-white" : "bg-cyan-600 hover:bg-cyan-500 text-white"} disabled:opacity-50`}>
                            {saving ? "Saving..." : savedFlash ? "✅ Saved!" : "Save Layout"}
                        </button>
                    </div>
                </div>

                {/* Widget Toolbar */}
                <div className="flex items-center gap-2 mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-wrap">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide mr-2 flex-shrink-0">Add Widget:</span>
                    {WIDGET_CATALOGUE.map(cat => (
                        <button key={cat.type} onClick={() => !locked && addWidget(cat)} disabled={locked}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl text-xs text-white transition border border-slate-700 hover:border-slate-600">
                            <span>{cat.icon}</span> {cat.label}
                        </button>
                    ))}
                    <span className="ml-auto text-xs text-slate-600">{widgets.length} widget{widgets.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Grid Area */}
                <div id="grid-container" className="bg-slate-900 border border-slate-800 rounded-3xl p-4 min-h-[500px]">
                    {widgets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-80 text-slate-700">
                            <div className="text-5xl mb-4">🧩</div>
                            <p className="text-lg font-medium text-slate-500">Your canvas is empty</p>
                            <p className="text-sm text-slate-600 mt-1">Click any widget above to add it to your dashboard</p>
                        </div>
                    ) : (
                        <GridLayout
                            className="layout"
                            layout={layout}
                            cols={12}
                            rowHeight={80}
                            width={containerWidth}
                            onLayoutChange={onLayoutChange}
                            isDraggable={!locked}
                            isResizable={!locked}
                            draggableHandle=".drag-handle"
                            margin={[12, 12]}
                        >
                            {widgets.map(widget => (
                                <div key={widget.id}
                                    className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition-colors flex flex-col">
                                    {/* Drag handle */}
                                    <div className="drag-handle flex items-center justify-between px-3 py-2 border-b border-slate-700 cursor-grab active:cursor-grabbing bg-slate-800/80 flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-600 text-xs">⋮⋮</span>
                                            <span className="text-xs text-slate-400 font-medium">{widget.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={fetchData} className="text-slate-600 hover:text-cyan-400 transition text-xs" title="Refresh">↻</button>
                                            {!locked && (
                                                <button onClick={() => removeWidget(widget.id)}
                                                    className="text-slate-600 hover:text-red-400 transition text-xs" title="Remove">✕</button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Widget content */}
                                    <div className="flex-1 p-3 overflow-hidden">
                                        <WidgetContent type={widget.type} metrics={metrics} recentMetrics={recentMetrics} stats={stats} />
                                    </div>
                                </div>
                            ))}
                        </GridLayout>
                    )}
                </div>

                {/* Footer hint */}
                <p className="text-center text-slate-700 text-xs mt-4">
                    All widgets display your real tenant data. Layout is saved per workspace and persists across sessions.
                </p>
            </div>
        </div>
    );
}
