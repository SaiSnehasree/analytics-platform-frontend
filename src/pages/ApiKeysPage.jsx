import { useState, useEffect } from "react";
import { apiKeysApi } from "../services/dataSourceApi";
import { useToast } from "../context/ToastContext";

export default function ApiKeysPage() {
    const [apiKey, setApiKey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const toast = useToast();

    useEffect(() => { fetchKey(); }, []);

    const fetchKey = async () => {
        setLoading(true);
        try {
            const res = await apiKeysApi.getMyKey();
            setApiKey(res.data.apiKey);
        } catch { toast("Could not load API key", "error"); }
        finally { setLoading(false); }
    };

    const handleRegenerate = async () => {
        if (!confirm("Regenerating will invalidate your existing key. Continue?")) return;
        setRegenerating(true);
        try {
            const res = await apiKeysApi.regenerate();
            setApiKey(res.data.apiKey);
            setShowKey(true);
            toast("New API key generated!");
        } catch { toast("Failed to regenerate key", "error"); }
        finally { setRegenerating(false); }
    };

    const handleCopy = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        toast("API key copied to clipboard!", "info");
        setTimeout(() => setCopied(false), 2000);
    };

    const maskedKey = apiKey ? apiKey.substring(0, 8) + "•".repeat(24) + apiKey.slice(-4) : "";

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-1">API Keys</h1>
                    <p className="text-slate-400">Use API keys to authenticate programmatic access to your analytics data.</p>
                </div>

                {/* Main Key Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold">Your API Key</h2>
                            <p className="text-slate-400 text-sm mt-1">Keep this secret. Do not expose it in frontend code or public repositories.</p>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs px-3 py-1.5 rounded-full font-medium">
                            Active
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-14 bg-slate-800 rounded-xl animate-pulse mb-4" />
                    ) : (
                        <div className="relative mb-4">
                            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 font-mono text-sm gap-3">
                                <span className="flex-1 text-cyan-400 truncate select-all">
                                    {showKey ? apiKey : maskedKey}
                                </span>
                                <button onClick={() => setShowKey(!showKey)}
                                    className="text-slate-400 hover:text-white transition text-lg flex-shrink-0">
                                    {showKey ? "🙈" : "👁"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={handleCopy} disabled={loading}
                            className={`flex-1 font-semibold py-3 rounded-xl transition text-sm ${copied ? "bg-green-600 text-white" : "bg-cyan-600 hover:bg-cyan-500 text-white"}`}>
                            {copied ? "✓ Copied!" : "Copy Key"}
                        </button>
                        <button onClick={handleRegenerate} disabled={regenerating || loading}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 font-semibold py-3 rounded-xl transition text-sm disabled:opacity-50">
                            {regenerating ? "Regenerating..." : "Regenerate Key"}
                        </button>
                    </div>
                </div>

                {/* Usage Guide */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8">
                    <h2 className="text-xl font-semibold mb-5">Usage Examples</h2>
                    <div className="space-y-4">
                        {[
                            { label: "REST API (curl)", code: `curl -H "X-API-KEY: ${apiKey || "your_api_key"}" https://api.forgeanalytics.com/metrics` },
                            { label: "JavaScript (fetch)", code: `fetch("https://api.forgeanalytics.com/metrics", {\n  headers: { "X-API-KEY": "${apiKey || "your_api_key"}" }\n})` },
                            { label: "Python (requests)", code: `import requests\nres = requests.get("https://api.forgeanalytics.com/metrics",\n  headers={"X-API-KEY": "${apiKey || "your_api_key"}"})\nprint(res.json())` },
                        ].map(ex => (
                            <div key={ex.label}>
                                <div className="text-slate-400 text-sm font-medium mb-2">{ex.label}</div>
                                <pre className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">{ex.code}</pre>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Permissions */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                    <h2 className="text-xl font-semibold mb-5">Key Permissions</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { endpoint: "GET /metrics", desc: "Read all metrics", allowed: true },
                            { endpoint: "GET /anomalies", desc: "Read anomaly alerts", allowed: true },
                            { endpoint: "POST /metrics", desc: "Ingest new metric data", allowed: true },
                            { endpoint: "GET /goals", desc: "Read metric goals", allowed: true },
                            { endpoint: "DELETE /tenant", desc: "Delete tenant (admin only)", allowed: false },
                            { endpoint: "POST /embed/generate", desc: "Create embed tokens", allowed: false },
                        ].map(perm => (
                            <div key={perm.endpoint} className="flex items-start gap-3 bg-slate-800/40 rounded-xl p-4">
                                <span className={`mt-0.5 text-lg ${perm.allowed ? "text-green-400" : "text-red-400"}`}>
                                    {perm.allowed ? "✓" : "✕"}
                                </span>
                                <div>
                                    <div className="font-mono text-xs text-cyan-400">{perm.endpoint}</div>
                                    <div className="text-slate-400 text-xs mt-0.5">{perm.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
