import { Link } from 'react-router-dom';

export default function Notes() {
  return (
    <div className="space-y-8 py-4">
      <section>
        <h1 className="font-serif text-2xl font-semibold text-gray-900">Notes</h1>
        <p className="mt-2 text-sm text-gray-400">
          What I&apos;m learning, written so I can come back to it later.
        </p>
      </section>

      <section className="space-y-4">
        <Link to="/notes/Gaussian_Splatting" className="block group">
          <article className="py-2">
            <time className="text-xs text-gray-300">2025</time>
            <h2 className="text-sm font-medium text-gray-800 group-hover:text-gray-600 transition-colors">
              Gaussian Splatting: From Theory to 54-Gaussian Optimization
            </h2>
          </article>
        </Link>
      </section>

      <Link to="/" className="inline-block text-xs text-gray-300 hover:text-gray-600 transition-colors">
        &larr; home
      </Link>
    </div>
  );
}
