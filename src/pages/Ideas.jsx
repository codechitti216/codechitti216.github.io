import { Lightbulb } from 'lucide-react';

const ideas = [];

export default function Ideas() {
  return (
    <div className="py-8 space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-gray-900">Ideas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Questions I want to investigate. No detail until work begins.
        </p>
      </div>

      {ideas.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-gray-200 rounded-lg">
          <Lightbulb className="h-5 w-5 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-300">No questions yet. They'll come from the work.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {ideas.map((idea, i) => (
            <li key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-300 text-sm mt-0.5">?</span>
              <div>
                <p className="text-sm text-gray-900">{idea.question}</p>
                {idea.link && (
                  <a href={idea.link} className="text-xs text-gray-400 hover:text-gray-700 transition-colors mt-1 inline-block">
                    Started &rarr;
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
