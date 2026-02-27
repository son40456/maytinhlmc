"use client";

import React from "react";
import { useToastStore } from "@/store/useToastStore";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";

const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
};

const bgMap = {
    success: "bg-green-900/90 border-green-700",
    error: "bg-red-900/90 border-red-700",
    warning: "bg-yellow-900/90 border-yellow-600",
    info: "bg-slate-800/90 border-slate-600",
};

const barMap = {
    success: "bg-green-400",
    error: "bg-red-400",
    warning: "bg-yellow-400",
    info: "bg-blue-400",
};

export function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);
    const removeToast = useToastStore((s) => s.removeToast);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[999999] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-sm min-w-[320px] max-w-[480px] ${bgMap[toast.type]} animate-[toastIn_0.3s_ease-out]`}
                >
                    {iconMap[toast.type]}
                    <span className="flex-1 text-sm font-semibold text-white">
                        {toast.message}
                    </span>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-white/60 hover:text-white transition-colors ml-2"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-xl overflow-hidden">
                        <div
                            className={`h-full ${barMap[toast.type]} animate-[toastProgress_3s_linear_forwards]`}
                        />
                    </div>
                </div>
            ))}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes toastIn {
                    from { opacity: 0; transform: translateY(-16px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes toastProgress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            ` }} />
        </div>
    );
}
