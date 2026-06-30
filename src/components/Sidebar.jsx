import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { anomalyApi } from "../services/dataSourceApi";

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [anomalyCount, setAnomalyCount] = useState(0);
    const workspaceName = localStorage.getItem("workspaceName") || "Analytics";
    const ownerName = localStorage.getItem("ownerName") || "User";

    useEffect(() => {
        anomalyApi.stats().then(res => {
            setAnomalyCount(res.data.last24h || 0);
        }).catch(() => {});
    }, []);

    const menuItems = [
        { title: "Dashboard",     path: "/dashboard",  icon: "📊" },
        { title: "Data Sources",  path: "/datasources", icon: "📡" },
        { title: "Reports",       path: "/reports",     icon: "📄" },
        { title: "Builder",       path: "/builder",     icon: "🧩" },
        { title: "Embed Config",  path: "/embed",       icon: "🔗" },
        {
            title: "Anomalies",
            path: "/anomalies",
            icon: "🔴",
            badge: anomalyCount > 0 ? anomalyCount : null,
        },
        { title: "Tenants",       path: "/tenants",     icon: "🏢" },
        { title: "Settings",      path: "/settings",    icon: "⚙️" },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-lg">
                        📊
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white leading-tight">{workspaceName}</h1>
                        <p className="text-xs text-slate-500">{ownerName}</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <div className="p-3 flex-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all ${
                            location.pathname === item.path
                                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-base">{item.icon}</span>
                            <span className="text-sm font-medium">{item.title}</span>
                        </div>
                        {item.badge && (
                            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                {item.badge}
                            </span>
                        )}
                    </Link>
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