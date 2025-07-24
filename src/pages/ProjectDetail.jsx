import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ExternalLink, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Mock data - in a real implementation, this would load from markdown files
const projectsContent = {
  'dvl-velocity-estimation': {
    title: 'DVL Beam and Velocity Estimation',
    date: '2025-01-01',
    status: 'In Progress',
    tags: ['Deep Learning', 'Sensor Fusion', 'Navigation', 'DRDO'],
    institution: 'IISc Bangalore',
    duration: 'Jan 2025 - Present',
    content: `# DVL Beam and Velocity Estimation

## Overview

Built dual-stage ML pipelines using multiple neural network variants for DVL (Doppler Velocity Log) beam and velocity estimation. Achieved RMSE of 0.05 m/s on deployment sets with production-ready, field-tested implementation.

## Key Achievements

- **Precision Navigation**: Developed dual-stage ML pipelines for DVL beam and velocity estimation
- **High Accuracy**: Achieved RMSE of 0.05 m/s on deployment datasets
- **Production Ready**: Sole author of full codebase delivered to DRDO
- **Field Tested**: Successfully deployed and tested in real-world conditions

## Technical Details

### Architecture
- Dual-stage ML pipeline design
- Multiple neural network variants for robust estimation
- Modular instrumentation for maintainability
- Internal log tracing for debugging and monitoring

### Performance
- RMSE: 0.05 m/s on deployment sets
- Production-ready implementation
- Field-tested validation

### Deployment
- Delivered to DRDO as complete solution
- Designed with modular architecture for easy maintenance
- Comprehensive logging and monitoring systems

## Technologies Used

- Deep Learning frameworks
- Sensor fusion techniques
- DVL sensor integration
- Real-time processing systems

## Impact

This project represents a significant advancement in underwater navigation systems, providing DRDO with a robust, production-ready solution for precision navigation applications. The modular design ensures long-term maintainability and extensibility for future enhancements.`
  },
  'visual-navigation-debugging': {
    title: 'Visual Navigation Agent Debugging',
    date: '2024-12-01',
    status: 'Completed',
    tags: ['Visual Navigation', 'Transformer', 'Deep Learning', 'Debugging'],
    institution: 'IISc Bangalore',
    duration: 'Dec 2024',
    content: `# Visual Navigation Agent Debugging

## Overview

Diagnosed transformer-based failures in ViNT/GNM navigation agents, tracing planning errors to goal occlusion and unstable attention heads. This work contributed to understanding failure modes in state-of-the-art visual navigation systems.

## Key Findings

- **Failure Mode Analysis**: Identified specific failure patterns in ViNT/GNM agents
- **Root Cause**: Traced planning errors to goal occlusion and unstable attention heads
- **Transformer Issues**: Documented attention mechanism instabilities
- **Planning Errors**: Characterized relationship between visual occlusion and navigation failures

## Technical Analysis

### Problem Investigation
- Analyzed transformer-based visual navigation models
- Focused on ViNT (Visual Navigation Transformer) and GNM architectures
- Systematic debugging of planning failures

### Key Discoveries
- Goal occlusion significantly impacts navigation performance
- Attention heads show instability under certain visual conditions
- Planning errors correlate with specific visual patterns

### Methodology
- Systematic failure case analysis
- Attention visualization and analysis
- Performance correlation studies

## Technologies Used

- Visual Navigation Transformers (ViNT)
- Goal-conditioned Navigation Models (GNM)
- Attention mechanism analysis
- Deep learning debugging tools

## Impact

This debugging work provides valuable insights into the limitations of current visual navigation systems, particularly highlighting the vulnerability of transformer-based approaches to visual occlusion and attention instabilities. These findings inform future improvements in robust navigation system design.`
  },
  'uav-localization-mapping': {
    title: 'UAV Localization and Mapping',
    date: '2024-07-01',
    status: 'Completed',
    tags: ['3D Perception', 'LiDAR', 'RGB', 'Point Clouds', 'UAV'],
    institution: 'IIIT Bangalore',
    duration: 'Jul 2024 - Dec 2024',
    content: `# UAV Localization and Mapping

## Overview

Implemented KPConv and PointNet++ pipelines for 3D segmentation using LiDAR and RGB imagery. Benchmarked across KITTI, NuScenes, and SemanticKITTI datasets with focus on UAV applications.

## Key Achievements

- **3D Segmentation**: Implemented state-of-the-art point cloud segmentation methods
- **Multi-Modal Fusion**: Designed RGB-LiDAR alignment module
- **Benchmark Performance**: Evaluated across multiple standard datasets
- **Real-time Processing**: Optimized for UAV deployment constraints

## Technical Implementation

### Deep Learning Models
- **KPConv**: Kernel Point Convolution for point cloud processing
- **PointNet++**: Hierarchical neural network for point set processing
- Custom architectures for UAV-specific requirements

### Sensor Fusion
- RGB-LiDAR alignment module using SIFT + FLANN
- Calibration matrix optimization
- Runtime and accuracy optimization

### Datasets
- **KITTI**: Autonomous driving dataset
- **NuScenes**: Large-scale autonomous driving dataset
- **SemanticKITTI**: Semantic segmentation benchmark

## Technical Details

### RGB-LiDAR Alignment
- SIFT feature detection and matching
- FLANN-based nearest neighbor search
- Calibration matrix utilization for precise alignment
- Performance optimization for real-time processing

### Performance Metrics
- Segmentation accuracy across different object classes
- Runtime performance analysis
- Memory usage optimization for UAV deployment

## Technologies Used

- KPConv (Kernel Point Convolution)
- PointNet++ architecture
- SIFT feature detection
- FLANN matching algorithms
- Point cloud processing libraries
- Multi-modal sensor fusion

## Impact

This project advanced the state of UAV-based 3D perception by combining cutting-edge deep learning techniques with practical sensor fusion approaches. The work demonstrates effective integration of RGB and LiDAR data for robust 3D understanding in UAV applications.`
  },
  'deformation-tracker': {
    title: 'Deformation Tracker - Civil Structures',
    date: '2024-06-01',
    status: 'Completed',
    tags: ['Computer Vision', 'Material Testing', 'Displacement Analysis', 'Civil Engineering'],
    institution: 'Independent Project',
    duration: '2024',
    content: `# Deformation Tracker - Civil Structures

## Overview

Built a tool to extract displacement vectors from video footage of material compression in a Universal Testing Machine (UTM). Achieved 0.2 mm accuracy across 7 video samples with comprehensive analysis capabilities.

## Key Achievements

- **High Precision**: Achieved ±0.2 mm accuracy against ground truth
- **Multi-Point Tracking**: Support for simultaneous tracking of multiple points
- **Comprehensive Analysis**: Generated displacement, velocity, and acceleration graphs
- **Real-time Processing**: 30 FPS video processing capability

## Technical Implementation

### Computer Vision Approach
- Manual white dot marking for maximum intensity difference
- Advanced tracking algorithms for sub-pixel accuracy
- Scale calibration using known reference distances

### Analysis Capabilities
- **Displacement Tracking**: Real-time position monitoring
- **Velocity Calculation**: First derivative of displacement
- **Acceleration Analysis**: Second derivative for dynamic behavior
- **Multi-point Selection**: User-defined regions of interest

## Methodology

### Scale Calibration
- User-selectable reference points with known distances
- Multiple reference measurements for improved accuracy
- Automatic scale factor calculation and validation

### Tracking Algorithm
- White dot detection using intensity thresholding
- Sub-pixel tracking for enhanced precision
- Temporal consistency validation

### Ground Truth Validation
- UTM ground truth accurate to 10 decimals
- 100Hz sampling rate comparison
- Camera synchronization at 30 FPS

## Performance Metrics

- **Accuracy**: 0.2 mm average across different materials
- **Precision**: Consistent performance across 7 test videos
- **Frame Rate**: 30 FPS processing capability
- **Reliability**: Robust tracking under varying lighting conditions

## User Interface Features

- Interactive point selection
- Real-time graph generation
- Export capabilities for analysis data
- Scale calibration interface

## Technologies Used

- Computer Vision algorithms
- Image processing techniques
- Real-time tracking systems
- Data visualization tools
- User interface development

## Applications

- Material testing and analysis
- Structural health monitoring
- Quality control in manufacturing
- Research in material properties
- Educational demonstrations

## Impact

This tool provides civil engineers and researchers with a cost-effective, high-precision method for analyzing material deformation. The 0.2 mm accuracy rivals expensive specialized equipment while offering greater flexibility and ease of use.`
  },
  'lex-fridman-qa': {
    title: 'Lex Fridman Podcast QA System with HyDE + RAG',
    date: '2024-05-01',
    status: 'Completed',
    tags: ['RAG', 'HyDE', 'LLM', 'Information Retrieval', 'NLP'],
    institution: 'Independent Project',
    duration: '2024',
    content: `# Lex Fridman Podcast QA System with HyDE + RAG

## Overview

Designed a QA system with BERT as the base embedding model using RAG (Retrieval Augmented Generation), HyDE (Hypothetical Document Embeddings), Llama2-13B and OpenAI API for content fetching and generation.

## Key Achievements

- **Advanced RAG Implementation**: Combined traditional RAG with HyDE for improved retrieval
- **Fast Response Time**: ~3 seconds response time on RTX 3070
- **Production Ready**: Fully deployable system with Streamlit UI
- **Configurable**: User controls for various system parameters

## Technical Architecture

### Core Components
- **BERT Embeddings**: Base model for document and query encoding
- **HyDE Integration**: Hypothetical Document Embeddings for enhanced retrieval
- **RAG Pipeline**: Retrieval Augmented Generation for contextual responses
- **Llama2-13B**: Local language model for generation
- **OpenAI API**: Fallback and comparison generation

### System Design
- Modular architecture for easy maintenance
- Configurable parameters through UI
- Efficient indexing and retrieval system
- Real-time response generation

## Performance Metrics

- **Response Time**: ~3 seconds on RTX 3070
- **Accuracy**: High relevance in retrieved content
- **Scalability**: Handles large podcast corpus efficiently
- **User Experience**: Intuitive Streamlit interface

## Technical Implementation

### Retrieval System
- BERT-based semantic search
- HyDE for query expansion and refinement
- Vector database for efficient similarity search
- Context ranking and selection

### Generation Pipeline
- Retrieved context integration
- Llama2-13B for local generation
- OpenAI API integration for comparison
- Response quality optimization

### User Interface
- Streamlit-based web application
- Configuration controls for system parameters
- Real-time query processing
- Response visualization and export

## Technologies Used

- BERT (Bidirectional Encoder Representations from Transformers)
- HyDE (Hypothetical Document Embeddings)
- RAG (Retrieval Augmented Generation)
- Llama2-13B language model
- OpenAI API
- Streamlit for UI
- Vector databases for retrieval

## Dataset

- Complete Lex Fridman Podcast corpus
- Preprocessed transcripts and metadata
- Indexed content for efficient retrieval
- Regular updates with new episodes

## Impact

This project demonstrates the effective combination of modern NLP techniques for building practical QA systems. The integration of HyDE with traditional RAG approaches shows significant improvements in retrieval quality, while the fast response times make it suitable for interactive applications.`
  }
};

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch the markdown file
    const projectData = projectsContent[id];
    if (projectData) {
      setProject(projectData);
    }
    setLoading(false);
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <div>
        <Button variant="ghost" asChild>
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>

      {/* Project Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="font-serif text-4xl font-semibold text-gray-900 mb-4">
              {project.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {project.duration}
              </div>
              <span className="text-gray-400">•</span>
              <span>{project.institution}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map(tag => (
            <span key={tag} className="tag">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Project Content */}
      <div className="prose max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({children}) => <h1 className="font-serif text-3xl font-semibold text-gray-900 mb-6 mt-8 first:mt-0">{children}</h1>,
            h2: ({children}) => <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-4 mt-8">{children}</h2>,
            h3: ({children}) => <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3 mt-6">{children}</h3>,
            p: ({children}) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
            ul: ({children}) => <ul className="mb-4 pl-6 space-y-2">{children}</ul>,
            ol: ({children}) => <ol className="mb-4 pl-6 space-y-2">{children}</ol>,
            li: ({children}) => <li className="text-gray-700">{children}</li>,
            strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
            code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
            pre: ({children}) => <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto my-6">{children}</pre>,
          }}
        >
          {project.content}
        </ReactMarkdown>
      </div>

      {/* Back to Projects */}
      <div className="pt-8 border-t border-gray-200">
        <Button variant="outline" asChild>
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProjectDetail;

