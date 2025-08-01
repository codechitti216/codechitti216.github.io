import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Garden from './pages/Garden';
import GardenDetail from './pages/GardenDetail';
import InnerCircle from './pages/InnerCircle';
import CV from './pages/CV';
import Contact from './pages/Contact';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/garden" element={<Garden />} />
          <Route path="/garden/:id" element={<GardenDetail />} />
          <Route path="/inner-circle" element={<InnerCircle />} />
        <Route path="/cv" element={<CV />} />
        <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
