import React from 'react';

const entries = [];
const verificationTimestamp = '2026-03-16T16:35:40.262Z';
const storyDate = '2026-03-16';

export default function StoryFor2026_03_16() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Story of the Day – {storyDate}</h1>
        <p className="text-sm text-gray-600">
          A narrative of how ideas moved across the research pipeline today.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">
          No movements were recorded in the Local Research Lab for this date.
        </p>
      ) : (
        <section className="space-y-4">
          <ol className="border-l border-gray-300 pl-4 space-y-4">
            {entries.map((entry, index) => (
              <li key={index} className="relative">
                <div className="absolute -left-2 top-1 h-3 w-3 rounded-full bg-emerald-500 border border-emerald-700" />
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-mono">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  <div className="text-sm font-semibold">
                    {entry.title}{' '}
                    <span className="text-xs font-normal text-gray-500">
                      ({entry.cardId || 'no-id'})
                    </span>
                  </div>
                  <div className="text-xs text-gray-700">
                    <span className="font-medium">{entry.fromStatus}</span>
                    {' → '}
                    <span className="font-medium">{entry.toStatus}</span>
                  </div>
                  {entry.comment && (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {entry.comment}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="pt-4 text-xs text-gray-500 border-t border-gray-200">
        This progress was verified and pushed from the Local Research Lab at {verificationTimestamp}.
      </footer>
    </main>
  );
}
