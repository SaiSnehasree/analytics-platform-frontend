import { useState, useEffect } from "react";
import { anomalyApi } from "../services/dataSourceApi";

export default function AnomalyHistoryPage() {
    const [anomalies, setAnomalies] = useState([]);
    const [stats, setStats] = useState({ total: 0, last24h: 0 });
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);

    useEffect(() => {
        fetchAnomalies();
        fetchStats();
    }, [page]);

    const fetchAnomalies = async () => {
        setLoading(true);
        try {
            const res = await anomalyApi.list(page, 20);
            setAnomalies(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await anomalyApi.stats();
            setStats(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const formatNumber = (val, decimals = 2) => {
        if (val === null || val === undefined || isNaN(val)) return "—";
        return Number(val).toFixed(decimals);
    };

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case "CRITICAL": return "text-red-400 border-red-500/30 bg-red-500/10";
            case "HIGH":     return "text-orange-400 border-orange-500/30 bg-orange-500/10";
            case "MEDIUM":   return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
            default:         return "text-slate-400 border-slate-700";
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Anomaly History</h1>
                <p className="text-slate-400 mb-8">Review all metric alerts triggered by EWMA baseline variance analysis.</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-5 mb-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                        <p className="text-slate-400 text-sm">Total Detected Anomalies</p>
                        <h2 className="text-4xl font-bold mt-2 text-cyan-400">{stats.total}</h2>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                        <p className="text-slate-400 text-sm">Anomalies (Last 24h)</p>
                        <h2 className="text-4xl font-bold mt-2 text-red-400">{stats.last24h}</h2>
                    </div>
                </div>

                {/* List Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    {loading ? (
                        <p className="text-slate-500 text-sm">Loading anomalies...</p>
                    ) : anomalies.length === 0 ? (
                        <p className="text-slate-600 text-sm">No anomalies detected yet.</p>
                    ) : (
                        <div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 text-left">
                                            <th className="py-3 px-4">Metric</th>
                                            <th className="py-3 px-4">Observed Value</th>
                                            <th className="py-3 px-4">Expected Value</th>
                                            <th className="py-3 px-4">Z-Score</th>
                                            <th className="py-3 px-4">Severity</th>
                                            <th className="py-3 px-4">Detected At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {anomalies.map(anom => (
                                            <tr key={anom.id} className="border-b border-slate-800/50 hover:bg-slate-800/10">
                                                <td className="py-3 px-4 font-semibold">{anom.metricName}</td>
                                                <td className="py-3 px-4 font-mono text-xs">{formatNumber(anom.metricValue, 4)}</td>
                                                <td className="py-3 px-4 font-mono text-xs text-slate-400">{formatNumber(anom.expectedValue, 4)}</td>
                                                <td className="py-3 px-4 font-mono text-xs text-slate-400">{formatNumber(anom.zScore ?? anom.zscore, 2)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getSeverityStyle(anom.severity)}`}>
                                                        {anom.severity}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-xs text-slate-500">
                                                    {anom.detectedAt ? new Date(anom.detectedAt).toLocaleString() : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-6">
                                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                                    className="bg-slate-800 hover:bg-slate-700 text-sm font-semibold py-2 px-4 rounded-xl transition disabled:opacity-50">
                                    Previous
                                </button>
                                <span className="text-slate-500 text-xs">Page {page + 1}</span>
                                <button disabled={anomalies.length < 20} onClick={() => setPage(p => p + 1)}
                                    className="bg-slate-800 hover:bg-slate-700 text-sm font-semibold py-2 px-4 rounded-xl transition disabled:opacity-50">
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
