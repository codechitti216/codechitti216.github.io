import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Linkedin, Mail } from 'lucide-react';

console.log('Home page rendered');

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
          Machine Perception Engineer with a mathematics core. Currently building robust autonomy stacks across modalities.
        </p>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          Researcher | Engineer 
        </p>
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
          <h3 className="font-serif text-xl font-semibold mb-3">Current Focus</h3>
          <p className="text-gray-700 mb-4">
            Wrapped up my work at IISc Bangalore in the field of underwater perception and navigation.
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
            <a href="mailto:suryachitti216@gmail.com" className="flex items-center text-gray-700 hover:text-gray-900">
              <Mail className="h-4 w-4 mr-2" />
              suryachitti216@gmail.com
            </a>
            <a href="https://github.com/codechitti216" className="flex items-center text-gray-700 hover:text-gray-900">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </a>
            <a href="https://linkedin.com/in/surya-g-s-chitti" className="flex items-center text-gray-700 hover:text-gray-900">
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </a>
          </div>
        </div>
      </section>
      {/* About Section */}
      <section className="prose max-w-none">
        <h2>About Me</h2>
        <p>
          I am a Machine Perception Engineer with a strong mathematical foundation. I am completing my education at BITS Pilani with a Major in Mathematics and a Minor in Computing and Intelligence.
        </p>
        <p>
          I am still exploring Robotics, Perception and AI. From classical computer vision projects to designing deep learning architectures. I have experience in building robust autonomy stacks across various sensor modalities including vision, LiDAR, and DVL (Doppler Velocity Logger).
        </p>
        <p>
          I worked as a Research Assistant Intern at the AI & Robotics Lab, IISc Bangalore under <a href="https://aero.iisc.ac.in/people/sureshsundaram/" target="_blank" style={{ color: 'blue' }}>Professor Suresh Sundaram</a> where I focused on precision navigation systems and visual navigation of underwater drones. My interests include bridging the synthetic-to-real gap in machine learning models and developing field-robust solutions that go beyond benchmark performance.
        </p>
        <p>
          This website serves as my digital lab notebook. A place where I will document my research journey, share insights, and maintain a knowledge system that grows with my learning. It's designed to be both a professional portfolio and a personal knowledge garden.
        </p>
      </section>
    </div>
  );
}

