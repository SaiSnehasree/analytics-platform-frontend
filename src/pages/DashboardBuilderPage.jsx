import { useState, useEffect, useCallback } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import api from "../services/api";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";
const WIDGET_TYPES = [
    { type: "KPI_CARD",   label: "KPI Card",    icon: "🔢" },
    { type: "LINE_CHART", label: "Line Chart",  icon: "📈" },
    { type: "BAR_CHART",  label: "Bar Chart",   icon: "📊" },
    { type: "DATA_TABLE", label: "Data Table",  icon: "📋" },
];

const DEFAULT_COLORS = { KPI_CARD: "#06b6d4", LINE_CHART: "#06b6d4", BAR_CHART: "#8b5cf6", DATA_TABLE: "#10b981" };

export default function DashboardBuilderPage() {
    const [widgets, setWidgets] = useState([]);
    const [layout, setLayout] = useState([]);
    const [saved, setSaved] = useState(false);
    const [locked, setLocked] = useState(false);
    const [stats, setStats] = useState({
        reportsGenerated: 0,
        activeDataSources: 0,
        totalMetrics: 0,
        anomaliesLast24h: 0,
    });
    useEffect(() => {
        loadLayout();

        api.get("/dashboard/stats")
            .then((res) => setStats(res.data))
            .catch(console.error);

    }, []);
    const loadLayout = async () => {
        try {
            const res = await api.get("/dashboard/layout");
            const stored = JSON.parse(res.data.layoutJson || "[]");
            if (Array.isArray(stored) && stored.length > 0) {
                setWidgets(stored);
                setLayout(stored.map(w => w.gridItem));
            }
        } catch (e) { console.error(e); }
    };

    const addWidget = (type) => {
        const id = `w_${Date.now()}`;
        const newWidget = {
            id,
            type,
            title: WIDGET_TYPES.find(t => t.type === type)?.label || type,
            color: DEFAULT_COLORS[type],
            gridItem: { i: id, x: (widgets.length * 2) % 12, y: 0, w: 3, h: 2 },
        };
        setWidgets(prev => [...prev, newWidget]);
        setLayout(prev => [...prev, newWidget.gridItem]);
    };

    const removeWidget = (id) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
        setLayout(prev => prev.filter(l => l.i !== id));
    };

    const onLayoutChange = useCallback((newLayout) => {
        setLayout(newLayout);
        setWidgets(prev => prev.map(w => ({
            ...w,
            gridItem: newLayout.find(l => l.i === w.id) || w.gridItem,
        })));
    }, []);

    const saveLayout = async () => {
        const payload = widgets.map(w => ({
            ...w,
            gridItem: layout.find(l => l.i === w.id) || w.gridItem,
        }));
        try {
            await api.post("/dashboard/layout", { layoutJson: JSON.stringify(payload) });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) { console.error(e); }
    };

    const renderWidgetContent = (widget) => {
        const style = { color: widget.color };

        const lineData = [
            { month: "Jan", value: 1200 },
            { month: "Feb", value: 1800 },
            { month: "Mar", value: 2400 },
            { month: "Apr", value: 3000 },
            { month: "May", value: 3800 },
            { month: "Jun", value: 4500 },
        ];

        const barData = [
            { region: "North", sales: 5200 },
            { region: "South", sales: 7400 },
            { region: "East", sales: 4300 },
            { region: "West", sales: 6100 },
        ];

        switch (widget.type) {

            case "KPI_CARD":
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-slate-400 text-xs">{widget.title}</p>

                        <p
                            className="text-4xl font-bold mt-2"
                            style={style}
                        >
                            {stats.reportsGenerated}
                        </p>

                        <p className="text-green-400 text-xs mt-2">
                            Live Backend Data
                        </p>
                    </div>
                );

            case "LINE_CHART":
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineData}>
                            <CartesianGrid stroke="#334155" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#06b6d4"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case "BAR_CHART":
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid stroke="#334155" />
                            <XAxis dataKey="region" />
                            <YAxis />
                            <Tooltip />
                            <Bar
                                dataKey="sales"
                                fill="#8b5cf6"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case "DATA_TABLE":
                return (
                    <div className="overflow-auto">
                        <table className="w-full text-xs text-slate-300">
                            <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left py-2">Product</th>
                                <th className="text-right py-2">Sales</th>
                            </tr>
                            </thead>

                            <tbody>
                            <tr>
                                <td className="py-2">Laptop</td>
                                <td className="text-right">520</td>
                            </tr>

                            <tr>
                                <td className="py-2">Mobile</td>
                                <td className="text-right">780</td>
                            </tr>

                            <tr>
                                <td className="py-2">Tablet</td>
                                <td className="text-right">340</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard Builder</h1>
                        <p className="text-slate-400 mt-1">Drag, resize, and arrange your dashboard widgets.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setLocked(!locked)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${locked ? "border-yellow-500/40 text-yellow-400 bg-yellow-500/10" : "border-slate-700 text-slate-400 hover:text-white"}`}>
                            {locked ? "🔒 Locked" : "🔓 Editing"}
                        </button>
                        <button onClick={saveLayout}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition">
                            {saved ? "✅ Saved!" : "💾 Save Layout"}
                        </button>
                    </div>
                </div>

                {/* Widget toolbar */}
                <div className="flex items-center gap-3 mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <span className="text-slate-400 text-sm font-medium mr-2">Add Widget:</span>
                    {WIDGET_TYPES.map(t => (
                        <button key={t.type} onClick={() => addWidget(t.type)} disabled={locked}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl text-sm transition">
                            <span>{t.icon}</span>
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 min-h-[500px]">
                    {widgets.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-slate-700">
                            <div className="text-center">
                                <p className="text-4xl mb-3">🧩</p>
                                <p>Click "Add Widget" above to start building your dashboard</p>
                            </div>
                        </div>
                    ) : (
                        <GridLayout
                            className="layout"
                            layout={layout}
                            cols={12}
                            rowHeight={120}
                            width={1100}
                            onLayoutChange={onLayoutChange}
                            isDraggable={!locked}
                            isResizable={!locked}
                            draggableHandle=".drag-handle"
                        >
                            {widgets.map(widget => (
                                <div key={widget.id}
                                    className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition">
                                    <div className="drag-handle flex items-center justify-between px-3 py-2 border-b border-slate-700 cursor-grab active:cursor-grabbing">
                                        <span className="text-xs text-slate-400 font-medium">{widget.title}</span>
                                        {!locked && (
                                            <button onClick={() => removeWidget(widget.id)}
                                                className="text-slate-600 hover:text-red-400 transition text-xs">✕</button>
                                        )}
                                    </div>
                                    <div className="h-full p-3">
                                        {renderWidgetContent(widget)}
                                    </div>
                                </div>
                            ))}
                        </GridLayout>
                    )}
                </div>
            </div>
        </div>
    );
}
