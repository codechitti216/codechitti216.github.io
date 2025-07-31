import { useParams } from 'react-router-dom';
import { loadGardenPosts } from '../lib/loadGarden';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function GardenDetail() {
  const { id } = useParams();
  const posts = loadGardenPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="container">
        <h1 className="text-2xl font-bold text-red-600">Post not found</h1>
        <p className="text-gray-600">No garden entry found for "{id}".</p>
      </div>
    );
  }

  return (
    <article className="container prose max-w-none">
      <h1>{post.title}</h1>
      <p className="text-sm text-gray-500">{post.date}</p>
      <div className="mb-4">
        {post.tags.map((tag) => (
          <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
            {tag}
          </span>
        ))}
      </div>

      <MarkdownRenderer content={post.content} />
    </article>
  );
}

