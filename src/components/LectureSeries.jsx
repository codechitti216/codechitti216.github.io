import { useState, useEffect } from 'react';
import { FileText, Plus, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

function getStoredSeries() {
  const saved = localStorage.getItem('lecture-series');
  return saved ? JSON.parse(saved) : null;
}

function extractThumbnail(url) {
  if (!url) return null;
  // Extract video ID from various YouTube URL formats
  const match = url.match(/(?:v=|\/vi\/|youtu\.be\/|embed\/)([\w-]{11})/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  // For playlists, we can't easily get thumbnail without API, return null
  return null;
}

export default function LectureSeries() {
  const { isAdmin } = useAdmin();
  const [showForm, setShowForm] = useState(false);

  // Merge: localStorage overrides, fallback to JSON import
  const [series, setSeries] = useState(() => {
    const stored = getStoredSeries();
    if (stored) return stored;
    try {
      const data = require('../data/lecture-series.json');
      return data.series || [];
    } catch {
      return [];
    }
  });

  // Load from JSON import as default
  useEffect(() => {
    if (!getStoredSeries()) {
      import('../data/lecture-series.json').then(data => {
        setSeries(data.series || []);
      });
    }
  }, []);

  const addSeries = (entry) => {
    const updated = [...series, entry];
    setSeries(updated);
    localStorage.setItem('lecture-series', JSON.stringify(updated));
    setShowForm(false);
  };

  if (series.length === 0 && !isAdmin) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-lg font-semibold text-gray-900">Lecture series that shaped how I think</h2>

      {series.length > 0 && (
        <div className="space-y-1">
          {series.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="min-w-0">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                >
                  {s.title}
                  {s.code && <span className="text-gray-400 ml-1">({s.code})</span>}
                </a>
                {s.instructor && (
                  <p className="text-xs text-gray-400 mt-0.5">{s.instructor}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {s.notes && (
                  <a
                    href={s.notes}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <FileText className="h-3 w-3" /> Notes
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg px-4 py-2 w-full justify-center transition-colors"
        >
          <Plus className="h-3 w-3" /> Add lecture series
        </button>
      )}

      {isAdmin && showForm && (
        <AddSeriesForm onAdd={addSeries} onCancel={() => setShowForm(false)} />
      )}
    </section>
  );
}

function AddSeriesForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !url) return;
    onAdd({
      title,
      code: code || null,
      instructor: instructor || null,
      url,
      notes: notes || null,
      thumbnail: extractThumbnail(url),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">New lecture series</span>
        <button type="button" onClick={onCancel} className="text-gray-300 hover:text-gray-500">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Series name *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-gray-400"
        autoFocus
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Course code (e.g. CS4780)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-gray-400"
        />
        <input
          type="text"
          placeholder="Instructor"
          value={instructor}
          onChange={(e) => setInstructor(e.target.value)}
          className="text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-gray-400"
        />
      </div>
      <input
        type="text"
        placeholder="YouTube video or playlist URL *"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-gray-400"
      />
      <input
        type="text"
        placeholder="Link to notes (PDF URL, optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-gray-400"
      />
      <button
        type="submit"
        className="text-xs bg-gray-900 text-white px-4 py-1.5 rounded hover:bg-gray-700"
      >
        Add
      </button>
    </form>
  );
}
