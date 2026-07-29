import { BookOpen, Video, FileText, Mic } from 'lucide-react';

const sections = [
  {
    id: 'courses',
    title: 'Courses',
    icon: Video,
    description: 'Lecture series I\'m watching. Progress and notes per lecture.',
    items: [],
  },
  {
    id: 'textbooks',
    title: 'Textbooks',
    icon: BookOpen,
    description: 'Books I\'m reading. Chapter progress and annotated notes.',
    items: [],
  },
  {
    id: 'papers',
    title: 'Papers',
    icon: FileText,
    description: 'Research papers I\'ve read. Reactions, not summaries.',
    items: [],
  },
  {
    id: 'talks',
    title: 'Talks',
    icon: Mic,
    description: 'One-off videos, seminars, and blog posts worth noting.',
    items: [],
  },
];

export default function Learning() {
  return (
    <div className="py-8 space-y-10">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-gray-900">Learning</h1>
        <p className="mt-1 text-sm text-gray-500">
          What I'm studying, reading, and watching. Full history with notes.
        </p>
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <section key={section.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-gray-400" />
              <h2 className="font-serif text-lg font-semibold text-gray-900">{section.title}</h2>
            </div>
            <p className="text-xs text-gray-400">{section.description}</p>

            {section.items.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-300">Nothing here yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <div key={i} className="py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700">{item.title}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
