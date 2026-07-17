import { Link } from 'react-router-dom';

export default function Notes() {
  const notes = [
    {
      id: "Gaussian_Splatting",
      title: "Gaussian Splatting: From Theory to 54-Gaussian Optimization",
      date: "2025",
      status: "growing",
      topic: "3D Reconstruction",
      summary: "Built 54 trainable Gaussians to reconstruct a Rubik's cube. Discovered spontaneous geometric self-organization from 2D supervision alone.",
    },
  ];

  const planned = [
    { title: "Self-Supervised Depth Estimation", topic: "Perception" },
    { title: "Knowledge Distillation", topic: "Training" },
    { title: "BEV Representations", topic: "Perception" },
    { title: "Sensor Calibration (PnP, Hand-Eye)", topic: "Geometry" },
    { title: "Graph Neural Networks for QA", topic: "NLP / Graphs" },
  ];

  return (
    <div className="space-y-10 py-4">
      <section>
        <h1 className="font-serif text-3xl font-semibold text-gray-900">Notes</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-xl">
          Things I'm learning and investigating. Some are deep write-ups, some are
          rough sketches. They grow over time.
        </p>
      </section>

      <section className="space-y-4">
        {notes.map((note) => (
          <Link key={note.id} to={`/notes/${note.id}`} className="block group">
            <article className="border-l-2 border-gray-200 pl-5 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                <time className="text-xs text-gray-400 uppercase tracking-wide">{note.date}</time>
                <span className="text-xs text-gray-300">{note.topic}</span>
              </div>
              <h2 className="font-serif text-lg font-medium text-gray-900 group-hover:text-blue-700 transition-colors mt-1">
                {note.title}
              </h2>
              <p className="mt-1 text-sm text-gray-600">{note.summary}</p>
            </article>
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-gray-900">Planned</h2>
        <div className="space-y-2">
          {planned.map((note) => (
            <div key={note.title} className="flex items-center gap-3 border-l-2 border-gray-100 pl-5 py-1.5 opacity-50">
              <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
              <span className="text-sm text-gray-700">{note.title}</span>
              <span className="text-xs text-gray-400">{note.topic}</span>
            </div>
          ))}
        </div>
      </section>

      <Link to="/" className="inline-block text-sm text-gray-500 hover:text-gray-900 transition-colors">
        &larr; Home
      </Link>
    </div>
  );
}
