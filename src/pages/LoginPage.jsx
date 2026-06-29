import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
export default function LoginPage() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {

        try {

            const response = await api.post("/auth/login", {
                email,
                password
            });

            alert(response.data);

            if (response.data === "Login Successful") {
                navigate("/dashboard");
            }

        } catch (error) {

            console.error(error);

            alert("Login Failed");
        }
    };
    return (
        <div className="min-h-screen bg-slate-950 p-6 lg:p-10 text-white">

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-5 min-h-[90vh]">

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition">
                    <p className="text-slate-400 text-sm">Revenue</p>
                    <h1 className="text-5xl font-bold mt-4">$128K</h1>
                    <p className="text-emerald-400 mt-3">+24% this month</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition">
                    <p className="text-slate-400 text-sm">Active Users</p>
                    <h1 className="text-5xl font-bold mt-4">15.4K</h1>
                    <p className="text-cyan-400 mt-3">Live monitoring</p>
                </div>

                <div className="lg:col-span-2 lg:row-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-center">

                    <div className="mb-8">
                        <h1 className="text-4xl font-bold">
                            Analytics
                            <span className="text-cyan-400"> Platform</span>
                        </h1>

                        <p className="text-slate-400 mt-4 text-lg">
                            Monitor. Analyze. Scale.
                        </p>
                    </div>

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 mb-4 outline-none focus:border-cyan-500"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 mb-6 outline-none focus:border-cyan-500"
                    />

                    <button
                        onClick={handleLogin}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 rounded-2xl py-4 font-semibold transition"
                    >
                        Access Workspace
                    </button>

                    <p className="text-slate-400 mt-6 text-center">
                        New here?
                        <Link
                            to="/signup"
                            className="ml-2 text-cyan-400 font-medium"
                        >
                            Create Workspace
                        </Link>
                    </p>

                </div>

                <div className="lg:row-span-2 bg-slate-900 border border-slate-500 rounded-3xl p-6">
                    <h2 className="text-xl font-semibold mb-6">
                        Live Activity
                    </h2>

                    <div className="space-y-5">

                        <div className="border-l-2 border-cyan-500 pl-4">
                            <p className="font-medium">
                                New Tenant Registered
                            </p>
                            <p className="text-slate-400 text-sm">
                                2 minutes ago
                            </p>
                        </div>

                        <div className="border-l-2 border-purple-500 pl-4">
                            <p className="font-medium">
                                Revenue Report Generated
                            </p>
                            <p className="text-slate-400 text-sm">
                                12 minutes ago
                            </p>
                        </div>

                        <div className="border-l-2 border-green-500 pl-4">
                            <p className="font-medium">
                                Dashboard Accessed
                            </p>
                            <p className="text-slate-400 text-sm">
                                24 minutes ago
                            </p>
                        </div>

                        <div className="border-l-2 border-orange-500 pl-4">
                            <p className="font-medium">
                                Alert Triggered
                            </p>
                            <p className="text-slate-400 text-sm">
                                41 minutes ago
                            </p>
                        </div>

                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition">
                    <p className="text-slate-400 text-sm">
                        Growth Rate
                    </p>
                    <h1 className="text-5xl font-bold mt-4">24%</h1>
                    <p className="text-emerald-400 mt-3">
                        Positive trend
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition">
                    <p className="text-slate-400 text-sm">
                        Events Processed
                    </p>
                    <h1 className="text-5xl font-bold mt-4">2.1M</h1>
                    <p className="text-cyan-400 mt-3">
                        Real-time updates
                    </p>
                </div>

            </div>
        </div>
    );
}