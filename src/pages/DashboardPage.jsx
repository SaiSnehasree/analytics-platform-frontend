import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { useToast } from "../context/ToastContext";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";

// ─── KPI Card component ──────────────────────────────────────────────────────
function MetricCard({ label, value, description, icon }) {
    return (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all duration-200">
            <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
                <span className="text-lg text-slate-500">{icon}</span>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
                {typeof value === "number" && value > 9999 ? (value / 1000).toFixed(1) + "k" : value ?? "—"}
            </div>
            {description && <p className="text-slate-500 text-xs mt-1.5">{description}</p>}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [realtimeData, setRealtimeData] = useState([]);
    const { latestMetric, isConnected } = useWebSocket();
    const toast = useToast();

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/dashboard/summary");
            setSummary(res.data);
        } catch {
            toast("Failed to load dashboard summary data", "error");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    // WebSocket real-time metric updates
    useEffect(() => {
        if (latestMetric) {
            setRealtimeData(prev => [
                ...prev.slice(-19),
                {
                    time: new Date(latestMetric.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                    value: latestMetric.metricValue,
                    name: latestMetric.metricName
                }
            ]);
        }
    }, [latestMetric]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="h-8 bg-slate-900 rounded-lg w-1/4 animate-pulse" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-28 bg-slate-900 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-72 bg-slate-900 rounded-3xl animate-pulse" />
                        <div className="h-72 bg-slate-900 rounded-3xl animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const {
        workspaceName = "Workspace",
        metricsCount = 0,
        dataSourcesCount = 0,
        reportsCount = 0,
        anomalyCount = 0,
        goalsCount = 0,
        embedsCount = 0,
        computedMetricsCount = 0,
        recentActivities = [],
        chartData = []
    } = summary || {};

    // Dynamically find all metric names inside the chart data to plot them
    const metricsToPlot = chartData.length > 0
        ? Object.keys(chartData[0]).filter(k => k !== "date")
        : [];

    const colors = ["#06b6d4", "#a78bfa", "#10b981", "#f59e0b", "#ec4899"];

    return (
        <div className="bg-slate-950 text-white min-h-screen">
            {/* Top Bar */}
            <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">{workspaceName}</h2>
                    <p className="text-xs text-slate-500">Workspace Executive Summary</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${isConnected ? "text-green-400 border-green-500/20 bg-green-500/5" : "text-slate-500 border-slate-800 bg-slate-900"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-slate-600"}`} />
                        {isConnected ? "Live Feed Active" : "WebSocket Offline"}
                    </span>
                    <button onClick={fetchSummary} className="text-xs text-slate-400 hover:text-white border border-slate-800 bg-slate-900 px-3.5 py-1.5 rounded-xl transition">
                        ↻ Refresh
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8 space-y-6">
                {/* Stat cards grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard label="Total Ingested Metrics" value={metricsCount} description="All recorded values" icon="📈" />
                    <MetricCard label="Active Data Sources" value={dataSourcesCount} description="Connected streams" icon="📡" />
                    <MetricCard label="Generated Reports" value={reportsCount} description="Weekly & monthly digests" icon="📄" />
                    <MetricCard label="Anomalies Tracked" value={anomalyCount} description="Detected deviations" icon="🚨" />
                </div>

                {/* Second row of smaller KPIs */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl px-5 py-3 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Metric Goals</span>
                        <span className="text-sm font-semibold text-white">{goalsCount}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl px-5 py-3 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Computed Metrics</span>
                        <span className="text-sm font-semibold text-white">{computedMetricsCount}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl px-5 py-3 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Embed Configurations</span>
                        <span className="text-sm font-semibold text-white">{embedsCount}</span>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Dynamic Historical Metrics Chart */}
                    <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-base font-semibold text-white">Historical Trends</h3>
                                <p className="text-xs text-slate-500">Average metric values over the last 7 days</p>
                            </div>
                            <div className="flex gap-2">
                                {metricsToPlot.map((m, idx) => (
                                    <span key={m} className="text-[10px] px-2 py-0.5 rounded-full border border-slate-800 text-slate-300 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="h-64">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#64748b" }} />
                                        <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
                                        <Tooltip
                                            contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                                            labelStyle={{ color: "#94a3b8" }}
                                        />
                                        {metricsToPlot.map((metric, idx) => (
                                            <Area
                                                key={metric}
                                                type="monotone"
                                                dataKey={metric}
                                                stroke={colors[idx % colors.length]}
                                                fillOpacity={0.03}
                                                fill={colors[idx % colors.length]}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                                    <span className="text-4xl">📊</span>
                                    <p className="text-sm font-medium">No analytics data available</p>
                                    <p className="text-xs text-slate-700">Connect a data source to begin graphing trends</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Live Stream Panel */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-base font-semibold text-white">Live Activity Ingestion</h3>
                            <p className="text-xs text-slate-500">Real-time metrics stream incoming via WebSocket</p>
                        </div>
                        <div className="flex-1 min-h-[200px] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4">
                            {realtimeData.length > 0 ? (
                                <div className="w-full space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                    {realtimeData.map((d, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 px-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono">
                                            <span className="text-cyan-400 truncate max-w-[120px]">{d.name}</span>
                                            <span className="text-white font-bold">{d.value?.toFixed(2)}</span>
                                            <span className="text-slate-500 text-[10px]">{d.time}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-slate-600 space-y-2">
                                    <div className="text-3xl animate-pulse">⚡</div>
                                    <p className="text-xs">Awaiting live events...</p>
                                    <p className="text-[10px] text-slate-700 max-w-[180px]">Webhook posts or spreadsheet updates stream live here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ingestion & Activity Logs */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
                    <h3 className="text-base font-semibold text-white mb-4">Workspace Activity Feed</h3>
                    {recentActivities.length > 0 ? (
                        <div className="space-y-3.5">
                            {recentActivities.map((act) => (
                                <div key={act.id} className="flex items-start justify-between py-2 border-b border-slate-800/50 last:border-0">
                                    <div className="flex gap-3">
                                        <span className="text-base mt-0.5">
                                            {act.type === "METRIC" ? "📈" : "🚨"}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{act.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{act.message}</p>
                                        </div>
                                    </div>
                                    <span className="text-slate-500 text-[10px] whitespace-nowrap ml-4">
                                        {new Date(act.time).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-600 space-y-2">
                            <span className="text-4xl">📋</span>
                            <p className="text-sm">No activity recorded yet</p>
                            <p className="text-xs text-slate-700">Activities automatically populate as metrics are received or alerts fire</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
