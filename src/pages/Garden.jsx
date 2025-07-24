import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadGardenPosts } from '../lib/loadGarden';

export default function Garden() {
  const gardenData = loadGardenPosts();
  const allTags = ['All', ...new Set(gardenData.flatMap(entry => entry.tags))];
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
      ? gardenData
      : gardenData.filter((entry) =>
          entry.tags.some((tag) => selectedTags.includes(tag))
        );

  return (
    <main className="container">
      <h1 className="text-2xl font-bold mb-4">Garden</h1>
      <p className="mb-6">Thoughts and ideas in progress.</p>

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
            <h2 className="text-xl font-semibold">
              <Link to={`/garden/${entry.id}`} className="hover:underline text-blue-600">
                {entry.title}
              </Link>
            </h2>
            <p className="text-sm text-gray-500">{entry.date}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

