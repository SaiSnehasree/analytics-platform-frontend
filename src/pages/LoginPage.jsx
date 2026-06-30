import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Eye, EyeOff } from "lucide-react";
import * as styles from "framer-motion/m";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/auth/login", { email, password });
            const { token, tenantId, email: userEmail, workspaceName, ownerName } = res.data;

            // Store all auth data in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("tenantId", tenantId);
            localStorage.setItem("email", userEmail);
            localStorage.setItem("workspaceName", workspaceName);
            localStorage.setItem("ownerName", ownerName);

            // Show onboarding on first login
            const onboarded = localStorage.getItem("onboarding_complete");
            navigate(onboarded ? "/dashboard" : "/onboarding");
        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mb-4">
                        <span className="text-3xl">📊</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Analytics Platform</h1>
                    <p className="text-slate-400 mt-2">Multi-Tenant SaaS Dashboard</p>
                </div>

                {/* Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Sign in to your workspace</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-5 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-1.5">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1.5">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            id="login-btn"
                            disabled={loading}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-sm mt-6">
                        Don't have a workspace?{" "}
                        <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}