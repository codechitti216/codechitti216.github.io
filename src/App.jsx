import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import NoteDetail from "./pages/NoteDetail";
import CV from "./pages/CV";
import "./App.css";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="/cv" element={<CV />} />
          {/* Redirect old garden routes */}
          <Route path="/garden" element={<Notes />} />
          <Route path="/garden/:id" element={<NoteDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
