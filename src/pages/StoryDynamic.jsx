import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';

// Vite will build a lazy bundle for each story page we generate under ./stories
const storyModules = import.meta.glob('./stories/*.jsx');

export default function StoryDynamic() {
  const { date } = useParams();
  const key = `./stories/${date}.jsx`;
  const importFn = storyModules[key];

  if (!importFn) {
    return (
      <main className="max-w-3xl mx-auto py-10 px-4 space-y-4">
        <h1 className="text-2xl font-semibold">Story not found</h1>
        <p className="text-sm text-gray-600">
          No narrative is available for <code>{date}</code>. Make sure you have pushed from the
          Local Research Lab for this date.
        </p>
      </main>
    );
  }

  const StoryComponent = React.lazy(importFn);

  return (
    <Suspense
      fallback={
        <main className="max-w-3xl mx-auto py-10 px-4">
          <p className="text-sm text-gray-600">Loading story…</p>
        </main>
      }
    >
      <StoryComponent />
    </Suspense>
  );
}


