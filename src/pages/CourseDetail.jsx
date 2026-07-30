import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import learningData from '../data/learning.json';

const ADMIN_PASSWORD = 'surya2025';

function parseTime(timeStr) {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function formatSeconds(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('surya-admin') === 'true';
  });

  const login = useCallback(() => {
    const pwd = window.prompt('Password:');
    if (pwd === ADMIN_PASSWORD) {
      localStorage.setItem('surya-admin', 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('surya-admin');
    setIsAdmin(false);
  }, []);

  return { isAdmin, login, logout };
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const { isAdmin, login, logout } = useAdminMode();

  // If ?admin is in URL, prompt for login
  useEffect(() => {
    if (searchParams.get('admin') !== null && !isAdmin) {
      login();
    }
  }, [searchParams, isAdmin, login]);

  const [courseData, setCourseData] = useState(() => {
    const saved = localStorage.getItem(`course-${courseId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return learningData.courses.find(c => c.id === courseId) || null;
  });

  const [selectedLecture, setSelectedLecture] = useState(
    courseData?.lectures?.[0] || null
  );

  // Persist course data changes
  const updateCourseData = useCallback((newData) => {
    setCourseData(newData);
    localStorage.setItem(`course-${courseId}`, JSON.stringify(newData));
  }, [courseId]);

  if (!courseData) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Course not found.</p>
        <Link to="/learning" className="mt-4 inline-block text-sm text-gray-400 hover:text-gray-900">
          &larr; Back to learning
        </Link>
      </div>
    );
  }

  const addLecture = (lecture) => {
    const updated = {
      ...courseData,
      lectures: [...courseData.lectures, lecture],
    };
    updateCourseData(updated);
    setSelectedLecture(lecture);
  };

  const addNoteToLecture = (lectureNumber, note) => {
    const updated = {
      ...courseData,
      lectures: courseData.lectures.map(l =>
        l.number === lectureNumber
          ? { ...l, notes: [...(l.notes || []), note] }
          : l
      ),
    };
    updateCourseData(updated);
    // Update selected lecture reference
    setSelectedLecture(updated.lectures.find(l => l.number === lectureNumber));
  };

  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/learning" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
          &larr; back to learning
        </Link>
        {isAdmin && (
          <button onClick={logout} className="text-[10px] text-gray-300 hover:text-gray-500">
            exit edit mode
          </button>
        )}
      </div>

      <div>
        <h1 className="font-serif text-2xl font-semibold text-gray-900">{courseData.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{courseData.instructor}</p>
        {courseData.lectures.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            {courseData.lectures.length}/{courseData.totalLectures || '?'} lectures watched
          </p>
        )}
      </div>

      {/* Lecture selector */}
      {courseData.lectures.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {courseData.lectures.map((lecture, i) => (
            <button
              key={i}
              onClick={() => setSelectedLecture(lecture)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedLecture?.number === lecture.number
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {lecture.number}. {lecture.title}
            </button>
          ))}
        </div>
      )}

      {/* Add lecture button (admin only) */}
      {isAdmin && <AddLectureForm onAdd={addLecture} nextNumber={(courseData.lectures.length || 0) + 1} />}

      {/* Selected lecture */}
      {selectedLecture && (
        <LectureView
          lecture={selectedLecture}
          isAdmin={isAdmin}
          onAddNote={(note) => addNoteToLecture(selectedLecture.number, note)}
        />
      )}

      {courseData.lectures.length === 0 && !isAdmin && (
        <div className="py-12 text-center border border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-300">No lectures watched yet.</p>
        </div>
      )}
    </div>
  );
}

function AddLectureForm({ onAdd, nextNumber }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const extractVideoId = (url) => {
    const match = url.match(/(?:v=|\/)([\w-]{11})/);
    return match ? match[1] : url;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !youtubeUrl) return;
    onAdd({
      number: nextNumber,
      title,
      youtubeId: extractVideoId(youtubeUrl),
      date: new Date().toISOString().split('T')[0],
      notes: [],
    });
    setTitle('');
    setYoutubeUrl('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg px-4 py-2 w-full transition-colors"
      >
        + Add lecture
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 space-y-3">
      <input
        type="text"
        placeholder="Lecture title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-gray-400"
      />
      <input
        type="text"
        placeholder="YouTube URL or video ID"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-gray-400"
      />
      <div className="flex gap-2">
        <button type="submit" className="text-xs bg-gray-900 text-white px-4 py-1.5 rounded hover:bg-gray-700">
          Add
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-700">
          Cancel
        </button>
      </div>
    </form>
  );
}

function LectureView({ lecture, isAdmin, onAddNote }) {
  const playerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [capturedTime, setCapturedTime] = useState(null);
  const playerContainerId = `yt-player-${lecture.youtubeId}`;

  // Initialize YouTube player
  useEffect(() => {
    setPlayerReady(false);

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      // Clear the container
      const container = document.getElementById(playerContainerId);
      if (!container) return;
      container.innerHTML = '';

      const playerDiv = document.createElement('div');
      playerDiv.id = `yt-inner-${lecture.youtubeId}`;
      container.appendChild(playerDiv);

      playerRef.current = new window.YT.Player(playerDiv.id, {
        videoId: lecture.youtubeId,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => setPlayerReady(true),
        },
      });
    };

    if (window.YT && window.YT.Player) {
      // Small delay to ensure DOM is ready
      setTimeout(initPlayer, 100);
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [lecture.youtubeId, playerContainerId]);

  const seekTo = useCallback((seconds) => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
    }
  }, []);

  const captureTimestamp = useCallback(() => {
    if (playerRef.current && playerRef.current.getCurrentTime) {
      const time = playerRef.current.getCurrentTime();
      setCapturedTime(time);
      // Pause the video so user can write
      if (playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
      }
    }
  }, []);

  const handleAddNote = useCallback(() => {
    if (!noteText.trim() || capturedTime === null) return;
    onAddNote({
      timestamp: formatSeconds(capturedTime),
      text: noteText.trim(),
    });
    setNoteText('');
    setCapturedTime(null);
    // Resume playback
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
    }
  }, [noteText, capturedTime, onAddNote]);

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
        <div id={playerContainerId} className="w-full h-full" />
      </div>

      {/* Admin: capture note */}
      {isAdmin && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          {capturedTime === null ? (
            <button
              onClick={captureTimestamp}
              className="text-xs bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 w-full"
            >
              Capture note at current timestamp
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {formatSeconds(capturedTime)}
                </span>
                <span className="text-xs text-gray-400">Write your note:</span>
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="What did you just learn or notice?"
                className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-gray-400 min-h-[60px]"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddNote}
                  className="text-xs bg-gray-900 text-white px-4 py-1.5 rounded hover:bg-gray-700"
                >
                  Save note
                </button>
                <button
                  onClick={() => { setCapturedTime(null); setNoteText(''); }}
                  className="text-xs text-gray-400 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Timestamped notes */}
      {sortedNotes.length > 0 ? (
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Notes</h3>
          {sortedNotes.map((note, i) => (
            <div
              key={i}
              className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0"
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
        !isAdmin && (
          <div className="py-6 text-center border border-dashed border-gray-200 rounded-lg">
            <p className="text-sm text-gray-300">No notes for this lecture yet.</p>
          </div>
        )
      )}
    </div>
  );
}
