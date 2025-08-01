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
            hypothesis: null,
            experiment: {},
            results: {},
            next_action: null,
            content: 'No content available',
          };
        }

        const { attributes: data, body: content } = fm(rawContent);
        const slug = path.split('/').pop().replace('.md', '');

        console.log('[DEBUG] Parsed garden post:', { slug, title: data.title, contentLength: content.length });

        // Parse extended research discipline fields
        const experiment = data.experiment || {};
        const results = data.results || {};
        
        // Calculate staleness for experiments
        const lastUpdated = data.date ? new Date(data.date) : new Date();
        const daysSinceUpdate = Math.floor((new Date() - lastUpdated) / (1000 * 60 * 60 * 24));
        const isStale = experiment.defined && !results.executed && daysSinceUpdate > 7;

        return {
          id: slug,
          title: data.title || slug,
          date: data.date || 'Unknown',
          tags: Array.isArray(data.tags) ? data.tags : [],
          status: data.status || 'draft',
          kind: data.kind || 'research', // Default to research for backward compatibility
          published: data.published || false,
          visibility: data.visibility || 'inner-circle',
          hypothesis: data.hypothesis || null,
          experiment: {
            defined: experiment.defined || false,
            description: experiment.description || null,
            baseline: experiment.baseline || null,
            metric: experiment.metric || null,
            expected_outcome: experiment.expected_outcome || null,
          },
          results: {
            executed: results.executed || false,
            outcome: results.outcome || null,
            summary: results.summary || null,
          },
          next_action: data.next_action || null,
          evolution: Array.isArray(data.evolution) ? data.evolution : [],
          archived_reason: data.archived_reason || null,
          isStale,
          daysSinceUpdate,
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
          hypothesis: null,
          experiment: {},
          results: {},
          next_action: null,
          isStale: false,
          daysSinceUpdate: 0,
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