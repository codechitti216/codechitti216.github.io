import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Mock data - in a real implementation, this would come from markdown files
const gardenData = [
  {
    id: 'synthetic-to-real-gap',
    title: 'Bridging the Synthetic-to-Real Gap in Machine Learning',
    date: '2024-12-15',
    tags: ['Machine Learning', 'Computer Vision', 'Simulation', 'Domain Adaptation'],
    status: 'evolving',
    excerpt: 'One of the most persistent challenges in modern machine learning, particularly in computer vision and robotics, is the synthetic-to-real gap. Models trained on synthetic data often fail to generalize to real-world scenarios...'
  },
  {
    id: 'attention-mechanisms-navigation',
    title: 'Attention Mechanisms in Visual Navigation: Insights from Debugging',
    date: '2024-12-10',
    tags: ['Attention Mechanisms', 'Visual Navigation', 'Transformers', 'Deep Learning'],
    status: 'active',
    excerpt: 'Through my work debugging ViNT (Visual Navigation Transformer) and GNM (Goal-conditioned Navigation Model) agents, I\'ve gained valuable insights into how attention mechanisms behave in visual navigation tasks...'
  },
  {
    id: 'sensor-fusion-underwater',
    title: 'Sensor Fusion Challenges in Underwater Robotics',
    date: '2024-12-05',
    tags: ['Sensor Fusion', 'Underwater Robotics', 'DVL', 'IMU'],
    status: 'growing',
    excerpt: 'Underwater environments present unique challenges for sensor fusion due to limited GPS availability, acoustic propagation delays, and environmental factors affecting sensor performance...'
  },
  {
    id: 'point-cloud-processing',
    title: 'Modern Approaches to Point Cloud Processing',
    date: '2024-11-28',
    tags: ['Point Clouds', 'KPConv', 'PointNet++', '3D Perception'],
    status: 'mature',
    excerpt: 'Point cloud processing has evolved significantly with the introduction of deep learning methods. This note explores the progression from traditional methods to modern neural approaches...'
  },
  {
    id: 'rag-hyde-insights',
    title: 'RAG + HyDE: Lessons from Building a Podcast QA System',
    date: '2024-11-20',
    tags: ['RAG', 'HyDE', 'Information Retrieval', 'LLM'],
    status: 'mature',
    excerpt: 'Building a QA system for the Lex Fridman podcast corpus provided insights into the practical challenges of combining Retrieval Augmented Generation with Hypothetical Document Embeddings...'
  }
];

const Garden = () => {
  const [entries, setEntries] = useState([]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real implementation, this would fetch and parse markdown files
    setEntries(gardenData);
  }, []);

  // Get all unique tags
  const allTags = ['All', ...new Set(entries.flatMap(entry => entry.tags))];

  // Filter entries by selected tag and search term
  const filteredEntries = entries.filter(entry => {
    const matchesTag = selectedTag === 'All' || entry.tags.includes(selectedTag);
    const matchesSearch = searchTerm === '' || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesTag && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'evolving':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'growing':
        return 'bg-yellow-100 text-yellow-800';
      case 'mature':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'evolving':
        return 'Actively developing ideas';
      case 'active':
        return 'Current focus area';
      case 'growing':
        return 'Expanding knowledge';
      case 'mature':
        return 'Well-developed thoughts';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-semibold text-gray-900 mb-4">Knowledge Garden</h1>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          A digital garden of ideas, insights, and evolving thoughts from my research journey. 
          These notes represent my ongoing exploration of concepts in machine learning, robotics, 
          and computer vision—some mature, others still growing.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-serif text-lg font-medium text-gray-900 mb-2">Garden Status Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-100 rounded-full"></span>
              <span>Evolving - Active development</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-100 rounded-full"></span>
              <span>Active - Current focus</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-yellow-100 rounded-full"></span>
              <span>Growing - Expanding ideas</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-purple-100 rounded-full"></span>
              <span>Mature - Well-developed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notes, tags, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-medium text-gray-900">Filter by Topic</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
                className="text-xs"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Garden Entries */}
      <div className="space-y-6">
        {filteredEntries.map(entry => (
          <article key={entry.id} className="content-card">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div className="flex-1">
                <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-2">
                  <Link to={`/garden/${entry.id}`} className="hover:text-blue-700 transition-colors">
                    {entry.title}
                  </Link>
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(entry.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}
                  title={getStatusDescription(entry.status)}
                >
                  {entry.status}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              {entry.excerpt}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {entry.tags.map(tag => (
                <span key={tag} className="tag">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/garden/${entry.id}`}>
                  Read Full Note
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm || selectedTag !== 'All' 
              ? 'No notes found matching your search criteria.' 
              : 'No notes in the garden yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Garden;

