import { useState } from "react";
import api from "../services/api";

export default function SettingsPage() {
    const [workspaceName, setWorkspaceName] = useState(localStorage.getItem("workspaceName") || "");
    const [ownerName, setOwnerName] = useState(localStorage.getItem("ownerName") || "");
    const [email, setEmail] = useState(localStorage.getItem("email") || "");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            // Save settings to backend profile endpoint
            // For now update local state & simulate
            localStorage.setItem("workspaceName", workspaceName);
            localStorage.setItem("ownerName", ownerName);
            setMsg("✅ Settings saved successfully!");
        } catch (err) {
            setMsg("❌ Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Tenant Settings</h1>
                <p className="text-slate-400 mb-8">Manage your workspace configuration and profile preferences.</p>

                {msg && (
                    <div className="mb-5 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                        {msg}
                    </div>
                )}

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-1.5">Workspace Name</label>
                            <input value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} required
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1.5">Owner Name</label>
                            <input value={ownerName} onChange={e => setWorkspaceName(e.target.value)} required
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1.5">Email Address</label>
                            <input readOnly value={email}
                                className="w-full bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1.5">New Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="Leave blank to keep current password"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50 mt-2">
                            {loading ? "Saving..." : "Save Settings"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}