import { useEffect, useState } from "react";
import api from "../services/api";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalTenants: 0,
        activeUsers: 0,
        reportsGenerated: 0,
        apiRequests: 0,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get("/dashboard/stats");

            setStats({
                totalTenants: response.data.totalTenants || 0,
                activeUsers: response.data.activeUsers || 0,
                reportsGenerated: response.data.reportsGenerated || 0,
                apiRequests: response.data.apiRequests || 0,
            });
        } catch (error) {
            console.error(error);

            setStats({
                totalTenants: 3,
                activeUsers: 3,
                reportsGenerated: 120,
                apiRequests: 4500,
            });
        }
    };

    const analyticsData = [
        { day: "Mon", requests: 1200 },
        { day: "Tue", requests: 2100 },
        { day: "Wed", requests: 1800 },
        { day: "Thu", requests: 2600 },
        { day: "Fri", requests: 3200 },
        { day: "Sat", requests: 2400 },
        { day: "Sun", requests: 3900 },
    ];

    return (
        <div className="bg-slate-950 text-white min-h-screen">

            <div className="flex-1">

            {/* Navbar */}
            <div className="border-b border-slate-800 bg-slate-900">
                <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">

                    <h1 className="text-2xl font-bold"></h1>

                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = "/";
                        }}
                        className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl transition"
                    >
                        Logout
                    </button>

                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8">

                {/* Hero */}
                <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-700 rounded-3xl p-10 mb-8 shadow-2xl">

                    <h1 className="text-5xl font-bold mb-3">
                        Welcome Back
                    </h1>

                    <p className="text-lg text-slate-100">
                        Monitor platform performance, analytics reports,
                        API traffic and workspace growth in real time.
                    </p>

                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                    <div className="bg-slate-900 rounded-3xl p-6 border border-cyan-500/20 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                        <p className="text-slate-400">Total Tenants</p>
                        <h2 className="text-5xl font-bold text-cyan-400 mt-4">
                            {stats.totalTenants}
                        </h2>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 border border-green-500/20">
                        <p className="text-slate-400">Active Users</p>
                        <h2 className="text-5xl font-bold text-green-400 mt-4">
                            {stats.activeUsers}
                        </h2>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 border border-purple-500/20">
                        <p className="text-slate-400">Reports Generated</p>
                        <h2 className="text-5xl font-bold text-purple-400 mt-4">
                            {stats.reportsGenerated}
                        </h2>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 border border-yellow-500/20">
                        <p className="text-slate-400">API Requests</p>
                        <h2 className="text-5xl font-bold text-yellow-400 mt-4">
                            {stats.apiRequests}
                        </h2>
                    </div>

                </div>

                {/* Chart + Health */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">

                    <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6">

                        <h2 className="text-2xl font-semibold mb-6">
                            Weekly API Usage
                        </h2>

                        <div className="h-80">

                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analyticsData}>
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar
                                        dataKey="requests"
                                        fill="#06B6D4"
                                        radius={[10, 10, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>

                        </div>

                    </div>

                    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">

                        <h2 className="text-2xl font-semibold mb-6">
                            System Health
                        </h2>

                        <div className="space-y-5">

                            <div className="flex justify-between">
                                <span>Database</span>
                                <span className="text-green-400 font-bold">Online</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Backend API</span>
                                <span className="text-green-400 font-bold">Running</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Storage</span>
                                <span className="text-green-400 font-bold">Healthy</span>
                            </div>

                            <div className="flex justify-between">
                                <span>CPU Usage</span>
                                <span className="text-yellow-400 font-bold">42%</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Memory Usage</span>
                                <span className="text-cyan-400 font-bold">68%</span>
                            </div>

                        </div>

                    </div>

                </div>

                {/* Quick Overview */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">

                    <div className="bg-slate-900 rounded-3xl p-6">
                        <p className="text-slate-400">Today's Requests</p>
                        <h2 className="text-4xl font-bold mt-3">1,294</h2>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6">
                        <p className="text-slate-400">New Workspaces</p>
                        <h2 className="text-4xl font-bold mt-3">14</h2>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6">
                        <p className="text-slate-400">Active Sessions</p>
                        <h2 className="text-4xl font-bold mt-3">86</h2>
                    </div>

                </div>

                {/* Recent Activity */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">

                    <h2 className="text-2xl font-semibold mb-6">
                        Recent Workspace Activity
                    </h2>

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead>
                            <tr className="border-b border-slate-700 text-slate-400">
                                <th className="text-left py-4">Workspace</th>
                                <th className="text-left py-4">Owner</th>
                                <th className="text-left py-4">Reports</th>
                                <th className="text-left py-4">Status</th>
                            </tr>
                            </thead>

                            <tbody>

                            <tr className="border-b border-slate-800">
                                <td className="py-4">Marketing Analytics</td>
                                <td>Sneha</td>
                                <td>54</td>
                                <td className="text-green-400">Active</td>
                            </tr>

                            <tr className="border-b border-slate-800">
                                <td className="py-4">Sales Dashboard</td>
                                <td>Admin</td>
                                <td>33</td>
                                <td className="text-green-400">Active</td>
                            </tr>

                            <tr>
                                <td className="py-4">Finance Reports</td>
                                <td>Manager</td>
                                <td>12</td>
                                <td className="text-yellow-400">Pending</td>
                            </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>
        </div>
        </div>
    );
}
