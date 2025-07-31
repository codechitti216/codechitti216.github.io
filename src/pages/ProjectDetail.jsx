import { useParams, Link } from 'react-router-dom';
import { loadProjectPosts } from '../lib/loadProjects';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function ProjectDetail() {
  const { id } = useParams();
  const projects = loadProjectPosts();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="container">
        <h1 className="text-2xl font-bold text-red-600">Project not found</h1>
        <p className="text-gray-600">No project entry found for "{id}".</p>
        <Link to="/projects" className="text-blue-600 hover:underline">Back to Projects</Link>
      </div>
    );
  }

  return (
    <article className="container prose max-w-none">
      <h1>{project.title}</h1>
      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
        <span>{project.duration}</span>
        <span className="text-gray-400">•</span>
        <span>{project.institution}</span>
      </div>
      <div className="mb-4">
        {project.tags.map((tag) => (
          <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
            {tag}
          </span>
        ))}
      </div>
      <MarkdownRenderer content={project.content} />
      <div className="pt-8 border-t border-gray-200 mt-8">
        <Link to="/projects" className="text-blue-600 hover:underline">Back to Projects</Link>
      </div>
    </article>
  );
}

