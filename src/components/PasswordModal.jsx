import { useState, useEffect, useRef } from 'react';

export default function PasswordModal({ onSubmit, onCancel }) {
  const [password, setPassword] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onCancel}
    >
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-lg shadow-lg p-6 w-72 space-y-4"
      >
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-gray-400"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="text-xs bg-gray-900 text-white px-4 py-1.5 rounded hover:bg-gray-700 flex-1"
          >
            Enter
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-gray-700 px-4 py-1.5"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
