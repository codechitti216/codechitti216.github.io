import { Link } from 'react-router-dom';
import { loadGardenPosts } from '../lib/loadGarden';

export default function Garden() {
  const gardenData = loadGardenPosts();

  return (
    <main className="container">
      <h1 className="text-2xl font-bold mb-4">Garden</h1>
      <p className="mb-6">Thoughts and ideas in progress.</p>

      <section className="grid gap-4">
        {gardenData.map((entry) => (
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

