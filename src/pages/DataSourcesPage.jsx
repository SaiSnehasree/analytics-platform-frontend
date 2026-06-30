import { useState, useEffect } from "react";
import { dataSourceApi } from "../services/dataSourceApi";

const TABS = ["CSV Upload", "Google Sheets", "Webhook"];

export default function DataSourcesPage() {
    const [tab, setTab] = useState(0);
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    // CSV state
    const [csvName, setCsvName] = useState("");
    const [csvFile, setCsvFile] = useState(null);

    // Sheets state
    const [sheetName, setSheetName] = useState("");
    const [sheetUrl, setSheetUrl] = useState("");

    // Webhook state
    const [webhookName, setWebhookName] = useState("");
    const [createdWebhook, setCreatedWebhook] = useState(null);

    useEffect(() => { fetchSources(); }, []);

    const fetchSources = async () => {
        try {
            const res = await dataSourceApi.list();
            setSources(res.data);
        } catch (e) { console.error(e); }
    };

    const flash = (message) => { setMsg(message); setTimeout(() => setMsg(""), 4000); };

    const handleCsvUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) return;
        setLoading(true);
        try {
            const res = await dataSourceApi.uploadCsv(csvName, csvFile);
            flash(`✅ CSV uploaded! ${res.data.metricsImported} metrics imported.`);
            setCsvName(""); setCsvFile(null);
            fetchSources();
        } catch (err) {
            flash("❌ " + (err.response?.data?.error || "Upload failed"));
        } finally { setLoading(false); }
    };

    const handleSheetsAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await dataSourceApi.addGoogleSheet(sheetName, sheetUrl);
            flash(`✅ Sheet connected! ${res.data.metricsImported} metrics synced.`);
            setSheetName(""); setSheetUrl("");
            fetchSources();
        } catch (err) {
            flash("❌ " + (err.response?.data?.error || "Failed to connect sheet"));
        } finally { setLoading(false); }
    };

    const handleWebhookCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await dataSourceApi.createWebhook(webhookName);
            setCreatedWebhook({
                key: res.data.webhookKey,
                url: `${window.location.origin.replace("5173", "8080")}/webhooks/${res.data.webhookKey}`,
            });
            setWebhookName("");
            fetchSources();
        } catch (err) {
            flash("❌ " + (err.response?.data?.error || "Failed to create webhook"));
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this data source?")) return;
        try {
            await dataSourceApi.delete(id);
            fetchSources();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Data Sources</h1>
                <p className="text-slate-400 mb-8">Connect CSV files, Google Sheets, or receive webhook events.</p>

                {msg && (
                    <div className={`mb-5 p-4 rounded-xl border text-sm ${msg.startsWith("✅") ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                        {msg}
                    </div>
                )}

                {/* Tab Bar */}
                <div className="flex gap-2 mb-8 bg-slate-900 rounded-2xl p-1.5 w-fit">
                    {TABS.map((t, i) => (
                        <button key={t} onClick={() => setTab(i)}
                            className={`px-5 py-2 rounded-xl text-sm font-medium transition ${tab === i ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Tab Panels */}
                {tab === 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8">
                        <h2 className="text-xl font-semibold mb-6">Upload CSV File</h2>
                        <form onSubmit={handleCsvUpload} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Data Source Name</label>
                                <input value={csvName} onChange={e => setCsvName(e.target.value)} required
                                    placeholder="e.g. Sales Data Q1"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">CSV File</label>
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-cyan-500/50 transition cursor-pointer"
                                    onClick={() => document.getElementById("csv-file-input").click()}>
                                    <input id="csv-file-input" type="file" accept=".csv" className="hidden"
                                        onChange={e => setCsvFile(e.target.files[0])} />
                                    {csvFile ? (
                                        <p className="text-cyan-400 font-medium">📁 {csvFile.name}</p>
                                    ) : (
                                        <p className="text-slate-500">Drop CSV here or <span className="text-cyan-400">click to browse</span></p>
                                    )}
                                    <p className="text-slate-600 text-xs mt-2">Auto-detects timestamp + numeric columns</p>
                                </div>
                            </div>
                            <button type="submit" disabled={loading || !csvFile}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50">
                                {loading ? "Uploading..." : "Upload & Parse"}
                            </button>
                        </form>
                    </div>
                )}

                {tab === 1 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8">
                        <h2 className="text-xl font-semibold mb-2">Connect Google Sheets</h2>
                        <p className="text-slate-500 text-sm mb-6">Sheet must be shared publicly (View access). Syncs hourly automatically.</p>
                        <form onSubmit={handleSheetsAdd} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Data Source Name</label>
                                <input value={sheetName} onChange={e => setSheetName(e.target.value)} required
                                    placeholder="e.g. Marketing Metrics"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Google Sheets URL</label>
                                <input value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} required
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                            </div>
                            <button type="submit" disabled={loading}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50">
                                {loading ? "Connecting..." : "Connect Sheet"}
                            </button>
                        </form>
                    </div>
                )}

                {tab === 2 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8">
                        <h2 className="text-xl font-semibold mb-2">Webhook Integration</h2>
                        <p className="text-slate-500 text-sm mb-6">Generate a unique URL. POST JSON metrics to it from any system.</p>
                        <form onSubmit={handleWebhookCreate} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Webhook Name</label>
                                <input value={webhookName} onChange={e => setWebhookName(e.target.value)} required
                                    placeholder="e.g. Production App Events"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                            </div>
                            <button type="submit" disabled={loading}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50">
                                {loading ? "Creating..." : "Generate Webhook URL"}
                            </button>
                        </form>

                        {createdWebhook && (
                            <div className="mt-6 bg-slate-800 border border-slate-700 rounded-2xl p-5">
                                <p className="text-green-400 font-semibold mb-3">✅ Webhook Created!</p>
                                <label className="text-slate-400 text-xs block mb-1">Webhook URL (POST to this)</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-slate-900 rounded-lg px-3 py-2 text-cyan-400 text-xs break-all">
                                        {createdWebhook.url}
                                    </code>
                                    <button onClick={() => navigator.clipboard.writeText(createdWebhook.url)}
                                        className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-xs transition">
                                        Copy
                                    </button>
                                </div>
                                <div className="mt-4 bg-slate-900 rounded-xl p-4">
                                    <p className="text-slate-400 text-xs mb-2">Example payload:</p>
                                    <pre className="text-xs text-cyan-300">{`{
  "metrics": {
    "revenue": 1234.5,
    "users": 42,
    "responseTime": 180.2
  }
}`}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Active Sources */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Active Data Sources</h2>
                    {sources.length === 0 ? (
                        <p className="text-slate-600 text-sm">No data sources yet. Add one above.</p>
                    ) : (
                        <div className="space-y-3">
                            {sources.map(src => (
                                <div key={src.id} className="flex items-center justify-between bg-slate-800 rounded-xl px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">
                                            {src.sourceType === "CSV" ? "📁" : src.sourceType === "GOOGLE_SHEETS" ? "📊" : "🔗"}
                                        </span>
                                        <div>
                                            <p className="text-white font-medium text-sm">{src.name}</p>
                                            <p className="text-slate-500 text-xs">{src.sourceType} • {src.status}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-2 py-1 rounded-full border ${src.status === "ACTIVE" ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-slate-500 border-slate-700"}`}>
                                            {src.status}
                                        </span>
                                        <button onClick={() => handleDelete(src.id)}
                                            className="text-slate-500 hover:text-red-400 transition text-sm">
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
