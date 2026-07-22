import { Link } from 'react-router-dom';
import { Github, Mail, Linkedin } from 'lucide-react';
import { useMemo } from 'react';
import { getAllContent } from '../lib/content';

export default function Home() {
  const recentWork = useMemo(() => getAllContent().slice(0, 5), []);

  return (
    <div className="py-12 space-y-14">
      {/* Bio */}
      <section className="space-y-3">
        <h1 className="font-serif text-3xl font-semibold text-gray-900">
          Surya Chitti
        </h1>
        <p className="text-base text-gray-600 leading-relaxed max-w-lg">
          ML Research Engineer. Building and understanding deep learning systems
          across perception, language, and reinforcement learning.
          M.Sc. Mathematics, BITS Pilani.
        </p>
        <div className="flex items-center gap-5 pt-1 text-sm text-gray-400">
          <a href="mailto:suryachitti216@gmail.com" className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
            <Mail className="h-3.5 w-3.5" /> Email
          </a>
          <a href="https://github.com/codechitti216" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
          <a href="https://linkedin.com/in/suryachitti" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </a>
        </div>
      </section>

      {/* Recent work */}
      {recentWork.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-lg font-semibold text-gray-900">Recent work</h2>
            <Link to="/notes" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              View all &rarr;
            </Link>
          </div>
          <div className="space-y-1">
            {recentWork.map(item => (
                <Link
                  key={item.slug}
                  to={`/notes/${item.slug}`}
                  className="block group py-2.5 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-900 group-hover:text-gray-500 transition-colors truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">
                      {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>
                </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
