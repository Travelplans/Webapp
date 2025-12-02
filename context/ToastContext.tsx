import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, InfoCircleIcon } from '../components/shared/icons/Icons';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: number) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm space-y-3">
      {toasts.map((toast) => {
        let bgColor: string;
        let icon: React.ReactNode;

        switch (toast.type) {
            case 'success':
                bgColor = 'bg-green-500';
                icon = <CheckCircleIcon className="w-6 h-6 text-white" />;
                break;
            case 'error':
                bgColor = 'bg-red-500';
                icon = <XCircleIcon className="w-6 h-6 text-white" />;
                break;
            case 'info':
                bgColor = 'bg-blue-500';
                icon = <InfoCircleIcon className="w-6 h-6 text-white" />;
                break;
        }

        return (
          <div
            key={toast.id}
            className={`relative flex items-center p-4 rounded-lg shadow-lg text-white ${bgColor} animate-toast-in`}
            role="alert"
          >
            <div className="flex-shrink-0">{icon}</div>
            <div className="ml-3 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto -mx-1.5 -my-1.5 bg-white/20 text-white hover:bg-white/40 rounded-lg focus:ring-2 focus:ring-white p-1.5 inline-flex h-8 w-8"
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
};


export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 5000); // Auto-dismiss after 5 seconds
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};