import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { anomalyApi } from "../services/dataSourceApi";

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [anomalyCount, setAnomalyCount] = useState(0);
    const workspaceName = localStorage.getItem("workspaceName") || "Analytics";
    const ownerName = localStorage.getItem("ownerName") || "User";
    const role = localStorage.getItem("role") || "ADMIN";

    useEffect(() => {
        anomalyApi.stats().then(res => {
            setAnomalyCount(res.data.last24h || 0);
        }).catch(() => {});
    }, []);

    const menuSections = [
        {
            label: "Core",
            items: [
                { title: "Dashboard",    path: "/dashboard",   icon: "📊" },
                { title: "Data Sources", path: "/datasources", icon: "📡" },
                { title: "Reports",      path: "/reports",     icon: "📄" },
                { title: "Builder",      path: "/builder",     icon: "🧩" },
            ]
        },
        {
            label: "Analytics",
            items: [
                { title: "Metric Goals",    path: "/goals",            icon: "🎯" },
                { title: "Computed Metrics",path: "/computed-metrics",  icon: "🔢" },
                { title: "Anomalies",       path: "/anomalies",         icon: "🔴", badge: anomalyCount > 0 ? anomalyCount : null },
            ]
        },
        {
            label: "Platform",
            items: [
                { title: "Embed Config", path: "/embed",     icon: "🔗" },
                { title: "API Keys",     path: "/api-keys",  icon: "🔑" },
                { title: "Workspace",    path: "/workspace", icon: "🏢" },
                { title: "Settings",     path: "/settings",  icon: "⚙️" },
            ]
        }
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-cyan-500/30">
                        ⚡
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white leading-tight">{workspaceName}</h1>
                        <p className="text-xs text-slate-500">{ownerName}</p>
                    </div>
                </div>
                {/* Role badge */}
                <div className="mt-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        role === "ADMIN"   ? "text-purple-300 border-purple-500/30 bg-purple-500/10" :
                        role === "MANAGER" ? "text-cyan-300 border-cyan-500/30 bg-cyan-500/10" :
                        role === "ANALYST" ? "text-green-300 border-green-500/30 bg-green-500/10" :
                                             "text-slate-400 border-slate-600 bg-slate-800"
                    }`}>
                        {role}
                    </span>
                </div>
            </div>

            {/* Nav */}
            <div className="p-3 flex-1 overflow-y-auto">
                {menuSections.map(section => (
                    <div key={section.label} className="mb-4">
                        <div className="text-[10px] text-slate-600 uppercase tracking-widest px-3 mb-2 font-semibold">
                            {section.label}
                        </div>
                        {section.items.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all ${
                                    isActive(item.path)
                                        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-base">{item.icon}</span>
                                    <span className="text-sm font-medium">{item.title}</span>
                                </div>
                                {item.badge && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                ))}
            </div>

            {/* Logout */}
            <div className="p-3 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium"
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}