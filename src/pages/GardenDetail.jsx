import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Mock data - in a real implementation, this would load from markdown files
const gardenContent = {
  'synthetic-to-real-gap': {
    title: 'Bridging the Synthetic-to-Real Gap in Machine Learning',
    date: '2024-12-15',
    tags: ['Machine Learning', 'Computer Vision', 'Simulation', 'Domain Adaptation'],
    status: 'evolving',
    content: `# Bridging the Synthetic-to-Real Gap in Machine Learning

## Background

One of the most persistent challenges in modern machine learning, particularly in computer vision and robotics, is the synthetic-to-real gap. Models trained on synthetic data often fail to generalize to real-world scenarios due to fundamental differences in data distribution, visual appearance, and environmental conditions.

This gap becomes particularly pronounced in domains where real-world data collection is expensive, dangerous, or impractical—such as autonomous driving, medical imaging, or robotics applications.

## Key Observations

### Distribution Shift Challenges
- **Visual Appearance**: Synthetic renderings often lack the complexity and variability of real-world lighting, textures, and materials
- **Sensor Characteristics**: Simulated sensors may not capture the noise, distortions, and artifacts present in real hardware
- **Environmental Factors**: Weather conditions, wear and tear, and unexpected scenarios are difficult to model comprehensively

### Current Approaches and Limitations
- **Domain Randomization**: While effective, often requires careful tuning and may not cover all relevant variations
- **Adversarial Training**: Shows promise but can be unstable and computationally expensive
- **Progressive Training**: Gradual transition from synthetic to real data, but requires careful curriculum design

## Technical Analysis

### Successful Strategies

#### 1. Physics-Based Rendering
Modern rendering engines like Unreal Engine 5 and Blender Cycles provide increasingly realistic synthetic data:
- **Ray tracing**: More accurate lighting and reflections
- **Material modeling**: Physically-based materials that behave like real-world counterparts
- **Environmental effects**: Weather, atmospheric scattering, and temporal variations

#### 2. Sensor Simulation
Accurate modeling of sensor characteristics:
- **Camera models**: Lens distortion, chromatic aberration, and sensor noise
- **LiDAR simulation**: Beam patterns, range limitations, and environmental interactions
- **Multi-modal consistency**: Ensuring synthetic RGB and depth data maintain proper relationships

#### 3. Data Augmentation Strategies
- **Procedural generation**: Algorithmic creation of diverse scenarios
- **Style transfer**: Adapting synthetic data to match real-world visual characteristics
- **Noise injection**: Adding realistic sensor noise and artifacts

### Emerging Techniques

#### Neural Rendering
- **NeRF (Neural Radiance Fields)**: Learning 3D scene representations from 2D images
- **Gaussian Splatting**: Efficient 3D scene representation for real-time rendering
- **Differentiable rendering**: End-to-end optimization of rendering parameters

#### Foundation Models
- **Vision-Language Models**: Leveraging large-scale pre-training for better generalization
- **Self-supervised Learning**: Reducing dependence on labeled synthetic data
- **Few-shot Adaptation**: Quick adaptation to real-world domains with minimal data

## Practical Insights from Recent Work

### Underwater Robotics Context
In my work with DVL velocity estimation, the synthetic-to-real gap manifests in several ways:
- **Water turbidity**: Difficult to model accurately in simulation
- **Particle dynamics**: Complex interactions between water, sediment, and light
- **Sensor degradation**: Real-world sensors accumulate biofouling and damage over time

### Visual Navigation
From debugging ViNT/GNM agents:
- **Lighting variations**: Synthetic training data often lacks the full spectrum of real-world lighting conditions
- **Occlusion patterns**: Real-world occlusions are more complex and dynamic than synthetic scenarios
- **Attention mechanisms**: Transformers trained on synthetic data may focus on artifacts not present in real images

## Future Directions

### Hybrid Approaches
- **Sim-to-real transfer learning**: Using synthetic data for pre-training, then fine-tuning on limited real data
- **Real-to-sim feedback**: Using real-world observations to improve synthetic data generation
- **Continuous adaptation**: Online learning systems that adapt to new real-world conditions

### Evaluation Metrics
- **Domain gap quantification**: Better metrics for measuring the synthetic-to-real gap
- **Robustness testing**: Systematic evaluation of model performance across different real-world conditions
- **Failure mode analysis**: Understanding when and why synthetic-trained models fail in real scenarios

### Theoretical Understanding
- **Generalization bounds**: Mathematical frameworks for understanding domain transfer
- **Causal reasoning**: Moving beyond correlation to understand causal relationships
- **Invariance learning**: Identifying and learning domain-invariant features

## Connection to Broader Research

This challenge connects to fundamental questions in machine learning:
- **Generalization**: How do we build models that work beyond their training distribution?
- **Robustness**: What makes models resilient to distribution shift?
- **Sample efficiency**: How can we learn effectively with limited real-world data?

The synthetic-to-real gap is not just a technical challenge but a window into understanding how artificial systems can better model and interact with the complexity of the real world.

## Ongoing Questions

- How can we better quantify and predict the synthetic-to-real gap before deployment?
- What role will foundation models play in bridging this gap?
- How do we balance the trade-off between synthetic data diversity and computational cost?
- Can we develop universal domain adaptation techniques that work across different modalities and applications?

This remains an active area of research with significant implications for the practical deployment of machine learning systems in real-world applications.`
  },
  'attention-mechanisms-navigation': {
    title: 'Attention Mechanisms in Visual Navigation: Insights from Debugging',
    date: '2024-12-10',
    tags: ['Attention Mechanisms', 'Visual Navigation', 'Transformers', 'Deep Learning'],
    status: 'active',
    content: `# Attention Mechanisms in Visual Navigation: Insights from Debugging

## Background

Through my work debugging ViNT (Visual Navigation Transformer) and GNM (Goal-conditioned Navigation Model) agents, I've gained valuable insights into how attention mechanisms behave in visual navigation tasks. These observations reveal both the power and limitations of transformer-based approaches in robotics applications.

## Key Observations from Debugging

### Attention Head Instability
One of the most significant findings was the instability of attention heads under certain visual conditions:

#### Goal Occlusion Effects
- **Partial Occlusion**: When the goal is partially occluded, attention heads show erratic behavior, jumping between visible goal features and background elements
- **Complete Occlusion**: Total goal occlusion leads to attention collapse, where the model focuses on irrelevant visual features
- **Recovery Patterns**: Once the goal becomes visible again, attention recovery is often slow and inconsistent

#### Environmental Factors
- **Lighting Changes**: Dramatic lighting variations cause attention heads to shift focus unexpectedly
- **Dynamic Objects**: Moving objects in the scene can capture attention inappropriately, leading to navigation errors
- **Texture Variations**: High-contrast textures can dominate attention even when irrelevant to navigation

### Planning Error Correlation
The debugging process revealed strong correlations between attention patterns and planning failures:

#### Error Types
1. **Goal Confusion**: Attention focusing on visually similar but incorrect targets
2. **Path Deviation**: Attention drifting to irrelevant visual features during navigation
3. **Oscillatory Behavior**: Attention switching rapidly between multiple potential targets

#### Failure Modes
- **Attention Saturation**: All attention concentrated on a single, potentially incorrect feature
- **Attention Diffusion**: Attention spread too broadly, losing focus on the actual goal
- **Temporal Inconsistency**: Attention patterns changing dramatically between consecutive frames

## Technical Analysis

### Transformer Architecture in Navigation
The application of transformers to visual navigation presents unique challenges:

#### Spatial Reasoning
- **Global Context**: Transformers excel at capturing long-range spatial relationships
- **Local Details**: May struggle with fine-grained spatial reasoning required for precise navigation
- **Scale Invariance**: Attention mechanisms can lose important scale information

#### Temporal Consistency
- **Frame-to-Frame Stability**: Navigation requires consistent attention across time
- **Memory Integration**: Limited ability to maintain long-term spatial memory
- **Trajectory Planning**: Difficulty in maintaining coherent long-term navigation plans

### Attention Visualization Insights

#### Successful Navigation Patterns
When navigation works well, attention exhibits:
- **Goal Consistency**: Stable focus on goal-relevant features
- **Path Awareness**: Attention to immediate obstacles and path constraints
- **Hierarchical Focus**: Multi-scale attention from global goal to local navigation

#### Failure Patterns
Failed navigation attempts show:
- **Attention Drift**: Gradual shift away from goal-relevant features
- **Feature Confusion**: Focus on visually similar but incorrect elements
- **Spatial Incoherence**: Attention patterns that don't respect spatial relationships

## Implications for Navigation System Design

### Robustness Improvements
Based on these insights, several improvements emerge:

#### Attention Regularization
- **Temporal Smoothing**: Encouraging consistent attention across frames
- **Spatial Constraints**: Biasing attention toward spatially coherent regions
- **Goal Anchoring**: Maintaining attention focus on goal-relevant features

#### Multi-Modal Integration
- **Sensor Fusion**: Combining visual attention with other sensor modalities
- **Geometric Constraints**: Using depth and spatial information to guide attention
- **Prior Knowledge**: Incorporating navigation-specific inductive biases

### Architecture Modifications

#### Attention Mechanisms
- **Sparse Attention**: Focusing computational resources on navigation-relevant regions
- **Hierarchical Attention**: Multi-scale attention for different navigation tasks
- **Memory-Augmented Attention**: Maintaining spatial memory across navigation episodes

#### Training Strategies
- **Attention Supervision**: Explicitly training attention to focus on relevant features
- **Adversarial Training**: Improving robustness to attention-disrupting conditions
- **Curriculum Learning**: Gradually increasing navigation complexity during training

## Broader Implications

### Transformer Limitations in Robotics
This work highlights fundamental challenges in applying transformers to robotics:

#### Spatial Understanding
- **3D Reasoning**: 2D attention may be insufficient for 3D navigation tasks
- **Geometric Consistency**: Attention patterns should respect physical constraints
- **Scale Awareness**: Navigation requires understanding of spatial scales

#### Real-World Deployment
- **Computational Efficiency**: Attention mechanisms can be computationally expensive
- **Interpretability**: Understanding attention patterns is crucial for safety-critical applications
- **Robustness**: Real-world conditions often violate training assumptions

### Future Research Directions

#### Attention Mechanism Improvements
- **Navigation-Specific Attention**: Designing attention mechanisms specifically for navigation tasks
- **Geometric Attention**: Incorporating 3D spatial understanding into attention computation
- **Causal Attention**: Ensuring attention patterns respect causal relationships in navigation

#### Evaluation Methodologies
- **Attention Quality Metrics**: Developing metrics to evaluate attention pattern quality
- **Failure Mode Analysis**: Systematic characterization of attention-related failures
- **Robustness Testing**: Comprehensive evaluation under diverse conditions

## Connection to Broader Research

This work connects to several important research areas:

### Explainable AI
- **Attention Interpretability**: Understanding what navigation models focus on
- **Failure Explanation**: Using attention patterns to explain navigation failures
- **Trust and Safety**: Building confidence in autonomous navigation systems

### Robust Machine Learning
- **Distribution Shift**: How attention patterns change under new conditions
- **Adversarial Robustness**: Protecting attention mechanisms from adversarial attacks
- **Uncertainty Quantification**: Understanding when attention patterns are unreliable

## Practical Recommendations

Based on these insights, I recommend:

1. **Attention Monitoring**: Real-time monitoring of attention patterns during navigation
2. **Fallback Mechanisms**: Alternative navigation strategies when attention fails
3. **Human Oversight**: Interfaces for human operators to understand and intervene in attention-based decisions
4. **Continuous Learning**: Systems that adapt attention patterns based on deployment experience

## Ongoing Questions

- How can we design attention mechanisms that are inherently more robust to visual disturbances?
- What is the optimal balance between global and local attention for navigation tasks?
- How can we incorporate geometric and physical constraints into attention computation?
- What role should human feedback play in training and correcting attention patterns?

This debugging experience has reinforced the importance of understanding the internal mechanisms of deep learning models, particularly when deploying them in safety-critical applications like autonomous navigation.`
  }
};

const GardenDetail = () => {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch the markdown file
    const entryData = gardenContent[id];
    if (entryData) {
      setEntry(entryData);
    }
    setLoading(false);
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'evolving':
        return 'bg-purple-100 text-purple-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'growing':
        return 'bg-green-100 text-green-800';
      case 'mature':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'evolving':
        return 'Evolving - Active development';
      case 'active':
        return 'Active - Current focus';
      case 'growing':
        return 'Growing - Expanding ideas';
      case 'mature':
        return 'Mature - Well-developed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Garden Entry Not Found</h1>
        <p className="text-gray-600 mb-6">The garden entry you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/garden">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Garden
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
          <Link to="/garden">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Garden
          </Link>
        </Button>
      </div>

      {/* Entry Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="font-serif text-4xl font-semibold text-gray-900 mb-4">
              {entry.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(entry.status)}`}>
              {getStatusLabel(entry.status)}
            </span>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {entry.tags.map(tag => (
            <span key={tag} className="tag">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Entry Content */}
      <div className="prose max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({children}) => <h1 className="font-serif text-3xl font-semibold text-gray-900 mb-6 mt-8 first:mt-0">{children}</h1>,
            h2: ({children}) => <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-4 mt-8">{children}</h2>,
            h3: ({children}) => <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3 mt-6">{children}</h3>,
            h4: ({children}) => <h4 className="font-serif text-lg font-semibold text-gray-900 mb-3 mt-4">{children}</h4>,
            p: ({children}) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
            ul: ({children}) => <ul className="mb-4 pl-6 space-y-2">{children}</ul>,
            ol: ({children}) => <ol className="mb-4 pl-6 space-y-2">{children}</ol>,
            li: ({children}) => <li className="text-gray-700">{children}</li>,
            strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
            code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
            pre: ({children}) => <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto my-6">{children}</pre>,
            blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-6">{children}</blockquote>,
          }}
        >
          {entry.content}
        </ReactMarkdown>
      </div>

      {/* Back to Garden */}
      <div className="pt-8 border-t border-gray-200">
        <Button variant="outline" asChild>
          <Link to="/garden">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Garden
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default GardenDetail;

