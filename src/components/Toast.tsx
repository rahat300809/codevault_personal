import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    exiting?: boolean;
}

interface ToastContextValue {
    addToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => { } });

export const useToast = () => useContext(ToastContext);

const icons: Record<ToastType, typeof CheckCircle> = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors: Record<ToastType, string> = {
    success: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    error: 'text-red-400 border-red-500/20 bg-red-500/5',
    warning: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    info: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
};

const iconColors: Record<ToastType, string> = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const Icon = icons[toast.type];

    return (
        <div
            className={`${toast.exiting ? 'toast-exit' : 'toast-enter'} flex items-start gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-sm ${colors[toast.type]}`}
        >
            <Icon size={20} className={`mt-0.5 shrink-0 ${iconColors[toast.type]}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                {toast.message && <p className="text-xs text-white/50 mt-0.5">{toast.message}</p>}
            </div>
            <button
                onClick={() => onDismiss(toast.id)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors shrink-0"
            >
                <X size={14} />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, []);

    const addToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Date.now().toString() + Math.random().toString(36).slice(2);
        setToasts(prev => [...prev.slice(-4), { id, type, title, message }]);
        // auto dismiss after 4s
        setTimeout(() => dismiss(id), 4000);
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
