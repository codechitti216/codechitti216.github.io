import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { supabase } from '../lib/supabase';

export default function LectureSeries() {
  const { isAdmin } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSeries = useCallback(async () => {
    const { data, error } = await supabase
      .from('lecture_series')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setSeries(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const addSeries = async (entry) => {
    const { error } = await supabase.from('lecture_series').insert(entry);
    if (!error) {
      await fetchSeries();
      setShowForm(false);
    }
  };

  const updateSeries = async (id, entry) => {
    const { error } = await supabase.from('lecture_series').update(entry).eq('id', id);
    if (!error) {
      await fetchSeries();
      setEditingIndex(null);
    }
  };

  const deleteSeries = async (id) => {
    const { error } = await supabase.from('lecture_series').delete().eq('id', id);
    if (!error) {
      await fetchSeries();
    }
  };

  if (loading) return null;
  if (series.length === 0 && !isAdmin) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-lg font-semibold text-gray-900">Lecture series that shaped how I think</h2>

      {series.length > 0 && (
        <div className="space-y-1">
          {series.map((s, i) => (
            editingIndex === i ? (
              <SeriesForm
                key={s.id}
                initial={s}
                onSubmit={(entry) => updateSeries(s.id, entry)}
                onCancel={() => setEditingIndex(null)}
                onDelete={() => deleteSeries(s.id)}
              />
            ) : (
              <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 group">
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
                  {isAdmin && (
                    <button
                      onClick={() => setEditingIndex(i)}
                      className="text-gray-300 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )
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
        <SeriesForm onSubmit={addSeries} onCancel={() => setShowForm(false)} />
      )}
    </section>
  );
}

function SeriesForm({ initial, onSubmit, onCancel, onDelete }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [code, setCode] = useState(initial?.code || '');
  const [instructor, setInstructor] = useState(initial?.instructor || '');
  const [url, setUrl] = useState(initial?.url || '');
  const [notes, setNotes] = useState(initial?.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !url) return;
    onSubmit({
      title,
      code: code || null,
      instructor: instructor || null,
      url,
      notes: notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">
          {initial ? 'Edit lecture series' : 'New lecture series'}
        </span>
        <div className="flex items-center gap-2">
          {initial && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-gray-300 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button type="button" onClick={onCancel} className="text-gray-300 hover:text-gray-500">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
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
        {initial ? 'Save' : 'Add'}
      </button>
    </form>
  );
}
