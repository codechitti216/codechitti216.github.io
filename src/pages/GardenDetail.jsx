import { Link, useParams } from 'react-router-dom';

export default function GardenDetail() {
  const { id } = useParams();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold text-gray-900">Garden entry</h1>
      <p className="mt-2 font-mono text-sm text-gray-500">{id}</p>
      <p className="mt-4 text-gray-600">Garden detail view is not wired in this checkout.</p>
      <Link to="/garden" className="mt-6 inline-block text-blue-600 hover:underline">
        ← Back to garden
      </Link>
    </div>
  );
}
