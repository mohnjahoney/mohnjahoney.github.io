import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import CinematicHome from "./pages/CinematicHome";
import MaskExperiment from "./pages/MaskExperiment";
import RoleNav from "./features/role-nav/RoleNavPage";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Music from "./pages/Music";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<RoleNav />} />
          <Route path="/simple" element={<Home />} />
          <Route path="/cinematic" element={<CinematicHome />} />
          <Route path="/mask-experiment" element={<MaskExperiment />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/music" element={<Music />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
