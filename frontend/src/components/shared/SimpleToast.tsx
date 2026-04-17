import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface SimpleToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose: () => void;
}

export default function SimpleToast({ message, type, duration = 3000, onClose }: SimpleToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        warning: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const styles = {
        success: 'bg-green-500 text-white border-green-600',
        error: 'bg-red-500 text-white border-red-600',
        warning: 'bg-yellow-500 text-gray-900 border-yellow-600',
        info: 'bg-blue-500 text-white border-blue-600'
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`${styles[type]} px-6 py-4 rounded-lg shadow-lg border-2 flex items-center gap-3 min-w-[300px]`}>
                {icons[type]}
                <span className="font-medium">{message}</span>
            </div>
            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
