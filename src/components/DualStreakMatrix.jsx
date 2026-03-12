import kanban from '../data/kanban.json';
import storyLinks from '../data/storyLinks.json';

const RESOLVED_STATUS = 'resolved';
const TRACKS = ['Math', 'Code'];
const WEEK_COUNT = 12;

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function getWeekStart(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const day = d.getDay(); // 0-6, Sunday = 0
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildWeeks() {
  const now = new Date();
  const start = getWeekStart(now);
  const weeks = [];
  for (let i = WEEK_COUNT - 1; i >= 0; i -= 1) {
    const d = new Date(start);
    d.setDate(start.getDate() - i * 7);
    weeks.push(d);
  }
  return weeks;
}

export default function DualStreakMatrix({ trackFilter = 'All' }) {
  const resolved = kanban.filter((task) => normalize(task.status) === RESOLVED_STATUS);
  const normalizedTrackFilter = normalize(trackFilter);
  const visibleTracks =
    normalizedTrackFilter === 'all'
      ? TRACKS
      : TRACKS.filter((track) => normalize(track) === normalizedTrackFilter);
  const weeks = buildWeeks();
  const bucket = new Map();

  for (const task of resolved) {
    const weekStart = getWeekStart(task.updatedAt);
    if (!weekStart) continue;
    const key = weekStart.toISOString().slice(0, 10);
    const track = TRACKS.find((t) => normalize(t) === normalize(task.track));
    if (!track) continue;
    const entry = bucket.get(key) || new Set();
    entry.add(track);
    bucket.set(key, entry);
  }

  if (!resolved.length) {
    return <p className="text-sm text-gray-500">No Resolved tasks yet.</p>;
  }

  return (
    <section className="space-y-2">
      {visibleTracks.map((track) => (
        <div key={track} className="flex items-center gap-3">
          <div className="w-14 text-xs uppercase tracking-wide text-muted-foreground">
            {track}
          </div>
          <div className="grid grid-cols-12 gap-1">
            {weeks.map((week) => {
              const key = week.toISOString().slice(0, 10);
              const active = bucket.get(key)?.has(track);
              const storyDate = storyLinks?.[track]?.[key];
              const className = `h-4 w-4 rounded-sm border ${
                active ? 'bg-emerald-500 border-emerald-600' : 'bg-gray-100 border-gray-200'
              } ${storyDate ? 'cursor-pointer hover:ring-2 hover:ring-emerald-400' : ''}`;

              if (active && storyDate) {
                return (
                  <a
                    key={`${track}-${key}`}
                    href={`/stories/${storyDate}`}
                    className={className}
                    aria-label={`${track} ${key} win → story for ${storyDate}`}
                  />
                );
              }

              return (
                <span
                  key={`${track}-${key}`}
                  className={className}
                  aria-label={`${track} ${key} ${active ? 'resolved' : 'empty'}`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

