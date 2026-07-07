import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Eye, EyeOff } from "lucide-react";

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
            const { token, tenantId, email: userEmail, workspaceName, ownerName, role } = res.data;
            
            localStorage.setItem("token", token);
            localStorage.setItem("tenantId", tenantId);
            localStorage.setItem("email", userEmail);
            localStorage.setItem("workspaceName", workspaceName);
            localStorage.setItem("ownerName", ownerName);
            localStorage.setItem("role", role || "ADMIN");
            
            const onboarded = localStorage.getItem("onboarding_complete");
            navigate(onboarded ? "/dashboard" : "/onboarding");
        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] flex flex-col justify-center items-center px-4 py-12">
            <div className="w-full max-w-[440px] space-y-6">
                
                {/* Logo & Platform Wording */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-2xl">
                        <div className="w-full h-full bg-slate-850 rounded-lg flex items-center justify-center">
                            <span className="text-2xl select-none">📊</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Analytics Platform</h1>
                        <p className="text-sm text-slate-500 mt-1">Multi-Tenant SaaS Dashboard</p>
                    </div>
                </div>

                {/* Sign-in Card */}
                <div className="bg-[#0b0f19] border border-[#1e293b]/60 rounded-3xl p-8 shadow-2xl space-y-6">
                    <h2 className="text-xl font-semibold text-white">Sign in to your workspace</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-xs font-medium mb-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@company.com"
                                className="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 text-xs font-medium mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600 font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            id="login-btn"
                            disabled={loading}
                            className="w-full bg-[#0099cc] hover:bg-[#0083B0] text-white font-semibold py-3 rounded-xl transition-all duration-150 disabled:opacity-50 text-sm select-none cursor-pointer mt-2"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="text-center">
                        <span className="text-xs text-slate-500">
                            Don't have a workspace?{" "}
                            <Link to="/signup" className="text-cyan-500 hover:text-cyan-400 font-medium transition">
                                Create one
                            </Link>
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}