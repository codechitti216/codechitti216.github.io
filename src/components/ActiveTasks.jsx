import kanban from '../data/kanban.json';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const STATUS_BADGE = {
  hypothesis: 'bg-blue-100 text-blue-800',
  sandboxing: 'bg-yellow-100 text-yellow-800',
  resolved:   'bg-emerald-100 text-emerald-800',
};

const TRACK_BADGE = {
  math: 'bg-purple-100 text-purple-800',
  code: 'bg-orange-100 text-orange-800',
};

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export default function ActiveTasks({ trackFilter = 'All' }) {
  const normalizedTrack = normalize(trackFilter);
  const tasks = kanban.filter((task) =>
    normalizedTrack === 'all' ? true : normalize(task.track) === normalizedTrack
  );

  if (!tasks.length) {
    return (
      <p className="text-sm text-gray-400 italic py-2">
        No tasks{normalizedTrack !== 'all' ? ` in the ${trackFilter} track` : ''} yet.
      </p>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <Card key={task.id} className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base leading-snug">{task.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[normalize(task.status)] || 'bg-gray-100 text-gray-700'}`}>
              {task.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${TRACK_BADGE[normalize(task.track)] || 'bg-gray-100 text-gray-700'}`}>
              {task.track}
            </span>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
