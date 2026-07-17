import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import NoteDetail from "./pages/NoteDetail";
import "./App.css";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          {/* Old routes redirect */}
          <Route path="/garden" element={<Notes />} />
          <Route path="/garden/:id" element={<NoteDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
