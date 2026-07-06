import { useEffect, useState } from "react";
import api from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    LineChart, Line, CartesianGrid,
} from "recharts";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        reportsGenerated: 0,
        activeDataSources: 0,
        totalMetrics: 0,
        anomaliesLast24h: 0,
    });
    const [realtimeData, setRealtimeData] = useState([]);
    const { latestMetric, latestAnomaly, isConnected } = useWebSocket();

    useEffect(() => {
        api.get("/dashboard/stats")
            .then(res => setStats(res.data))
            .catch(console.error);
    }, []);

    // Append incoming real-time metric to chart (keep last 30 points)
    useEffect(() => {
        if (latestMetric) {
            setRealtimeData(prev => [
                ...prev.slice(-29),
                {
                    name: latestMetric.metricName,
                    value: latestMetric.metricValue,
                    time: new Date(latestMetric.recordedAt).toLocaleTimeString(),
                },
            ]);
        }
    }, [latestMetric]);

    const workspaceName = localStorage.getItem("workspaceName") || "Your Workspace";

    const kpiCards = [
        { label: "Reports",       value: stats.reportsGenerated,  color: "cyan",   icon: "📄" },
        { label: "Data Sources",  value: stats.activeDataSources, color: "green",  icon: "📡" },
        { label: "Total Metrics", value: stats.totalMetrics,      color: "purple", icon: "📈" },
        { label: "Anomalies 24h", value: stats.anomaliesLast24h,  color: "red",    icon: "🔴" },
    ];

    const colorMap = {
        cyan:   { text: "text-cyan-400",   border: "border-cyan-500/20" },
        green:  { text: "text-green-400",  border: "border-green-500/20" },
        purple: { text: "text-purple-400", border: "border-purple-500/20" },
        red:    { text: "text-red-400",    border: "border-red-500/20" },
    };

    return (
        <div className="bg-slate-950 text-white min-h-screen">
            {/* Top bar */}
            <div className="border-b border-slate-800 bg-slate-900 px-8 py-4 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-white">{workspaceName}</h2>
                    <p className="text-xs text-slate-500">Real-time Analytics Dashboard</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                        isConnected
                            ? "text-green-400 border-green-500/30 bg-green-500/10"
                            : "text-slate-500 border-slate-700 bg-slate-800"
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-slate-600"}`}/>
                        {isConnected ? "Live" : "Online"}
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8">
                {/* Hero banner */}
                <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-700 rounded-3xl p-8 mb-8 shadow-2xl">
                    <h1 className="text-4xl font-bold mb-2">Welcome Back 👋</h1>
                    <p className="text-slate-100">
                        Monitor your analytics, track anomalies, and visualize metrics in real time.
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {kpiCards.map((card) => (
                        <div
                            key={card.label}
                            className={`bg-slate-900 rounded-3xl p-6 border ${colorMap[card.color].border} hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-slate-400 text-sm">{card.label}</p>
                                <span className="text-xl">{card.icon}</span>
                            </div>
                            <h2 className={`text-5xl font-bold ${colorMap[card.color].text}`}>
                                {card.value}
                            </h2>
                        </div>
                    ))}
                </div>

                {/* Charts row */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Real-time line chart */}
                    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Live Metric Stream</h2>
                            {latestMetric && (
                                <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-full">
                                    {latestMetric.metricName}: {latestMetric.metricValue?.toFixed(2)}
                                </span>
                            )}
                        </div>
                        <div className="h-64">
                            {realtimeData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={realtimeData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} />
                                        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                                        <Tooltip
                                            contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                                            labelStyle={{ color: "#94a3b8" }}
                                        />
                                        <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                                    Waiting for real-time data...
                                    <br/>
                                    <span className="text-xs mt-1">Connect a data source or send a webhook</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* System health panel */}
                    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
                        <h2 className="text-lg font-semibold mb-6">System Health</h2>
                        <div className="space-y-4">
                            {[
                                { label: "Database", value: "Online", color: "text-green-400" },
                                { label: "Backend API", value: "Running", color: "text-green-400" },
                                { label: "WebSocket", value: isConnected ? "Connected" : "Disconnected",
                                  color: isConnected ? "text-green-400" : "text-red-400" },
                                { label: "Anomaly Detector", value: "Active", color: "text-cyan-400" },
                                { label: "Mail Service", value: "Configured", color: "text-yellow-400" },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                                    <span className="text-slate-400 text-sm">{item.label}</span>
                                    <span className={`font-semibold text-sm ${item.color}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Anomaly alert */}
                        {latestAnomaly && (
                            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                                <p className="text-red-400 text-xs font-semibold">⚠ Anomaly Detected</p>
                                <p className="text-red-300 text-xs mt-1">
                                    {latestAnomaly.metricName}: {latestAnomaly.metricValue?.toFixed(2)}
                                    {" "}({latestAnomaly.severity})
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
