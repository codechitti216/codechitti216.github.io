import fm from 'front-matter';

// Import all markdown files from content directories
const gardenModules = import.meta.glob('/content/garden/*.md', { as: 'raw', eager: true });

function parseContent(rawContent, filePath) {
  const { attributes, body } = fm(rawContent);
  // Extract slug from file path
  const slug = filePath.split('/').pop().replace('.md', '').toLowerCase().replace(/\s+/g, '-');
  return {
    slug,
    ...attributes,
    body,
  };
}

export function getAllContent() {
  const items = [];

  for (const [path, raw] of Object.entries(gardenModules)) {
    const parsed = parseContent(raw, path);
    if (parsed.published !== false) {
      items.push(parsed);
    }
  }

  // Sort by date descending
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  return items;
}

export function getContentBySlug(slug) {
  const all = getAllContent();
  return all.find(item => item.slug === slug) || null;
}

export function getContentByTier(tier) {
  return getAllContent().filter(item => item.tier === tier);
}

export function getContentByDomain(domain) {
  return getAllContent().filter(item =>
    item.tags && item.tags.some(t => t.toLowerCase().includes(domain.toLowerCase()))
  );
}

export function getAllTags() {
  const tags = new Set();
  getAllContent().forEach(item => {
    if (item.tags) item.tags.forEach(t => tags.add(t));
  });
  return [...tags].sort();
}

// Tier definitions for display
export const TIERS = {
  seed: { label: 'Seed', description: 'A question or hypothesis', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  note: { label: 'Note', description: 'First-principles explainer', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  notebook: { label: 'Notebook', description: 'Build from scratch + analysis', color: 'text-violet-700 bg-violet-50 border-violet-200' },
  experiment: { label: 'Experiment', description: 'Hypothesis-driven research', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  paper: { label: 'Paper', description: 'Full arxiv preprint', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  tool: { label: 'Tool', description: 'Open-source library or code', color: 'text-gray-700 bg-gray-50 border-gray-200' },
  research: { label: 'Research', description: 'Research exploration', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
};

export const DOMAINS = ['Perception & Vision', 'LLMs & Language', 'RL & Multi-Agent', 'Mathematical Foundations'];
