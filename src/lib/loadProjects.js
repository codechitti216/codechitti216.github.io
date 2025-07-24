import matter from 'gray-matter';

export function loadProjectPosts() {
  const modules = import.meta.glob('/content/projects/*.md', { as: 'raw', eager: true });

  const posts = Object.entries(modules).map(([path, rawContent]) => {
    const { data, content } = matter(rawContent);
    const slug = path.split('/').pop().replace('.md', '');

    return {
      id: slug,
      title: data.title || slug,
      date: data.date || 'Unknown',
      tags: data.tags || [],
      status: data.status || 'draft',
      institution: data.institution || '',
      duration: data.duration || '',
      excerpt: data.excerpt || '',
      content,
    };
  });

  // Sort by date (optional)
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
} 