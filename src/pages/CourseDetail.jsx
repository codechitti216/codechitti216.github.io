import { useParams, Link } from 'react-router-dom';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import learningData from '../data/learning.json';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function parseTime(timeStr) {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const course = useMemo(
    () => learningData.courses.find(c => c.id === courseId),
    [courseId]
  );

  const [selectedLecture, setSelectedLecture] = useState(
    course?.lectures?.[0] || null
  );

  if (!course) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Course not found.</p>
        <Link to="/learning" className="mt-4 inline-block text-sm text-gray-400 hover:text-gray-900">
          &larr; Back to learning
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <Link to="/learning" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
        &larr; back to learning
      </Link>

      <div>
        <h1 className="font-serif text-2xl font-semibold text-gray-900">{course.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{course.instructor}</p>
        {course.lectures.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            {course.lectures.length} lecture{course.lectures.length !== 1 ? 's' : ''} watched
          </p>
        )}
      </div>

      {course.lectures.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-300">No lectures watched yet. Start watching and add notes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Lecture selector */}
          <div className="flex flex-wrap gap-2">
            {course.lectures.map((lecture, i) => (
              <button
                key={i}
                onClick={() => setSelectedLecture(lecture)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedLecture === lecture
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {lecture.number}. {lecture.title}
              </button>
            ))}
          </div>

          {/* Selected lecture */}
          {selectedLecture && (
            <LectureView lecture={selectedLecture} />
          )}
        </div>
      )}
    </div>
  );
}

function LectureView({ lecture }) {
  const playerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);

  // Initialize YouTube player
  useEffect(() => {
    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: lecture.youtubeId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => setPlayerReady(true),
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [lecture.youtubeId]);

  const seekTo = useCallback((seconds) => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
    }
  }, []);

  const sortedNotes = useMemo(
    () => [...(lecture.notes || [])].sort((a, b) => parseTime(a.timestamp) - parseTime(b.timestamp)),
    [lecture.notes]
  );

  return (
    <div className="space-y-6">
      {/* Video header */}
      <div>
        <h2 className="font-serif text-lg font-semibold text-gray-900">
          Lecture {lecture.number}: {lecture.title}
        </h2>
        {lecture.date && (
          <p className="text-xs text-gray-400 mt-1">
            Watched: {new Date(lecture.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* YouTube embed */}
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <div id="yt-player" className="w-full h-full" />
      </div>

      {/* Timestamped notes */}
      {sortedNotes.length > 0 ? (
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Notes</h3>
          {sortedNotes.map((note, i) => (
            <div
              key={i}
              className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 group"
            >
              <button
                onClick={() => seekTo(parseTime(note.timestamp))}
                className="text-xs font-mono text-gray-400 hover:text-gray-900 transition-colors mt-0.5 shrink-0 min-w-[3rem]"
                title="Jump to this point in the video"
              >
                {note.timestamp}
              </button>
              <p className="text-sm text-gray-700 leading-relaxed">{note.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center border border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-300">No notes for this lecture yet.</p>
        </div>
      )}
    </div>
  );
}
