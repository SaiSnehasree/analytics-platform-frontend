import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-medium animate-slide-up backdrop-blur-md
                        ${t.type === "success" ? "bg-green-500/20 border-green-500/40 text-green-300" :
                          t.type === "error"   ? "bg-red-500/20 border-red-500/40 text-red-300" :
                                                 "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"}`}>
                        <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
