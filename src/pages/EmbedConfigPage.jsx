import { useState, useEffect } from "react";
import { embedApi } from "../services/dataSourceApi";

export default function EmbedConfigPage() {
    const [configs, setConfigs] = useState([]);
    const [allowedDomains, setAllowedDomains] = useState("");
    const [allowedMetrics, setAllowedMetrics] = useState("");
    const [theme, setTheme] = useState("dark");
    const [generatedEmbed, setGeneratedEmbed] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await embedApi.list();
            setConfigs(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateEmbed = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            const res = await embedApi.generate(allowedDomains, allowedMetrics, theme);
            const token = res.data.embedToken;
            const snippet = `<script src="${window.location.origin.replace("5173", "8080")}/embed/widget.js"></script>\n<analytics-widget token="${token}" data-theme="${theme}"></analytics-widget>`;
            setGeneratedEmbed(snippet);
            setAllowedDomains("");
            setAllowedMetrics("");
            fetchConfigs();
            setMsg("✅ Embed configuration generated successfully!");
        } catch (err) {
            setMsg("❌ Failed to generate embed configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!confirm("Are you sure you want to revoke this embed? It will stop rendering on all external sites.")) return;
        try {
            await embedApi.revoke(id);
            fetchConfigs();
            setMsg("✅ Embed configuration revoked");
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Embed Configuration</h1>
                <p className="text-slate-400 mb-8">Generate public embed tokens and JS snippets to show analytics on external sites.</p>

                {msg && (
                    <div className={`mb-5 p-4 rounded-xl border text-sm ${msg.startsWith("✅") ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                        {msg}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Config Form */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                        <h2 className="text-xl font-semibold mb-6">Create New Embed</h2>
                        <form onSubmit={handleCreateEmbed} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Allowed Domains (comma-separated)</label>
                                <input value={allowedDomains} onChange={e => setAllowedDomains(e.target.value)}
                                    placeholder="e.g. example.com, app.yoursite.io"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                                <p className="text-slate-500 text-xs mt-1">Empty allows embed requests from any domain</p>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Allowed Metrics (comma-separated)</label>
                                <input value={allowedMetrics} onChange={e => setAllowedMetrics(e.target.value)}
                                    placeholder="e.g. revenue, active_users"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                                <p className="text-slate-500 text-xs mt-1">Empty makes all metrics visible in the widget</p>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Default Theme</label>
                                <select value={theme} onChange={e => setTheme(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500">
                                    <option value="dark">Dark Theme</option>
                                    <option value="light">Light Theme</option>
                                </select>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 mt-2">
                                {loading ? "Generating..." : "Generate Snippet"}
                            </button>
                        </form>
                    </div>

                    {/* Result Snippet */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col">
                        <h2 className="text-xl font-semibold mb-6">HTML Embed Snippet</h2>
                        {generatedEmbed ? (
                            <div className="flex-1 flex flex-col">
                                <p className="text-slate-400 text-sm mb-3">Copy and paste this code on your website where you want the widget to render:</p>
                                <textarea readOnly value={generatedEmbed}
                                    className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-400 focus:outline-none resize-none mb-4 min-h-[120px]"></textarea>
                                <button onClick={() => { navigator.clipboard.writeText(generatedEmbed); alert("Snippet copied!"); }}
                                    className="bg-slate-800 hover:bg-slate-750 text-white font-medium py-2.5 rounded-xl transition text-sm">
                                    Copy Snippet
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-600">
                                <div>
                                    <p className="text-3xl mb-2">🔗</p>
                                    <p className="text-sm">Configure and generate a snippet on the left to see your HTML code here</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Embeds */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Active Embed Tokens</h2>
                    {configs.length === 0 ? (
                        <p className="text-slate-600 text-sm">No active embeds. Create one above.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400 text-left">
                                        <th className="py-3 px-4">Token (Prefix)</th>
                                        <th className="py-3 px-4">Allowed Domains</th>
                                        <th className="py-3 px-4">Theme</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {configs.map(cfg => (
                                        <tr key={cfg.id} className="border-b border-slate-800/50 hover:bg-slate-800/10">
                                            <td className="py-3 px-4 font-mono text-xs text-cyan-400">{cfg.embedToken.slice(0, 16)}...</td>
                                            <td className="py-3 px-4 text-slate-300">{cfg.allowedDomains || "Any Domain"}</td>
                                            <td className="py-3 px-4 capitalize">{cfg.theme.toLowerCase()}</td>
                                            <td className="py-3 px-4">
                                                <span className={`text-xs px-2.5 py-1 rounded-full border ${cfg.active ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-slate-500 border-slate-700"}`}>
                                                    {cfg.active ? "Active" : "Revoked"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {cfg.active && (
                                                    <button onClick={() => handleRevoke(cfg.id)}
                                                        className="text-red-400 hover:text-red-300 transition-all font-medium text-xs">
                                                        Revoke
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
