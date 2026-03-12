import React from 'react';

const entries = [
  {
    "timestamp": "2026-03-12T21:23:47.826Z",
    "cardId": "1773350625162-32646761691bb",
    "title": "dummy",
    "track": "#Code",
    "fromStatus": "Concepts & Ideas",
    "toStatus": "Setup",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:23:50.258Z",
    "cardId": "1773350625162-32646761691bb",
    "title": "dummy",
    "track": "#Code",
    "fromStatus": "Setup",
    "toStatus": "Sandboxing",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:23:52.156Z",
    "cardId": "1773350625162-32646761691bb",
    "title": "dummy",
    "track": "#Code",
    "fromStatus": "Sandboxing",
    "toStatus": "Results",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:23:54.867Z",
    "cardId": "1773350625162-32646761691bb",
    "title": "dummy",
    "track": "#Code",
    "fromStatus": "Results",
    "toStatus": "Artifacts",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:23:56.882Z",
    "cardId": "1773350625162-32646761691bb",
    "title": "dummy",
    "track": "#Code",
    "fromStatus": "Artifacts",
    "toStatus": "Broadcast",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:48:33.716Z",
    "cardId": "1773352111402-27d22f836c0dd",
    "title": "s",
    "track": "#Math",
    "fromStatus": "Concepts & Ideas",
    "toStatus": "Setup",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:48:36.179Z",
    "cardId": "1773352111402-27d22f836c0dd",
    "title": "s",
    "track": "#Math",
    "fromStatus": "Setup",
    "toStatus": "Results",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:48:38.011Z",
    "cardId": "1773352111402-27d22f836c0dd",
    "title": "s",
    "track": "#Math",
    "fromStatus": "Results",
    "toStatus": "Artifacts",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:48:41.164Z",
    "cardId": "1773352111402-27d22f836c0dd",
    "title": "s",
    "track": "#Math",
    "fromStatus": "Artifacts",
    "toStatus": "Broadcast",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:51:30.434Z",
    "cardId": "1773352111402-27d22f836c0dd",
    "title": "s",
    "track": "#Math",
    "fromStatus": "Broadcast",
    "toStatus": "Artifacts",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:51:32.603Z",
    "cardId": "1773352111402-27d22f836c0dd",
    "title": "s",
    "track": "#Math",
    "fromStatus": "Artifacts",
    "toStatus": "Broadcast",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:52:18.147Z",
    "cardId": "1773352335250-90dd70b55a857",
    "title": "f",
    "track": "#Code",
    "fromStatus": "Concepts & Ideas",
    "toStatus": "Setup",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:52:21.330Z",
    "cardId": "1773352335250-90dd70b55a857",
    "title": "f",
    "track": "#Code",
    "fromStatus": "Setup",
    "toStatus": "Sandboxing",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:52:23.386Z",
    "cardId": "1773352335250-90dd70b55a857",
    "title": "f",
    "track": "#Code",
    "fromStatus": "Sandboxing",
    "toStatus": "Results",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:52:25.459Z",
    "cardId": "1773352335250-90dd70b55a857",
    "title": "f",
    "track": "#Code",
    "fromStatus": "Results",
    "toStatus": "Artifacts",
    "comment": ""
  },
  {
    "timestamp": "2026-03-12T21:52:27.707Z",
    "cardId": "1773352335250-90dd70b55a857",
    "title": "f",
    "track": "#Code",
    "fromStatus": "Artifacts",
    "toStatus": "Broadcast",
    "comment": ""
  }
];
const verificationTimestamp = '2026-03-12T21:52:37.049Z';
const storyDate = '2026-03-12';

export default function StoryFor2026_03_12() {
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
