import { FileText } from 'lucide-react';
import seriesData from '../data/lecture-series.json';

export default function LectureSeries() {
  if (!seriesData.series || seriesData.series.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-lg font-semibold text-gray-900">Lecture series that shaped how I think</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {seriesData.series.map((s, i) => (
          <div key={i} className="group border border-gray-100 rounded-lg overflow-hidden hover:border-gray-200 transition-colors">
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              <img
                src={s.thumbnail}
                alt={s.title}
                className="w-full aspect-video object-cover"
                loading="lazy"
              />
            </a>
            <div className="p-3 space-y-2">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors block"
              >
                {s.title}
              </a>
              {s.pdf && (
                <a
                  href={s.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <FileText className="h-3 w-3" /> Notes (PDF)
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
