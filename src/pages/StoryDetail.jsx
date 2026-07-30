import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import storiesData from '../data/stories.json';
import StoryTree from '../components/StoryTree';

export default function StoryDetail() {
  const { storyId } = useParams();
  const story = useMemo(
    () => storiesData.stories.find(s => s.id === storyId),
    [storyId]
  );

  if (!story) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Not found.</p>
        <Link to="/notes" className="mt-4 inline-block text-sm text-gray-400 hover:text-gray-900">
          &larr; Back to work
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <Link to="/notes" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
        &larr; back to work
      </Link>

      <div className="space-y-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded border text-indigo-700 bg-indigo-50 border-indigo-200">
          Storyline
        </span>
        <h1 className="font-serif text-2xl font-semibold text-gray-900">
          {story.title}
        </h1>
        {story.subtitle && (
          <p className="text-sm text-gray-500">{story.subtitle}</p>
        )}
        {story.sources && story.sources.length > 0 && (
          <p className="text-xs text-gray-400">
            Sources: {story.sources.join(' · ')}
          </p>
        )}
      </div>

      {story.intro && (
        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
          {story.intro}
        </p>
      )}

      <StoryTree story={story} />
    </div>
  );
}
