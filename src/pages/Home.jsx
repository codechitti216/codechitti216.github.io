import { Github, Mail, Linkedin, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import TextScramble from '../components/TextScramble';

const timeline = [
  {
    name: 'Mercedes-Benz R&D India',
    logo: '/logos/mercedes.png',
    url: 'https://www.mbrdi.co.in/',
    role: 'Research Engineer',
    period: 'Sep 2025 – Aug 2026',
    description: 'First introduction to working at big scale — end-to-end autonomous driving, applied research team. Taught me how to work in an organized manner, prioritization, what corporates actually care about, and how to ship in a real team.',
    mentors: [],
    links: [],
    photo: '/assets/mbrdi-team-outing.jpg',
  },
  {
    name: 'IISc Bangalore',
    logo: '/logos/iisc.png',
    url: 'https://iisc.ac.in/',
    role: 'Research Intern',
    period: 'Jan 2025 – Jul 2025',
    description: 'Worked on deep learning research in the Computational Mathematics group.',
    mentors: [
      { name: 'Dr. Rajini Makam', url: 'https://math.iisc.ac.in/~rajinimakam/' },
      { name: 'Prof. Suresh Sundaram', url: 'https://aero.iisc.ac.in/people/suresh-sundaram/' },
    ],
    links: [
      { label: 'Code', url: 'https://github.com/codechitti216' },
      { label: 'Thesis', url: '#' },
    ],
    photo: '/assets/iisc-photo.jpg',
  },
  {
    name: 'GVCL, IIIT Bangalore',
    logo: '/logos/GVCL.jpg',
    url: 'https://www.iiitb.ac.in/',
    role: 'Research Intern',
    period: 'Jul 2024 – Dec 2024',
    description: 'Research in the Graph Visualization and Computing Lab.',
    mentors: [
      { name: 'Prof. Jaya Sreevalsan Nair', url: 'https://faculty.iiitb.ac.in/jaya/' },
    ],
    links: [
      { label: 'Thesis', url: '#' },
    ],
    photo: null,
  },
  {
    name: 'AI4Bharat, IIT Madras',
    logo: '/logos/iit-madras.png',
    url: 'https://ai4bharat.iitm.ac.in/',
    role: 'Research Intern',
    period: 'Aug 2023 – Sep 2023',
    description: "Prof. Mitesh Khapra's Deep Learning lectures were the foundation stone of my ML journey. Getting to work at AI4Bharat was a full-circle moment.",
    mentors: [
      { name: 'Md Safi Ur Rahman Khan', url: '#' },
      { name: 'Prof. Mitesh Khapra', url: 'https://www.cse.iitm.ac.in/~miteshk/' },
    ],
    links: [
      { label: 'Video', url: '/assets/iitm-campus.mp4' },
    ],
    photo: null,
  },
  {
    name: 'BITS Pilani',
    logo: '/logos/bits-pilani.png',
    url: 'https://www.bits-pilani.ac.in/',
    role: 'Dual Degree, B.E. + M.Sc. Mathematics',
    period: 'Sep 2020 – Sep 2025',
    description: 'Five years of engineering and mathematics. Where the obsession started.',
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
            <p className="text-sm text-gray-500 leading-relaxed">{entry.description}</p>

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

            {(entry.links.length > 0 || entry.photo) && (
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
      {/* Bio */}
      <section className="flex items-start gap-6">
        <img
          src="/profile.jpg"
          alt="Surya Chitti"
          className="w-32 h-32 rounded-full object-cover shrink-0"
        />
        <div className="space-y-3 max-w-lg">
        <h1 className="font-serif text-3xl font-semibold text-gray-900">
          <TextScramble text="Surya Chitti" />
        </h1>
        <p className="text-base text-gray-600 leading-relaxed">
          Mathematics @BITS Pilani. You either contribute to the rise of AI or become so good at something that you're irreplaceable. Chasing the intersection of both.
        </p>
        <p className="text-sm text-gray-400">
          When I'm not doing that, I'm{' '}
          <a
            href="https://www.instagram.com/garagesuri216/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 transition-colors underline decoration-gray-300 underline-offset-2"
          >
            recreating epic soundtracks on GarageBand
          </a>
          . The GOATs: A R Rahman, Ilayaraja, Hans Zimmer, Ludwig Göransson.
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
          <a href="/cv.pdf" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
            CV ↗
          </a>
        </div>
        </div>
      </section>
      <section>
        {timeline.map(entry => (
          <TimelineEntry key={entry.name} entry={entry} />
        ))}
      </section>
    </div>
  );
}
