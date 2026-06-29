import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
    const location = useLocation();

    const menuItems = [
        {
            title: "Dashboard",
            path: "/dashboard",
            icon: "📊",
        },
        {
            title: "Tenants",
            path: "/tenants",
            icon: "🏢",
        },
        {
            title: "Reports",
            path: "/reports",
            icon: "📄",
        },
        {
            title: "Settings",
            path: "/settings",
            icon: "⚙️",
        },
    ];

    return (
        <div className="w-64 min-h-screen bg-slate-900 border-r border-slate-800">

            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold text-white">
                    Analytics Platform
                </h1>
            </div>

            <div className="p-4">

                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 p-4 rounded-xl mb-2 transition ${
                            location.pathname === item.path
                                ? "bg-cyan-600 text-white"
                                : "text-slate-300 hover:bg-slate-800"
                        }`}
                    >
                        <span>{item.icon}</span>
                        <span>{item.title}</span>
                    </Link>
                ))}

            </div>



        </div>
    );
}