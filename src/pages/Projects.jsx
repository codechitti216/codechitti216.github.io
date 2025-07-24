import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data - in a real implementation, this would come from markdown files
const projectsData = [
  {
    id: 'dvl-velocity-estimation',
    title: 'DVL Beam and Velocity Estimation',
    date: '2025-01-01',
    status: 'In Progress',
    tags: ['Deep Learning', 'Sensor Fusion', 'Navigation', 'DRDO'],
    institution: 'IISc Bangalore',
    duration: 'Jan 2025 - Present',
    excerpt: 'Built dual-stage ML pipelines using multiple neural network variants for DVL beam and velocity estimation. Achieved RMSE of 0.05 m/s on deployment sets with production-ready, field-tested implementation.'
  },
  {
    id: 'visual-navigation-debugging',
    title: 'Visual Navigation Agent Debugging',
    date: '2024-12-01',
    status: 'Completed',
    tags: ['Visual Navigation', 'Transformer', 'Deep Learning', 'Debugging'],
    institution: 'IISc Bangalore',
    duration: 'Dec 2024',
    excerpt: 'Diagnosed transformer-based failures in ViNT/GNM navigation agents, tracing planning errors to goal occlusion and unstable attention heads.'
  },
  {
    id: 'uav-localization-mapping',
    title: 'UAV Localization and Mapping',
    date: '2024-07-01',
    status: 'Completed',
    tags: ['3D Perception', 'LiDAR', 'RGB', 'Point Clouds', 'UAV'],
    institution: 'IIIT Bangalore',
    duration: 'Jul 2024 - Dec 2024',
    excerpt: 'Implemented KPConv and PointNet++ pipelines for 3D segmentation using LiDAR and RGB imagery. Benchmarked across KITTI, NuScenes, and SemanticKITTI datasets.'
  },
  {
    id: 'deformation-tracker',
    title: 'Deformation Tracker - Civil Structures',
    date: '2024-06-01',
    status: 'Completed',
    tags: ['Computer Vision', 'Material Testing', 'Displacement Analysis', 'Civil Engineering'],
    institution: 'Independent Project',
    duration: '2024',
    excerpt: 'Built a tool to extract displacement vectors from video footage of material compression in a Universal Testing Machine. Achieved 0.2 mm accuracy across 7 video samples.'
  },
  {
    id: 'lex-fridman-qa',
    title: 'Lex Fridman Podcast QA System with HyDE + RAG',
    date: '2024-05-01',
    status: 'Completed',
    tags: ['RAG', 'HyDE', 'LLM', 'Information Retrieval', 'NLP'],
    institution: 'Independent Project',
    duration: '2024',
    excerpt: 'Designed a QA system with BERT as the base embedding model using RAG, HyDE, Llama2-13B and OpenAI API for content fetching and generation.'
  }
];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    // In a real implementation, this would fetch and parse markdown files
    setProjects(projectsData);
  }, []);

  // Get all unique tags
  const allTags = ['All', ...new Set(projects.flatMap(project => project.tags))];

  // Filter projects by selected tag
  const filteredProjects = selectedTag === 'All' 
    ? projects 
    : projects.filter(project => project.tags.includes(selectedTag));

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-semibold text-gray-900 mb-4">Projects</h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          A collection of my research projects, technical implementations, and experimental work across computer vision, 
          robotics perception, and machine learning. Each project represents a step in my journey as a researcher and builder.
        </p>
      </div>

      {/* Tag Filter */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-medium text-gray-900">Filter by Technology</h3>
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

      {/* Projects Grid */}
      <div className="space-y-6">
        {filteredProjects.map(project => (
          <article key={project.id} className="content-card">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div className="flex-1">
                <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-2">
                  {project.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {project.duration}
                  </div>
                  <span className="text-gray-400">•</span>
                  <span>{project.institution}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              {project.excerpt}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/projects/${project.id}`}>
                  Read More <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No projects found for the selected tag.</p>
        </div>
      )}
    </div>
  );
};

export default Projects;

