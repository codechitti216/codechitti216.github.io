import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllContent, TIERS } from '../lib/content';

export default function Notes() {
  const allContent = useMemo(() => getAllContent(), []);

  return (
    <div className="py-8 space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-gray-900">Work</h1>
        <p className="mt-1 text-sm text-gray-500">
          Research, notes, experiments, and tools.
        </p>
      </div>

      {/* Content list */}
      <div className="space-y-1">
        {allContent.length === 0 && (
          <p className="text-sm text-gray-400 py-8">No content yet. Start building.</p>
        )}
        {allContent.map(item => {
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
