"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type, duration = 7000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const typeStyles = {
        success: "alert-success",
        error: "alert-error",
        info: "alert-info",
        warning: "alert-warning",
    };

    const icons = {
        success: "✓",
        error: "✕",
        info: "ℹ",
        warning: "⚠",
    };

    return (
        <div className="toast toast-top toast-end z-50">
            <div className={`alert ${typeStyles[type]} shadow-lg`}>
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icons[type]}</span>
                    <span>{message}</span>
                </div>
                <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle">
                    ✕
                </button>
            </div>
        </div>
    );
}
