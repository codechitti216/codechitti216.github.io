# Surya G S Chitti - Personal Website

A personal website designed as a digital lab notebook for a researcher, builder, and thinker. Built with React and featuring a scientific manuscript aesthetic.

## 🌐 Live Website

**Production URL:** https://pqjxagbg.manus.space

## 🎯 Project Overview

This website serves as:
- **Professional Portfolio**: Showcasing research projects and technical work
- **Digital Lab Notebook**: A knowledge garden for evolving ideas and insights
- **Local-Markdown-Editable System**: Easy content management through markdown files
- **Scientific Manuscript Aesthetic**: Clean, typographically sound design

## 🏗️ Architecture

### Framework & Technologies
- **Frontend**: React 19.1.0 with Vite
- **Styling**: Tailwind CSS with custom academic theme
- **UI Components**: shadcn/ui components
- **Typography**: IBM Plex Serif (headings) + IBM Plex Sans (body)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Content**: Markdown-powered with react-markdown
- **Deployment**: Manus deployment platform

### Design Philosophy
- **Scientific Manuscript Aesthetic**: Serif headings, clean typography, academic spacing
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Accessibility**: Proper semantic HTML and ARIA labels
- **Performance**: Optimized build with code splitting

## 📁 Project Structure

```
surya-website/
├── public/
│   ├── cv.pdf                 # Downloadable CV
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── Layout.jsx        # Main layout component
│   ├── pages/
│   │   ├── Home.jsx          # Hero/About page
│   │   ├── Projects.jsx      # Projects listing
│   │   ├── Garden.jsx        # Knowledge garden
│   │   ├── CV.jsx           # CV page
│   │   └── Contact.jsx       # Contact information
│   ├── App.jsx              # Main app with routing
│   ├── App.css              # Custom styles and theme
│   └── main.jsx             # Entry point
├── content/
│   ├── projects/            # Project markdown files
│   ├── garden/              # Knowledge garden entries
│   └── data/                # Additional data files
├── package.json
└── README.md
```

## 📝 Content Management

### Adding New Projects

1. Create a new markdown file in `content/projects/`
2. Use the following frontmatter format:

```markdown
---
title: "Project Title"
date: "YYYY-MM-DD"
status: "In Progress" | "Completed"
tags: ["tag1", "tag2", "tag3"]
institution: "Institution Name"
duration: "Duration"
---

# Project Title

## Overview
Brief description...

## Key Achievements
- Achievement 1
- Achievement 2

## Technical Details
Detailed information...
```

3. Update the `projectsData` array in `src/pages/Projects.jsx` to include the new project

### Adding Garden Entries

1. Create a new markdown file in `content/garden/`
2. Use the following frontmatter format:

```markdown
---
title: "Note Title"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
status: "evolving" | "active" | "growing" | "mature"
---

# Note Title

Content of your note...
```

3. Update the `gardenData` array in `src/pages/Garden.jsx` to include the new entry

### Garden Status Meanings
- **evolving**: Actively developing ideas
- **active**: Current focus area
- **growing**: Expanding knowledge
- **mature**: Well-developed thoughts

### Updating Personal Information

- **Contact Info**: Edit `src/pages/Contact.jsx`
- **CV Content**: Edit `src/pages/CV.jsx` and replace `public/cv.pdf`
- **About Section**: Edit the About section in `src/pages/Home.jsx`
- **Navigation**: Modify `src/components/Layout.jsx`

## 🚀 Development

### Prerequisites
- Node.js 20.18.0+
- pnpm (package manager)

### Local Development

1. **Clone and Setup**
```bash
git clone <repository-url>
cd surya-website
pnpm install
```

2. **Start Development Server**
```bash
pnpm run dev
```
The site will be available at `http://localhost:5173`

3. **Build for Production**
```bash
pnpm run build
```

### Available Scripts
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint

## 🎨 Customization

### Theme Colors
Edit CSS custom properties in `src/App.css`:
- `--primary`: Main accent color
- `--secondary`: Secondary color
- `--muted`: Muted text color
- `--border`: Border color

### Typography
- Headings use IBM Plex Serif
- Body text uses IBM Plex Sans
- Modify font imports in `src/App.css`

### Layout
- Main layout: `src/components/Layout.jsx`
- Page-specific layouts in individual page components
- Responsive breakpoints follow Tailwind CSS defaults

## 📱 Features

### Phase 1 (Implemented)
- ✅ Scientific manuscript design theme
- ✅ Hero/About Me page
- ✅ Projects page with filtering
- ✅ Knowledge garden with search and tags
- ✅ CV page with downloadable PDF
- ✅ Contact page
- ✅ Responsive design
- ✅ Production deployment

### Future Enhancements (Phase 2 & 3)
- Hidden `/ops` page for outreach tracking
- Goals/streak tracker
- Dark mode toggle
- Enhanced search functionality
- Footnotes and margin callouts
- Second CV version

## 🔧 Technical Details

### Dependencies
- **React**: 19.1.0
- **React Router**: 7.6.1
- **Tailwind CSS**: 4.1.7
- **Lucide React**: 0.510.0
- **React Markdown**: 10.1.0
- **Vite**: 6.3.5

### Performance
- Code splitting with React Router
- Optimized images and assets
- Minimal bundle size
- Fast loading times

### SEO & Accessibility
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support
- Screen reader friendly

## 📄 License

This project is for personal use. Feel free to use as inspiration for your own academic/research website.

## 🤝 Contributing

This is a personal website, but suggestions and improvements are welcome through issues or pull requests.

---

*Built with ❤️ for the research community*

