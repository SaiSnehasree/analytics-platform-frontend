import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dataSourceApi } from "../services/dataSourceApi";

export default function OnboardingWizardPage() {
    const [step, setStep] = useState(1);
    const [sourceName, setSourceName] = useState("");
    const [sourceType, setSourceType] = useState("CSV");
    const [file, setFile] = useState(null);
    const [sheetUrl, setSheetUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [webhookResult, setWebhookResult] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const workspaceName = localStorage.getItem("workspaceName") || "Your Workspace";

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleSubmitSource = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (sourceType === "CSV") {
                if (!file) throw new Error("Please choose a CSV file");
                await dataSourceApi.uploadCsv(sourceName, file);
            } else if (sourceType === "GOOGLE_SHEETS") {
                if (!sheetUrl) throw new Error("Please enter a Google Sheet URL");
                await dataSourceApi.addGoogleSheet(sourceName, sheetUrl);
            } else if (sourceType === "WEBHOOK") {
                const res = await dataSourceApi.createWebhook(sourceName);
                setWebhookResult({
                    url: `${window.location.origin.replace("5173", "8080")}/webhooks/${res.data.webhookKey}`
                });
            }
            handleNext();
        } catch (err) {
            setError(err.message || "Ingestion setup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = () => {
        localStorage.setItem("onboarding_complete", "true");
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
                {/* Steps header */}
                <div className="flex justify-between items-center mb-8 px-4">
                    {[1, 2, 3].map(num => (
                        <div key={num} className="flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                step >= num ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" : "bg-slate-800 text-slate-500 border border-slate-700"
                            }`}>{num}</span>
                            <span className={`text-xs font-semibold ${step >= num ? "text-slate-200" : "text-slate-600"}`}>
                                {num === 1 ? "Welcome" : num === 2 ? "Data Setup" : "Ready"}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Card Container */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-5 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="text-center py-4">
                            <span className="text-5xl">👋</span>
                            <h2 className="text-2xl font-bold mt-4 mb-2">Welcome to {workspaceName}</h2>
                            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                                Let's get your analytics platform configured. We'll set up your first data feed in the next step.
                            </p>
                            <button onClick={handleNext}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition">
                                Let's Get Started
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-xl font-bold mb-1">Set Up Your First Feed</h2>
                            <p className="text-slate-400 text-xs mb-6">Choose how you'd like to load data into the platform.</p>
                            <form onSubmit={handleSubmitSource} className="space-y-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Source Name</label>
                                    <input value={sourceName} onChange={e => setSourceName(e.target.value)} required
                                        placeholder="e.g. Sales Production Feed"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Feed Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["CSV", "GOOGLE_SHEETS", "WEBHOOK"].map(type => (
                                            <button key={type} type="button" onClick={() => setSourceType(type)}
                                                className={`py-2 rounded-xl text-xs font-semibold transition border ${
                                                    sourceType === type ? "bg-cyan-600 text-white border-cyan-600" : "bg-slate-800 border-slate-700 text-slate-400"
                                                }`}>
                                                {type.replace("_", " ")}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {sourceType === "CSV" && (
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-1.5">Choose CSV File</label>
                                        <input type="file" accept=".csv" required
                                            onChange={e => setFile(e.target.files[0])}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-400 focus:outline-none" />
                                    </div>
                                )}

                                {sourceType === "GOOGLE_SHEETS" && (
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-1.5">Public Google Sheet URL</label>
                                        <input type="url" value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} required
                                            placeholder="https://docs.google.com/spreadsheets/d/..."
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
                                    </div>
                                )}

                                {sourceType === "WEBHOOK" && (
                                    <div className="bg-slate-800 border border-slate-750 p-4 rounded-xl text-slate-400 text-xs">
                                        We will generate a unique Webhook URL for you in the next step.
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-4">
                                    <button type="button" onClick={handlePrev} className="text-slate-500 hover:text-slate-400 text-sm font-semibold">Back</button>
                                    <button type="submit" disabled={loading}
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-2.5 rounded-xl transition">
                                        {loading ? "Connecting..." : "Configure Feed"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-4">
                            <span className="text-5xl">🚀</span>
                            <h2 className="text-2xl font-bold mt-4 mb-2">You're All Set!</h2>
                            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                                Your workspace is ready. You can view your real-time analytics now.
                            </p>

                            {webhookResult && (
                                <div className="mb-6 bg-slate-800 border border-slate-700 rounded-xl p-4 text-left max-w-md mx-auto">
                                    <label className="block text-slate-400 text-xs mb-1">Your Webhook URL</label>
                                    <code className="bg-slate-950 rounded px-2.5 py-1.5 text-cyan-400 text-xs break-all block">
                                        {webhookResult.url}
                                    </code>
                                </div>
                            )}

                            <button onClick={handleComplete}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-8 py-3 rounded-xl transition">
                                Go to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
