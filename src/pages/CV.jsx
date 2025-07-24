import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Mail, Github, Linkedin } from 'lucide-react';

const CV = () => {
  const handleDownload = () => {
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = '/cv.pdf';
    link.download = 'Surya_GS_Chitti_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-gray-900">Curriculum Vitae</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Machine Perception Engineer with a mathematics core—building robust autonomy stacks across sensor modalities.
        </p>
        <Button onClick={handleDownload} size="lg">
          <Download className="mr-2 h-4 w-4" />
          Download CV (PDF)
        </Button>
      </div>

      {/* Contact Information */}
      <div className="content-card">
        <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-600" />
              <a href="mailto:suryachitti216@gmail.com" className="academic-link">
                suryachitti216@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Github className="h-5 w-5 text-gray-600" />
              <a href="https://github.com/codechitti216" className="academic-link">
                github.com/codechitti216
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Linkedin className="h-5 w-5 text-gray-600" />
              <a href="https://linkedin.com/in/surya-g-s-chitti" className="academic-link">
                linkedin.com/in/surya-g-s-chitti
              </a>
            </div>
          </div>
          <div>
            <p className="text-gray-700">
              <strong>Phone:</strong> +91-7893339846<br />
              <strong>Preferred Locations:</strong> Bangalore, Hyderabad
            </p>
          </div>
        </div>
      </div>

      {/* TL;DR */}
      <div className="content-card">
        <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-4">TL;DR</h2>
        <p className="text-gray-700 leading-relaxed">
          Machine Perception Engineer with a mathematics core—building robust autonomy stacks across sensor 
          modalities (vision, LiDAR, DVL), debugging perception-planning failures in ViNT/GNM agents, and 
          deploying dual-stage estimation under DRDO constraints. Focused on bridging synthetic-to-real gaps 
          and pushing beyond benchmarks toward real-world field robustness.
        </p>
      </div>

      {/* Experience */}
      <div className="content-card">
        <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-6">Experience</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-xl font-medium text-gray-900">Research Assistant Intern</h3>
            <p className="text-gray-600 mb-2">AI & Robotics Lab, IISc Bangalore • Jan 2025 – Present</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Precision Navigation:</strong> Built dual-stage ML pipelines using multiple neural network variants for DVL beam and velocity estimation. Achieved RMSE of 0.05 m/s on deployment sets; production-ready and field-tested.</li>
              <li><strong>Deployment:</strong> Sole author of the full codebase delivered to DRDO; designed with modular instrumentation and internal log tracing for maintainability.</li>
              <li><strong>Monocular Depth Estimation:</strong> Created turbidity-robust models using synthetic data from Unreal Engine 5.2 + USOD10K dataset.</li>
              <li><strong>Visual Navigation Agent Debugging:</strong> Diagnosed transformer-based failures in ViNT/GNM navigation agents; traced planning errors to goal occlusion and unstable attention heads.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xl font-medium text-gray-900">Research Intern</h3>
            <p className="text-gray-600 mb-2">GVCL, IIIT Bangalore • Jul 2024 – Dec 2024</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>UAV Localization and Mapping:</strong> Implemented KPConv and PointNet++ pipelines for 3D segmentation using LiDAR and RGB imagery. Benchmarked across KITTI, NuScenes, and SemanticKITTI datasets.</li>
              <li><strong>RGB-LiDAR Fusion:</strong> Designed an RGB-LiDAR alignment module with SIFT + FLANN; optimized for matching accuracy and runtime using calibration matrices.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xl font-medium text-gray-900">Student Intern</h3>
            <p className="text-gray-600 mb-2">AI4Bharat, IIT Madras • Aug 2023 – Sept 2023</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Anuvaad:</strong> Contributed to the multilingual LLM initiative, aimed at enabling conversations across 13 Indian languages.</li>
              <li><strong>Data Collection:</strong> Automated extraction of 2,000+ YouTube videos and 3,000+ websites using Google Developer API + Trafilatura; created multilingual corpora with no manual intervention.</li>
              <li><strong>UI Development:</strong> Developed Streamlit UI for structured prompt collection; deployed and used by 40+ researchers in lab.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="content-card">
        <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-6">Education</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-serif text-xl font-medium text-gray-900">BITS Pilani, Hyderabad Campus</h3>
            <p className="text-gray-600">M.Sc. Mathematics + B.E. Civil Engineering • 2020 – 2025</p>
            <p className="text-gray-700">Minor: Computing & Intelligence</p>
            <p className="text-sm text-gray-600 mt-1">
              Relevant Courses: Machine Learning, Artificial Intelligence, Numerical Methods, 
              Probability and Statistics, Operating Systems, Graph Theory
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-medium text-gray-900">IIT Madras (Online)</h3>
            <p className="text-gray-600">Diploma in Data Science and Programming • 2020 – 2025</p>
            <p className="text-sm text-gray-600 mt-1">
              Relevant Courses: Deep Learning, DBMS, ML Foundations, Linux Systems, Statistics
            </p>
          </div>
        </div>
      </div>

      {/* Technical Skills */}
      <div className="content-card">
        <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-6">Technical Skills</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-serif text-lg font-medium text-gray-900 mb-3">Programming Languages</h3>
            <div className="flex flex-wrap gap-2">
              {['Python', 'C/C++', 'SQL (Postgres)'].map(skill => (
                <span key={skill} className="tag">{skill}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium text-gray-900 mb-3">Libraries & Frameworks</h3>
            <div className="flex flex-wrap gap-2">
              {['PyTorch', 'NumPy', 'Pandas', 'Scikit-learn', 'OpenCV', 'Open3D', 'Open3D-ML', 'Matplotlib', 'Streamlit', 'SciPy', 'BeautifulSoup'].map(skill => (
                <span key={skill} className="tag">{skill}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium text-gray-900 mb-3">Developer Tools</h3>
            <div className="flex flex-wrap gap-2">
              {['Git', 'VS Code', 'Jupyter', 'LM Studio'].map(skill => (
                <span key={skill} className="tag">{skill}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium text-gray-900 mb-3">Other Tools</h3>
            <div className="flex flex-wrap gap-2">
              {['Bash', 'Linux CLI', 'Trafilatura', 'Google Developer API', 'Whisper', 'CloudCompare'].map(skill => (
                <span key={skill} className="tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Projects */}
      <div className="content-card">
        <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-6">Selected Projects</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-serif text-lg font-medium text-gray-900">Lex Fridman Podcast QA System with HyDE + RAG</h3>
            <p className="text-gray-700">
              Designed a QA system with BERT as the base embedding model using RAG, HyDE, Llama2-13B 
              and OpenAI API. Built a fully deployable system with Streamlit UI enabling config controls, 
              and around 3s response time on RTX 3070.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium text-gray-900">Deformation Tracker – Civil Structures</h3>
            <p className="text-gray-700">
              Built a tool to extract displacement vectors from video footage of material compression 
              in a Universal Testing Machine. UI supports multi-point selection and generation of 
              displacement, velocity and acceleration graphs. Accuracy benchmarked at 0.2 mm across 7 video samples.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium text-gray-900">Overspeed Vehicle Detection – YOLOv8</h3>
            <p className="text-gray-700">
              Trained YOLOv8 on custom-labeled traffic video; achieved 70%+ license plate recall at 30 FPS. 
              Designed custom augmentation pipeline (skew, flip, light degradation).
            </p>
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div className="text-center">
        <Button onClick={handleDownload} size="lg" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Full CV (PDF)
        </Button>
        <p className="text-sm text-gray-600 mt-2">
          Last updated: January 2025
        </p>
      </div>
    </div>
  );
};

export default CV;

