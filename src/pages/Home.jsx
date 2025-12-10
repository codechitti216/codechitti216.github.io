import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Linkedin, Mail } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Profile Photo */}
      <div className="flex justify-center pt-8">
        <img
          src="/assets/profile.jpg"
          alt="Surya G S Chitti"
          className="rounded-full w-32 h-32 object-cover shadow-lg border-4 border-white"
        />
      </div>
      
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-gray-900">
          Surya G S Chitti
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
          E2E Autonomous Navigation · Deep Learning Researcher · Perception & Closed-Loop Autonomy
        </p>

        {/* Logo Bar */}
        <div className="flex justify-center items-center gap-6 md:gap-10 pt-4 pb-3 flex-wrap">
          <div className="flex flex-col items-center">
            <img src="/assets/logos/mbrdi.png" alt="Mercedes-Benz Research & Development India" className="h-12 md:h-16 grayscale hover:grayscale-0 transition-all" />
            <span className="text-xs text-gray-500 mt-1">Mercedes-Benz <br /> Research & Development India (MBRDI)</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/assets/logos/iisc.png" alt="IISc Bangalore" className="h-12 md:h-16 grayscale hover:grayscale-0 transition-all" />
            <span className="text-xs text-gray-500 mt-1">IISc Bangalore</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/assets/logos/drdo.png" alt="DRDO" className="h-12 md:h-16 grayscale hover:grayscale-0 transition-all" />
            <span className="text-xs text-gray-500 mt-1"></span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/assets/logos/bits.png" alt="BITS Pilani" className="h-12 md:h-16 grayscale hover:grayscale-0 transition-all" />
            <span className="text-xs text-gray-500 mt-1">BITS Pilani</span>
          </div>
        </div>

        <div className="flex justify-center space-x-4 pt-4">
          <Button asChild>
            <Link to="/projects">
              View Projects <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/cv">Download CV</Link>
          </Button>
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="content-card">
          <h3 className="font-serif text-xl font-semibold mb-3">Current Focus · MBRDI</h3>
          <p className="text-gray-700 mb-4">
            Perception systems for E2E autonomous navigation. Working on the transition from open-loop autonomy to closed-loop autonomy.
          </p>
          <Link to="/projects" className="academic-link">
            Explore current work →
          </Link>
        </div>
        <div className="content-card">
          <h3 className="font-serif text-xl font-semibold mb-3">Research Areas</h3>
          <div className="space-y-2 mb-4">
            <span className="tag">Computer Vision</span>
            <span className="tag">3D Perception</span>
            <span className="tag">Visual Navigation</span>
            <span className="tag">Multi-Modal Fusion</span>
            <span className="tag">Deep Learning</span>
          </div>
          <Link to="/garden" className="academic-link">
            Browse knowledge garden →
          </Link>
        </div>
        <div className="content-card">
          <h3 className="font-serif text-xl font-semibold mb-3">Connect</h3>
          <div className="space-y-3">
            <a href="mailto:suryachitti216@gmail.com" className="flex items-center text-gray-700 hover:text-gray-900 text-sm">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">suryachitti216@gmail.com</span>
            </a>
            <a href="https://github.com/codechitti216" className="flex items-center text-gray-700 hover:text-gray-900 text-sm">
              <Github className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>GitHub</span>
            </a>
            <a href="https://linkedin.com/in/surya-g-s-chitti" className="flex items-center text-gray-700 hover:text-gray-900 text-sm">
              <Linkedin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="prose max-w-none">
  <h2>About Me</h2>

  <p>
    Perception Engineer at<a href="https://www.mbrdi.co.in/" target="_blank" style={{ color: 'blue' }}> Mercedes-Benz Research & Development India (MBRDI)</a>, 
    working on end-to-end autonomous navigation systems with a focus on moving 
    from open-loop to closed-loop autonomy. I studied Mathematics at BITS Pilani, which gave me the push to dive into the mathematical side of machine learning and eventually deep learning.
  </p>

  <p>
    My work spans Robotics, Perception, and AI. From classical computer vision to 
    designing deep learning models for real world deployment. I’ve built autonomy 
    stacks across sensor modalities including vision, LiDAR, and Doppler Velocity 
    Loggers (DVL), with an emphasis on reliability in uncontrolled environments.
  </p>

  <p>
    I previously worked at the <a href="https://www.linkedin.com/company/artificial-intelligence-and-robotics-laboratory/posts/?feedView=all" target="_blank" style={{ color: 'blue' }}>Artificial Intelligence & Robotics Lab</a> at IISc Bangalore under <a href="https://aero.iisc.ac.in/people/sureshsundaram/" target="_blank" style={{ color: 'blue' }}>Professor Suresh Sundaram</a> where I focused on precision navigation and perception of underwater drones and visual navigation of marine surface vehicles.
  </p>

  <p>
    My research interests center on the synthetic-to-real gap in deep learning and understanding why 
    models that perform well in curated datasets fail in the field and developing 
    perception systems that remain robust under noise, drift, and the complexities 
    of real environments.
  </p>

  <p>
    This website is my digital lab notebook. A place to document experiments, trace 
    ideas, and build a long-term knowledge system. It serves both as a professional 
    portfolio and a personal research garden.
  </p>
</section>

    </div>
  );
}

