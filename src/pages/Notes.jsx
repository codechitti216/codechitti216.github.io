import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllContent, TIERS } from '../lib/content';

export default function Notes() {
  const allContent = useMemo(() => getAllContent(), []);

  // Split into investigations (experiment, paper, notebook, research, tool) and notes (note, seed)
  const investigations = allContent.filter(item =>
    ['experiment', 'paper', 'notebook', 'research', 'tool'].includes(item.tier)
  );
  const notes = allContent.filter(item =>
    ['note', 'seed'].includes(item.tier) || !item.tier
  );

  const TierBadge = ({ tier }) => {
    const tierInfo = TIERS[tier];
    if (!tierInfo) return null;
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${tierInfo.color}`}>
        {tierInfo.label}
      </span>
    );
  };

  const ContentItem = ({ item }) => (
    <Link
      to={`/notes/${item.slug}`}
      className="block group py-3 border-b border-gray-50 last:border-0"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <TierBadge tier={item.tier} />
          <h3 className="text-sm text-gray-900 group-hover:text-gray-500 transition-colors truncate">
            {item.title}
          </h3>
          {item.status === 'planned' && (
            <span className="text-[10px] text-gray-300">(in progress)</span>
          )}
        </div>
        <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">
          {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
        </span>
      </div>
    </Link>
  );

  return (
    <div className="py-8 space-y-10">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-gray-900">Work</h1>
        <p className="mt-1 text-sm text-gray-500">
          Investigations, notes, and experiments.
        </p>
      </div>

      {/* Investigations */}
      {investigations.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-semibold text-gray-900">Investigations</h2>
          <p className="text-xs text-gray-400">Projects, reproductions, experiments, and papers.</p>
          <div className="space-y-1">
            {investigations.map(item => (
              <ContentItem key={item.slug} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Notes */}
      {notes.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-semibold text-gray-900">Notes</h2>
          <p className="text-xs text-gray-400">First-principles explainers and understanding made public.</p>
          <div className="space-y-1">
            {notes.map(item => (
              <ContentItem key={item.slug} item={item} />
            ))}
          </div>
        </section>
      )}

      {allContent.length === 0 && (
        <p className="text-sm text-gray-400 py-8 text-center">No content yet. Start building.</p>
      )}
    </div>
  );
}
