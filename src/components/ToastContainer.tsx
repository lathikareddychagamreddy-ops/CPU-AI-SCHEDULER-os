import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
        const colorClass =
          toast.type === 'success' ? 'text-emerald-400' :
          toast.type === 'error' ? 'text-rose-400' :
          'text-blue-400';

        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-xl bg-slate-800/95 backdrop-blur-md border border-slate-700 px-4 py-3 shadow-2xl animate-in slide-in-from-right"
          >
            <Icon className={`w-5 h-5 ${colorClass} flex-shrink-0 mt-0.5`} />
            <p className="text-sm text-slate-200 flex-1">{toast.message}</p>
            <button onClick={() => dismissToast(toast.id)} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
