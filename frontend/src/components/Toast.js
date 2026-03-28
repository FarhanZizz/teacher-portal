import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let _showToast = null;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  // fallback if used outside provider
  return { toast: (msg, type) => console.log(type, msg) };
}

export function showToast(message, type = 'success') {
  if (_showToast) _showToast(message, type);
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  _showToast = add;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✓' : '✕'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
