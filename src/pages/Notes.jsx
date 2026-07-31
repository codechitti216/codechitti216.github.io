import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllContent } from '../lib/content';

export default function Notes() {
  const allContent = useMemo(() => getAllContent(), []);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allContent;
    return allContent
      .map(item => {
        const titleMatch = item.title?.toLowerCase().includes(q);
        const bodyMatch = item.body?.toLowerCase().includes(q);
        if (!titleMatch && !bodyMatch) return null;
        return { item, score: titleMatch ? 2 : 1 };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map(r => r.item);
  }, [allContent, query]);

  return (
    <div className="py-8 space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-gray-900">Log</h1>
        <p className="mt-1 text-sm text-gray-400 italic">placeholder</p>
      </div>

      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="search"
        className="w-full bg-transparent text-sm text-gray-700 border-b border-gray-200 focus:border-gray-400 outline-none pb-1 placeholder-gray-300 transition-colors"
      />

      <div>
        {filtered.map(item => {
          const isDone = item.status === 'completed' || item.status === 'done';
          const hasOutput = item.published !== false;

          const inner = (
            <div className="flex items-baseline justify-between gap-4 py-3 border-b border-gray-50 last:border-0 group">
              <div className="flex items-baseline gap-3 min-w-0">
                <span className={`text-sm leading-5 truncate ${hasOutput ? 'text-gray-900 group-hover:text-gray-500 transition-colors' : 'text-gray-500'}`}>
                  {item.title}
                </span>
              </div>
              <span className={`text-[10px] shrink-0 ${isDone ? 'text-gray-300' : 'text-emerald-400'}`}>
                {isDone ? 'done' : 'active'}
              </span>
            </div>
          );

          return hasOutput ? (
            <Link key={item.slug} to={`/notes/${item.slug}`} className="block">
              {inner}
            </Link>
          ) : (
            <div key={item.slug}>{inner}</div>
          );
        })}

        {allContent.length === 0 && (
          <p className="text-sm text-gray-400 py-8 text-center">Nothing yet.</p>
        )}
        {allContent.length > 0 && filtered.length === 0 && (
          <p className="text-sm text-gray-400 py-8 text-center">No results.</p>
        )}
      </div>
    </div>
  );
}
