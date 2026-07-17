import { Link, useParams } from 'react-router-dom';

export default function NoteDetail() {
  const { id } = useParams();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold text-gray-900">Note</h1>
      <p className="mt-2 font-mono text-sm text-gray-500">{id}</p>
      <p className="mt-4 text-gray-600">Note detail view is being built.</p>
      <Link to="/notes" className="mt-6 inline-block text-sm text-gray-500 hover:text-gray-900 transition-colors">
        &larr; Back to notes
      </Link>
    </div>
  );
}
