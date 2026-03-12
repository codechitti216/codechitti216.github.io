import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadGardenPosts } from '../lib/loadGarden';

export default function Garden() {
  console.log('🔍 DEBUG: Garden component rendering');
  console.log('🔍 DEBUG: About to load garden posts');
  const gardenData = loadGardenPosts();
  console.log('🔍 DEBUG: Garden data loaded, total posts:', gardenData.length);
  
  // Filter for public posts only
  const publicEntries = gardenData.filter(entry => entry.published === true);
  console.log('🔍 DEBUG: Public entries filtered:', publicEntries.length);
  
  const allTags = ['All', ...new Set(publicEntries.flatMap(entry => Array.isArray(entry.tags) ? entry.tags : []))];
  const [selectedTags, setSelectedTags] = useState([]);

  const handleTagClick = (tag) => {
    if (tag === 'All') {
      setSelectedTags([]);
    } else {
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    }
  };

  const filteredEntries =
    selectedTags.length === 0
      ? publicEntries
      : publicEntries.filter((entry) =>
          Array.isArray(entry.tags) && entry.tags.some((tag) => selectedTags.includes(tag))
        );

  return (
    <main className="container">
      <h1 className="text-2xl font-bold mb-4">Garden</h1>
      <p className="mb-6">A growing record of my ideas, experiments, fundamentals I revisit, and new directions I explore as AI continues to evolve.</p>

      {/* Tag Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {allTags.map(tag => (
          <button
            key={tag}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              (tag === 'All' && selectedTags.length === 0) || (tag !== 'All' && selectedTags.includes(tag))
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-blue-100'
            }`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <section className="grid gap-4">
        {filteredEntries.map((entry) => (
          <article key={entry.id} className="content-card">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                <Link to={`/garden/${entry.id}`} className="hover:underline text-blue-600">
                  {entry.title}
                </Link>
              </h2>
              <div className="text-sm text-gray-600">
                <span>{entry.date}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

