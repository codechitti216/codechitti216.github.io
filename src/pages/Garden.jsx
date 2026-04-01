import { Link } from 'react-router-dom';

export default function Garden() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold text-gray-900">Knowledge garden</h1>
      <p className="mt-4 text-gray-600">Garden index placeholder.</p>
      <Link to="/" className="mt-6 inline-block text-blue-600 hover:underline">
        ← Home
      </Link>
    </div>
  );
}
