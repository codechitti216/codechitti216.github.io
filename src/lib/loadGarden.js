import fm from 'front-matter';

export function loadGardenPosts() {
  const modules = import.meta.glob('/content/garden/*.md', { query: '?raw', import: 'default', eager: true });

  const posts = Object.entries(modules).map(([path, rawContent]) => {
    const { attributes: data, body: content } = fm(rawContent);
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

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
} 