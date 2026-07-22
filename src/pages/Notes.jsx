import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllContent, TIERS } from '../lib/content';

export default function Notes() {
  const [activeTier, setActiveTier] = useState(null);
  const [activeTag, setActiveTag] = useState(null);

  const allContent = useMemo(() => getAllContent(), []);

  const allTags = useMemo(() => {
    const tags = new Set();
    allContent.forEach(item => {
      if (item.tags) item.tags.forEach(t => tags.add(t));
    });
    return [...tags].sort();
  }, [allContent]);

  const filtered = useMemo(() => {
    let items = allContent;
    if (activeTier) {
      items = items.filter(i => (i.tier || i.kind) === activeTier);
    }
    if (activeTag) {
      items = items.filter(i => i.tags && i.tags.includes(activeTag));
    }
    return items;
  }, [allContent, activeTier, activeTag]);

  const tierKeys = [...new Set(allContent.map(i => i.tier || i.kind))].filter(Boolean);

  return (
    <div className="py-8 space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-gray-900">Work</h1>
        <p className="mt-1 text-sm text-gray-500">
          Research, notes, experiments, and tools.
        </p>
      </div>

      {/* Tier filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTier(null)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              !activeTier
                ? 'bg-gray-900 text-white border-gray-900'
                : 'text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            All
          </button>
          {tierKeys.map(key => {
            const tier = TIERS[key] || { label: key, color: 'text-gray-700 bg-gray-50 border-gray-200' };
            return (
              <button
                key={key}
                onClick={() => setActiveTier(activeTier === key ? null : key)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  activeTier === key
                    ? 'bg-gray-900 text-white border-gray-900'
                    : `${tier.color}`
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${
                  activeTag === tag
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content list */}
      <div className="space-y-1">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 py-8">No content yet. Start building.</p>
        )}
        {filtered.map(item => {
          const tier = TIERS[item.tier || item.kind];
          return (
            <Link
              key={item.slug}
              to={`/notes/${item.slug}`}
              className="block group py-3 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {tier && (
                      <span className={`text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded border ${tier.color}`}>
                        {tier.label}
                      </span>
                    )}
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors truncate">
                      {item.title}
                    </h3>
                  </div>
                  {item.tags && (
                    <div className="flex gap-1.5 mt-1">
                      {item.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-[10px] text-gray-400">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">
                  {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
