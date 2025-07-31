import fm from 'front-matter';

export function loadProjectPosts() {
  try {
    const modules = import.meta.glob('/content/projects/*.md', { query: '?raw', import: 'default', eager: true });

    const posts = Object.entries(modules).map(([path, rawContent]) => {
      try {
        const { attributes: data, body: content } = fm(rawContent);
        const slug = path.split('/').pop().replace('.md', '');

        return {
          id: slug,
          title: data.title || slug,
          date: data.date || 'Unknown',
          tags: Array.isArray(data.tags) ? data.tags : [],
          status: data.status || 'draft',
          institution: data.institution || '',
          duration: data.duration || '',
          excerpt: data.excerpt || '',
          content,
        };
      } catch (error) {
        console.warn(`Error parsing markdown file ${path}:`, error);
        const slug = path.split('/').pop().replace('.md', '');
        return {
          id: slug,
          title: slug,
          date: 'Unknown',
          tags: [],
          status: 'draft',
          institution: '',
          duration: '',
          excerpt: '',
          content: 'Error loading content',
        };
      }
    });

    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error loading project posts:', error);
    return [];
  }
} 