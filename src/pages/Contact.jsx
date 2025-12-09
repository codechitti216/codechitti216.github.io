import { Mail, Github, Linkedin, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Contact = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-gray-900">Contact</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Perception Engineer · MBRDI. Open to discussing autonomous systems, 
          perception research, and collaboration opportunities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Primary Contact */}
        <div className="content-card">
          <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email</h3>
                <a href="mailto:suryachitti216@gmail.com" className="academic-link text-lg">
                  suryachitti216@gmail.com
                </a>
                <p className="text-sm text-gray-600">Primary contact for all inquiries</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Phone className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Phone</h3>
                <p className="text-lg text-gray-700">+91-7893339846</p>
                <p className="text-sm text-gray-600">Available for calls during IST business hours</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Location</h3>
                <p className="text-lg text-gray-700">Bangalore, Hyderabad</p>
                <p className="text-sm text-gray-600">Preferred locations for opportunities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Links */}
        <div className="content-card">
          <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-6">Professional Links</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Github className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">GitHub</h3>
                <a href="https://github.com/codechitti216" className="academic-link">
                  github.com/codechitti216
                </a>
                <p className="text-sm text-gray-600">Code repositories and project implementations</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/codechitti216" target="_blank" rel="noopener noreferrer">
                  Visit
                </a>
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Linkedin className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">LinkedIn</h3>
                <a href="https://linkedin.com/in/surya-g-s-chitti" className="academic-link">
                  linkedin.com/in/surya-g-s-chitti
                </a>
                <p className="text-sm text-gray-600">Professional network and career updates</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="https://linkedin.com/in/surya-g-s-chitti" target="_blank" rel="noopener noreferrer">
                  Connect
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Research Interests */}
      <div className="content-card">
        <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-6">Research Interests & Collaboration</h2>
        
        <div className="prose max-w-none">
          <p>
            I'm particularly interested in collaborating on projects related to:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="font-serif text-lg font-medium text-gray-900 mb-3">Core Research Areas</h3>
              <ul className="space-y-2">
                <li>Machine Perception and Computer Vision</li>
                <li>3D Perception and Point Cloud Processing</li>
                <li>Visual Navigation and Robotics</li>
                <li>Sensor Fusion and Multi-modal Learning</li>
                <li>Synthetic-to-Real Domain Adaptation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-serif text-lg font-medium text-gray-900 mb-3">Application Domains</h3>
              <ul className="space-y-2">
                <li>Autonomous Driving & E2E Navigation</li>
                <li>Closed-Loop Autonomy Systems</li>
                <li>Underwater Robotics and Navigation</li>
                <li>Autonomous Systems and UAVs</li>
                <li>Real-world ML Deployment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Response Time */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-serif text-lg font-medium text-gray-900 mb-3">Response Time</h3>
        <p className="text-gray-700">
          I typically respond to emails within 24-48 hours. For urgent matters or time-sensitive 
          opportunities, please mention "URGENT" in the subject line. I'm always happy to discuss 
          research ideas, potential collaborations, or answer questions about my work.
        </p>
      </div>
    </div>
  );
};

export default Contact;

