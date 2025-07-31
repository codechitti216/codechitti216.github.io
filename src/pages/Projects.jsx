import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadProjectPosts } from '../lib/loadProjects';

export default function Projects() {
  const projects = loadProjectPosts();
  const allTags = ['All', ...new Set(projects.flatMap(project => Array.isArray(project.tags) ? project.tags : []))];
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

  const filteredProjects =
    selectedTags.length === 0
      ? projects
      : projects.filter((project) =>
          Array.isArray(project.tags) && project.tags.some((tag) => selectedTags.includes(tag))
        );

  return (
    <main className="container">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <p className="mb-6">A collection of my research projects, technical implementations, and experimental work.</p>

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
        {filteredProjects.map((project) => (
          <article key={project.id} className="content-card">
            <h2 className="text-xl font-semibold">
              <Link to={`/projects/${project.id}`} className="hover:underline text-blue-600">
                {project.title}
              </Link>
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span>{project.duration}</span>
              <span className="text-gray-400">•</span>
              <span>{project.institution}</span>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              {project.excerpt}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.isArray(project.tags) && project.tags.map(tag => (
                <span key={tag} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Link to={`/projects/${project.id}`} className="text-blue-600 hover:underline text-sm">
                Read More
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

