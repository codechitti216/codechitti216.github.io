import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Garden from './pages/Garden';
import GardenDetail from './pages/GardenDetail';
import CV from './pages/CV';
import Contact from './pages/Contact';
import StoryDynamic from './pages/StoryDynamic';
import './App.css';

function App() {
  console.log('🔍 DEBUG: App component rendering');
  console.log('🔍 DEBUG: Current window.location:', window.location.href);
  console.log('🔍 DEBUG: Current pathname:', window.location.pathname);
  console.log('🔍 DEBUG: Current search:', window.location.search);
  console.log('🔍 DEBUG: Current hash:', window.location.hash);
  
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/garden" element={<Garden />} />
          <Route path="/garden/:id" element={<GardenDetail />} />
          <Route path="/cv" element={<CV />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/stories/:date" element={<StoryDynamic />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
