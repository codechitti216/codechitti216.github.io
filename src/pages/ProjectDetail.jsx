import { useParams, Link } from 'react-router-dom';

export default function ProjectDetail() {
  const { id } = useParams();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold text-gray-900">Project {id}</h1>
      <p className="mt-4 text-gray-600">Detail page placeholder.</p>
      <Link to="/projects" className="mt-6 inline-block text-blue-600 hover:underline">
        ← Back to projects
      </Link>
    </div>
  );
}
