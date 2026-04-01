import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import labSnapshot from "../data/labSnapshot.json";

const DEFAULT_RESEARCH_LEDGER_URL = "https://codechitti216.github.io/research-lab/";

function formatLatestActivity(snapshot) {
  const latest = snapshot?.latestActivity;
  if (!latest?.completedAt) return null;

  const topicTitle = String(latest.topicTitle || "").trim();
  const taskTitle = String(latest.taskTitle || "").trim();

  if (topicTitle && taskTitle) {
    return `${topicTitle}: [${taskTitle}]`;
  }

  return topicTitle || taskTitle || null;
}

function formatSyncDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function Home() {
  const latestActivityLine = formatLatestActivity(labSnapshot);
  const latestActivityDate = formatSyncDate(labSnapshot?.latestActivity?.completedAt);
  const syncedAtLabel = formatSyncDate(labSnapshot?.syncedAt);
  const researchLedgerUrl = labSnapshot?.openResearchLedgerUrl || DEFAULT_RESEARCH_LEDGER_URL;

  return (
    <div className="space-y-12">
      <div className="flex justify-center pt-8">
        <img
          src="/assets/profile.jpg"
          alt="Surya G S Chitti"
          className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
        />
      </div>

      <section className="space-y-6 text-center">
        <h1 className="font-serif text-4xl font-semibold text-gray-900 md:text-5xl">
          Surya G S Chitti
        </h1>
        <p className="mx-auto max-w-3xl text-xl text-gray-600 md:text-2xl">
          E2E Autonomous Navigation - Deep Learning Researcher - Perception and Closed-Loop
          Autonomy
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 pb-3 md:gap-10">
          <div className="flex flex-col items-center">
            <img
              src="/assets/logos/mbrdi.png"
              alt="Mercedes-Benz Research & Development India"
              className="h-12 grayscale transition-all hover:grayscale-0 md:h-16"
            />
            <span className="mt-1 text-xs text-gray-500">
              Mercedes-Benz <br /> Research & Development India (MBRDI)
            </span>
          </div>
          <div className="flex flex-col items-center">
            <img
              src="/assets/logos/iisc.png"
              alt="IISc Bangalore"
              className="h-12 grayscale transition-all hover:grayscale-0 md:h-16"
            />
            <span className="mt-1 text-xs text-gray-500">IISc Bangalore</span>
          </div>
          <div className="flex flex-col items-center">
            <img
              src="/assets/logos/drdo.png"
              alt="DRDO"
              className="h-12 grayscale transition-all hover:grayscale-0 md:h-16"
            />
            <span className="mt-1 text-xs text-gray-500"></span>
          </div>
          <div className="flex flex-col items-center">
            <img
              src="/assets/logos/bits.png"
              alt="BITS Pilani"
              className="h-12 grayscale transition-all hover:grayscale-0 md:h-16"
            />
            <span className="mt-1 text-xs text-gray-500">BITS Pilani</span>
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

      <section className="content-card space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold">The Research Lab</h2>
            <p className="mt-2 text-sm text-gray-600">
              A small portfolio mirror of the local lab. The full public timeline lives in the
              ledger page.
            </p>
          </div>
          {syncedAtLabel ? (
            <div className="text-xs uppercase tracking-[0.18em] text-gray-500">
              Synced {syncedAtLabel}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
          <span className="font-medium">Latest Activity:</span>{" "}
          {latestActivityLine ? (
            <span>
              {latestActivityLine}
              {latestActivityDate ? ` (${latestActivityDate})` : ""}
            </span>
          ) : (
            <span>No task checkoffs have been synced yet.</span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <a href={researchLedgerUrl} target="_blank" rel="noreferrer">
              Open Research Ledger
            </a>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="content-card">
          <h3 className="mb-3 font-serif text-xl font-semibold">Current Focus - MBRDI</h3>
          <p className="mb-4 text-gray-700">
            Perception systems for E2E autonomous navigation. Working on the transition from
            open-loop autonomy to closed-loop autonomy.
          </p>
          <Link to="/projects" className="academic-link">
            Explore current work -&gt;
          </Link>
        </div>
        <div className="content-card">
          <h3 className="mb-3 font-serif text-xl font-semibold">Research Areas</h3>
          <div className="mb-4 space-y-2">
            <span className="tag">Computer Vision</span>
            <span className="tag">3D Perception</span>
            <span className="tag">Visual Navigation</span>
            <span className="tag">Multi-Modal Fusion</span>
            <span className="tag">Deep Learning</span>
          </div>
          <Link to="/garden" className="academic-link">
            Browse knowledge garden -&gt;
          </Link>
        </div>
        <div className="content-card">
          <h3 className="mb-3 font-serif text-xl font-semibold">Connect</h3>
          <div className="space-y-3">
            <a
              href="mailto:suryachitti216@gmail.com"
              className="flex items-center text-sm text-gray-700 hover:text-gray-900"
            >
              <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">suryachitti216@gmail.com</span>
            </a>
            <a
              href="https://github.com/codechitti216"
              className="flex items-center text-sm text-gray-700 hover:text-gray-900"
            >
              <Github className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/surya-g-s-chitti"
              className="flex items-center text-sm text-gray-700 hover:text-gray-900"
            >
              <Linkedin className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </section>

      <section className="prose max-w-none">
        <h2>About Me</h2>

        <p>
          Perception Engineer at
          <a href="https://www.mbrdi.co.in/" target="_blank" style={{ color: "blue" }}>
            {" "}
            Mercedes-Benz Research & Development India (MBRDI)
          </a>
          , working on end-to-end autonomous navigation systems with a focus on moving from
          open-loop to closed-loop autonomy. I studied Mathematics at BITS Pilani, which gave me
          the push to dive into the mathematical side of machine learning and eventually deep
          learning.
        </p>

        <p>
          My work spans Robotics, Perception, and AI. From classical computer vision to designing
          deep learning models for real world deployment. I have built autonomy stacks across
          sensor modalities including vision, LiDAR, and Doppler Velocity Loggers (DVL), with an
          emphasis on reliability in uncontrolled environments.
        </p>

        <p>
          I previously worked at the{" "}
          <a
            href="https://www.linkedin.com/company/artificial-intelligence-and-robotics-laboratory/posts/?feedView=all"
            target="_blank"
            style={{ color: "blue" }}
          >
            Artificial Intelligence & Robotics Lab
          </a>{" "}
          at IISc Bangalore under{" "}
          <a
            href="https://aero.iisc.ac.in/people/sureshsundaram/"
            target="_blank"
            style={{ color: "blue" }}
          >
            Professor Suresh Sundaram
          </a>{" "}
          where I focused on precision navigation and perception of underwater drones and visual
          navigation of marine surface vehicles.
        </p>

        <p>
          My research interests center on the synthetic-to-real gap in deep learning and
          understanding why models that perform well in curated datasets fail in the field and
          developing perception systems that remain robust under noise, drift, and the complexities
          of real environments.
        </p>

        <p>
          This website is my digital lab notebook. A place to document experiments, trace ideas,
          and build a long-term knowledge system. It serves both as a professional portfolio and a
          personal research garden.
        </p>
      </section>
    </div>
  );
}
