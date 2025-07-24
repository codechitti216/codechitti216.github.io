import matter from 'gray-matter';

export function loadGardenPosts() {
  const modules = import.meta.glob('/content/garden/*.md', { as: 'raw', eager: true });

  const posts = Object.entries(modules).map(([path, rawContent]) => {
    const { data, content } = matter(rawContent);
    const slug = path.split('/').pop().replace('.md', '');

    return {
      id: slug,
      title: data.title || slug,
      date: data.date || 'Unknown',
      tags: data.tags || [],
      status: data.status || 'draft',
      content,
    };
  });

  // Sort by date (optional)
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
} 