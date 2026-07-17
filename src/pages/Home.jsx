import { Link } from "react-router-dom";
import { ArrowRight, Github, Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-16 py-4">

      {/* Hero — minimal, content-first */}
      <section className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-gray-900 md:text-5xl">
          Surya Chitti
        </h1>
        <p className="max-w-2xl text-lg text-gray-600 leading-relaxed">
          I study how models learn &mdash; what they actually encode versus what we want them
          to encode, and what happens in the gap between training objectives and
          real-world tasks.
        </p>
        <p className="max-w-2xl text-base text-gray-500 leading-relaxed">
          Currently building perception systems for autonomous driving at Mercedes-Benz R&D India.
          Previously at IISc Bangalore, IIIT Bangalore, and AI4Bharat (IIT Madras).
          M.Sc. Mathematics, BITS Pilani.
        </p>
        <div className="flex items-center gap-5 pt-2 text-sm text-gray-500">
          <a href="mailto:suryachitti216@gmail.com" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
            <Mail className="h-4 w-4" /> suryachitti216@gmail.com
          </a>
          <a href="https://github.com/codechitti216" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>
      </section>

      {/* Investigations — the "damn!" content */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-gray-900">Investigations</h2>
        <p className="text-sm text-gray-500">
          Questions I&apos;m exploring. Some answered, some still open.
        </p>

        <div className="space-y-6 pt-2">
          <article className="border-l-2 border-gray-200 pl-5">
            <Link to="/notes/Gaussian_Splatting" className="group">
              <time className="text-xs text-gray-400 uppercase tracking-wide">2025</time>
              <h3 className="font-serif text-lg font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                Gaussian Splatting: From Theory to 54-Gaussian Optimization
              </h3>
              <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                Built 54 trainable Gaussians to reconstruct a Rubik&apos;s cube from 108 multi-view
                images. The most striking finding: Gaussians spontaneously organized into
                cube-like geometry from random initialization, purely from 2D supervision.
                Ablation studies in progress.
              </p>
            </Link>
          </article>

          <article className="border-l-2 border-gray-100 pl-5 opacity-60">
            <time className="text-xs text-gray-400 uppercase tracking-wide">Coming soon</time>
            <h3 className="font-serif text-lg font-medium text-gray-900">
              Is it fair to train every architecture on the same data?
            </h3>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              CNNs and ViTs have different inductive biases. Do they need different
              training data to reach their potential?
            </p>
          </article>

          <article className="border-l-2 border-gray-100 pl-5 opacity-60">
            <time className="text-xs text-gray-400 uppercase tracking-wide">Coming soon</time>
            <h3 className="font-serif text-lg font-medium text-gray-900">
              Does self-supervised depth learn geometry or texture?
            </h3>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              MonoDepth2 produces good depth maps. But has it learned 3D structure, or
              has it memorized that certain textures correlate with depth?
            </p>
          </article>
        </div>
      </section>

      {/* Notes — the living knowledge base */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold text-gray-900">Notes</h2>
          <Link to="/notes" className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
            All notes <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <p className="text-sm text-gray-500">
          Things I&apos;m learning, organized by what I understand so far. Some polished, some rough.
        </p>

        <div className="grid gap-3 pt-2 md:grid-cols-2">
          {[
            { title: "Self-Supervised Depth Estimation", status: "seed", topic: "Perception" },
            { title: "Knowledge Distillation", status: "seed", topic: "Training" },
            { title: "BEV Representations", status: "seed", topic: "Perception" },
            { title: "Sensor Calibration (PnP, Hand-Eye)", status: "seed", topic: "Geometry" },
            { title: "Graph Neural Networks for QA", status: "seed", topic: "NLP / Graphs" },
            { title: "Gaussian Splatting", status: "growing", topic: "3D Reconstruction" },
          ].map((note) => (
            <div key={note.title} className="flex items-start gap-3 rounded-md border border-gray-100 px-4 py-3">
              <span className={`mt-1 inline-block h-2 w-2 rounded-full flex-shrink-0 ${
                note.status === "growing" ? "bg-green-400" : "bg-gray-300"
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-800">{note.title}</p>
                <p className="text-xs text-gray-400">{note.topic}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Work — brief, no resume dump */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-gray-900">Work</h2>

        <div className="space-y-4 pt-2">
          {[
            {
              role: "Perception Engineer",
              org: "Mercedes-Benz R&D India",
              period: "2025 \u2013 present",
              desc: "End-to-end autonomous driving. Multi-camera perception, self-supervised depth, knowledge distillation, closed-loop evaluation in CARLA.",
            },
            {
              role: "Research Intern",
              org: "IISc Bangalore (AI & Robotics Lab)",
              period: "Jan \u2013 Jul 2025",
              desc: "DVL velocity estimation for underwater drones (DRDO). Sole author of delivered production codebase.",
            },
            {
              role: "Research Intern",
              org: "IIIT Bangalore (GVCL)",
              period: "Jul \u2013 Dec 2024",
              desc: "3D point cloud segmentation. LiDAR-camera projection pipeline with ICP registration.",
            },
            {
              role: "Student Intern",
              org: "AI4Bharat, IIT Madras",
              period: "Aug \u2013 Sep 2023",
              desc: "Multilingual NLP data pipelines for Anuvaad translation platform. Prompt collection for instruction tuning.",
            },
          ].map((item) => (
            <div key={item.org} className="border-l-2 border-gray-200 pl-5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h3 className="text-sm font-medium text-gray-900">{item.role}</h3>
                <span className="text-sm text-gray-500">&mdash; {item.org}</span>
                <span className="text-xs text-gray-400">{item.period}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About — the person, not the resume */}
      <section className="space-y-3 border-t border-gray-100 pt-12">
        <h2 className="font-serif text-2xl font-semibold text-gray-900">About this site</h2>
        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
          This is where I document what I&apos;m learning, questions I&apos;m investigating,
          and papers I&apos;m thinking about. Some of it is polished. Most of it isn&apos;t.
          That&apos;s the point &mdash; it&apos;s a working notebook, not a portfolio.
        </p>
      </section>
    </div>
  );
}
