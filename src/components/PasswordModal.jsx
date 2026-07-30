import { useState, useEffect, useRef } from 'react';

export default function PasswordModal({ question, onSubmit, onCancel }) {
  const [answer, setAnswer] = useState('');
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
    onSubmit(answer);
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
        className="relative bg-white rounded-lg shadow-lg p-6 w-80 space-y-4"
      >
        {question && (
          <p className="text-sm text-gray-700 leading-relaxed">{question}</p>
        )}
        <input
          ref={inputRef}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Answer"
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
