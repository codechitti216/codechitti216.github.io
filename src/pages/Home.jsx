import { Github, Mail, Linkedin, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import TextScramble from '../components/TextScramble';

const timeline = [
  {
    name: 'Mercedes-Benz R&D',
    logo: '/logos/mercedes.png',
    url: 'https://www.mbrdi.co.in/',
    role: 'Research Engineer',
    period: ' Sep 2025 - Aug 2026',
    description: 'First introduction to working at big scale. Taught me how to work in an organized manner, prioritization, what corporates actually care about, and how to ship in a real team.',
    mentors: [],
    links: [],
    photo: '/assets/mbrdi-team-outing.jpg',
  },
  {
    name: 'AI & Robotics Lab, IISc',
    logo: '/logos/iisc.png',
    url: 'https://iisc.ac.in/',
    role: 'Research Intern',
    period: 'Jan 2025 – Jul 2025',
    description: 'Got introduced to Robotics, Visual Navigation, and the standard of rigorous research. Taught me adversarial thinking.',
    mentors: [
      { name: 'Dr. Rajini Makam', url: 'https://in.linkedin.com/in/rajinimakam' },
      { name: 'Prof. Suresh Sundaram', url: 'https://aero.iisc.ac.in/people/sureshsundaram/' },
    ],
    links: [
      { label: 'Code', url: 'https://github.com/codechitti216/AIRL_Work' },
      { label: 'Thesis', url: 'https://drive.google.com/file/d/12lxM_wQ9xsNQrMeVWLbBEVxs8huI3taH/view' },
    ],
    photo: '/assets/iisc-photo.jpg',
  },
  {
    name: 'GVCL, IIIT Bangalore',
    logo: '/logos/GVCL.jpg',
    url: 'https://www.iiitb.ac.in/',
    role: 'Research Intern',
    period: 'Jul 2024 - Dec 2024',
    description: 'Got introduced to 3D Vision and Perception and Multimodal Fusion',
    mentors: [
      { name: 'Prof. Jaya Sreevalsan Nair', url: 'https://www.iiitb.ac.in/faculty/jaya-sreevalsan-nair' },
    ],
    links: [
      { label: 'Thesis', url: 'https://drive.google.com/file/d/1NCWIILbvL6AOrhtrmfDbKl6pTAi8XbU6/view' },
    ],
  },
  {
    name: 'AI4Bharat, IIT Madras',
    logo: '/logos/iit-madras.png',
    url: 'https://ai4bharat.iitm.ac.in/',
    role: 'Research Intern',
    period: 'Aug 2023 - Sep 2023',
    description: "Prof. Mitesh Khapra's Deep Learning lectures were the foundation stone. Got introduced to data at scale, the background work that goes into corpus creation and curation. Also, IIT Madras in rainy season is a vibe. Looking at deer and monkeys from the Coffee Day inside campus, Paniyaram outside the Velachery gate.",
    mentors: [
      { name: 'Md Safi Ur Rahman Khan', url: 'http://safikhansoofiyani.github.io/' },
      { name: 'Prof. Mitesh Khapra', url: 'https://ai4bharat.iitm.ac.in/people' },
    ],
    links: [],
    video: '/assets/iitm-campus.mp4',
  },
  {
    name: 'BITS Pilani',
    logo: '/logos/bits-pilani.png',
    url: 'https://www.bits-pilani.ac.in/',
    role: 'Dual Degree, Engineering & Mathematics',
    period: 'Sep 2020 – Sep 2025',
    sections: [
      {
        label: 'Favourite Courses',
        items: ['Elementary Real Analysis', 'Measure Theory', 'Topology', 'Machine Learning', 'Fundamentals of Data Science'],
      },
      {
        label: 'Study Projects',
        items: [
          { text: 'Algebraic Topology', mentor: { name: 'Prof. Sharan Gopal', url: 'https://www.bits-pilani.ac.in/sharan-gopal/' } },
          { text: 'Algorithms & Probabilistic Methods' },
        ],
      },
      {
        label: 'Research Projects',
        items: [
          { text: '2D Vision — Detection & Image Processing', mentors: [
            { name: 'Prof. Jagadeesh Anmala', url: 'https://www.bits-pilani.ac.in/hyderabad/jagadeesh-anmala/' },
            { name: 'Prof. Mohan S C', url: 'https://www.bits-pilani.ac.in/hyderabad/mohan-s-c/' },
          ]},
        ],
      },
    ],
    mentors: [],
    links: [],
    photo: '/assets/bits-pilani-photo.jpg',
  },
];

function TimelineEntry({ entry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <a href={entry.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img
            src={entry.logo}
            alt={entry.name}
            className="h-7 w-7 object-contain rounded grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100"
          />
        </a>
        <div className="w-px flex-1 bg-gray-100 mt-2" />
      </div>

      <div className="pb-8 min-w-0 flex-1">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full text-left flex items-start justify-between gap-2"
        >
          <div>
            <span className="text-sm font-medium text-gray-800">{entry.name}</span>
            <span className="text-xs text-gray-400 ml-2">{entry.role}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-gray-400">{entry.period}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {open && (
          <div className="mt-2 space-y-2">
            {entry.description && <p className="text-sm text-gray-500 leading-relaxed">{entry.description}</p>}
            {entry.sections && entry.sections.map(section => (
              <div key={section.label}>
                <p className="text-xs font-medium text-gray-500 mt-2 mb-1">{section.label}</p>
                <ul className="space-y-0.5">
                  {section.items.map((item, i) => {
                    const text = typeof item === 'string' ? item : item.text;
                    const mentors = typeof item === 'string' ? [] : (item.mentors || (item.mentor ? [item.mentor] : []));
                    return (
                      <li key={i} className="text-xs text-gray-400 flex flex-wrap items-baseline gap-1">
                        <span>{text}</span>
                        {mentors.length > 0 && (
                          <span className="text-gray-300">
                            ({mentors.map((m, mi) => (
                              <span key={m.name}>
                                <a href={m.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 decoration-gray-200 hover:text-gray-600 transition-colors">{m.name}</a>
                                {mi < mentors.length - 1 ? ', ' : ''}
                              </span>
                            ))})
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {entry.mentors.length > 0 && (
              <p className="text-xs text-gray-400">
                Mentored by{' '}
                {entry.mentors.map((m, i) => (
                  <span key={m.name}>
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 decoration-gray-300 hover:text-gray-700 transition-colors">
                      {m.name}
                    </a>
                    {i < entry.mentors.length - 1 ? ' & ' : ''}
                  </span>
                ))}
              </p>
            )}

            {(entry.links.length > 0 || entry.photo || entry.video) && (
              <div className="flex items-center gap-3 pt-1">
                {entry.links.map(l => (
                  <a
                    key={l.label}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2 decoration-gray-300"
                  >
                    [{l.label}]
                  </a>
                ))}
                {entry.photo && (
                  <a
                    href={entry.photo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2 decoration-gray-300"
                  >
                    [Photo]
                  </a>
                )}
                {entry.video && (
                  <a
                    href={entry.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2 decoration-gray-300"
                  >
                    [Video]
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="py-12 space-y-14">
      <section className="flex items-start gap-6">
        <img
          src="/profile.jpg"
          alt="Surya Chitti"
          className="w-20 h-20 rounded-full object-cover shrink-0"
        />
        <div className="space-y-3">
          <h1 className="font-serif text-3xl font-semibold text-gray-900">
            <TextScramble text="Surya Chitti" />
          </h1>
          <p className="text-base text-gray-600 leading-relaxed max-w-lg">
            You either contribute to the rise of AI or become so good at something that you're irreplaceable. Chasing the intersection of both.
          </p>
          <p className="text-sm text-gray-400">
            When I'm not doing that, I'm <a href="https://www.instagram.com/garagesuri216/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors underline decoration-gray-300 underline-o�\\set-2">recreating epic soundtracks on GarageBand. My GOATS: A R Rahman, Ilayaraja, Hans Zimmer, Ludwig Göransson.</a>
          </p>
          <div className="flex items-center gap-5 pt-1 text-sm text-gray-400">
            <a href="mailto:suryachitti216@gmail.com" className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
            <a href="https://github.com/codechitti216" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
            <a href="https://linkedin.com/in/surya-g-s-chitti" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </a>
          </div>
        </div>
      </section>

      <section>
        {timeline.map((entry) => (
          <TimelineEntry key={entry.name} entry={entry} />
        ))}
      </section>
    </div>
  );
}
