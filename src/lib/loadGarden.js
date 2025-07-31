import fm from 'front-matter';

export function loadGardenPosts() {
  try {
    const modules = import.meta.glob('/content/garden/*.md', { query: '?raw', import: 'default', eager: true });
    
    console.log('[DEBUG] Garden modules found:', Object.keys(modules));

    const posts = Object.entries(modules).map(([path, rawContent]) => {
      try {
        console.log('[DEBUG] Processing garden file:', path);
        console.log('[DEBUG] Raw content length:', rawContent ? rawContent.length : 'null');
        
        if (!rawContent) {
          console.warn('[DEBUG] No content found for:', path);
          const slug = path.split('/').pop().replace('.md', '');
          return {
            id: slug,
            title: slug,
            date: 'Unknown',
            tags: [],
            status: 'draft',
            content: 'No content available',
          };
        }

        const { attributes: data, body: content } = fm(rawContent);
        const slug = path.split('/').pop().replace('.md', '');

        console.log('[DEBUG] Parsed garden post:', { slug, title: data.title, contentLength: content.length });

        return {
          id: slug,
          title: data.title || slug,
          date: data.date || 'Unknown',
          tags: Array.isArray(data.tags) ? data.tags : [],
          status: data.status || 'draft',
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
          content: 'Error loading content',
        };
      }
    });

    console.log('[DEBUG] Total garden posts loaded:', posts.length);
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error loading garden posts:', error);
    return [];
  }
} 