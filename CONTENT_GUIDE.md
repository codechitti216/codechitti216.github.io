# Content Editing Guide

This guide explains how to add, edit, and manage content on your personal website.

## 📝 Quick Start

Your website uses a hybrid approach: markdown files for content structure and React components for display. This allows you to easily edit content while maintaining a dynamic, interactive website.

## 🗂️ Content Structure

### Projects (`content/projects/`)

Each project is a markdown file with frontmatter metadata. Here's the template:

```markdown
---
title: "Your Project Title"
date: "2025-01-01"
status: "In Progress" | "Completed"
tags: ["Technology1", "Technology2", "Domain"]
institution: "Institution Name"
duration: "Time Period"
---

# Project Title

## Overview
Brief description of what the project does and its significance.

## Key Achievements
- Specific accomplishment 1
- Specific accomplishment 2
- Quantified results when possible

## Technical Details
### Architecture
Describe the technical approach

### Performance
Include metrics and benchmarks

### Technologies Used
List the tools, frameworks, and methods

## Impact
Describe the broader significance and applications
```

### Knowledge Garden (`content/garden/`)

Garden entries represent evolving thoughts and insights:

```markdown
---
title: "Your Insight Title"
date: "2025-01-01"
tags: ["Concept1", "Concept2"]
status: "evolving" | "active" | "growing" | "mature"
---

# Your Insight Title

## Background
Context and motivation for this note

## Key Observations
Your main insights and findings

## Technical Analysis
Detailed technical discussion

## Future Directions
Where this thinking might lead

## Connection to Broader Research
How this relates to your other work
```

## 🏷️ Status Guidelines

### Project Status
- **In Progress**: Currently working on this
- **Completed**: Finished and documented

### Garden Status
- **evolving**: Ideas in active development
- **active**: Current focus area
- **growing**: Expanding and connecting ideas
- **mature**: Well-developed, stable thoughts

## 🔄 Adding New Content

### Method 1: Direct File Creation (Recommended)

1. **For Projects**: Create `content/projects/project-name.md`
2. **For Garden**: Create `content/garden/topic-name.md`
3. **Update Component**: Add entry to the data array in the corresponding page component

### Method 2: Component Update

Currently, the website uses mock data arrays in the React components. To add content:

1. **Projects**: Edit `src/pages/Projects.jsx` → `projectsData` array
2. **Garden**: Edit `src/pages/Garden.jsx` → `gardenData` array

## 📊 Data Structure

### Project Entry
```javascript
{
  id: 'unique-slug',
  title: 'Project Title',
  date: '2025-01-01',
  status: 'In Progress',
  tags: ['Deep Learning', 'Computer Vision'],
  institution: 'Institution Name',
  duration: 'Jan 2025 - Present',
  excerpt: 'Brief description for listing page...'
}
```

### Garden Entry
```javascript
{
  id: 'unique-slug',
  title: 'Note Title',
  date: '2025-01-01',
  tags: ['Machine Learning', 'Research'],
  status: 'evolving',
  excerpt: 'Brief description for listing page...'
}
```

## 🎯 Content Best Practices

### Writing Style
- **Academic but Accessible**: Write for fellow researchers but keep it readable
- **Specific and Quantified**: Include metrics, numbers, and concrete results
- **Progressive Disclosure**: Start with overview, then dive into details
- **Cross-Reference**: Link related projects and garden entries

### Technical Content
- **Code Examples**: Use markdown code blocks with syntax highlighting
- **Diagrams**: Describe complex systems clearly
- **Results**: Always include performance metrics and comparisons
- **Reproducibility**: Provide enough detail for others to understand your work

### Garden Philosophy
- **Growth Mindset**: It's okay to have incomplete thoughts
- **Connections**: Link ideas across different entries
- **Evolution**: Update entries as your thinking develops
- **Honesty**: Include failures and lessons learned

## 🏷️ Tagging Strategy

### Project Tags
- **Technology**: Deep Learning, Computer Vision, NLP, etc.
- **Domain**: Robotics, Healthcare, Finance, etc.
- **Method**: Supervised Learning, Reinforcement Learning, etc.
- **Application**: Navigation, Detection, Classification, etc.

### Garden Tags
- **Concepts**: Attention Mechanisms, Transfer Learning, etc.
- **Domains**: Machine Learning, Robotics, etc.
- **Meta**: Research Methods, Career, etc.

## 📱 Personal Information Updates

### Contact Information
Edit `src/pages/Contact.jsx`:
- Email, phone, location
- Social media links
- Research interests

### CV Updates
1. **Content**: Edit `src/pages/CV.jsx`
2. **PDF**: Replace `public/cv.pdf` with updated version
3. **Download**: Ensure the download link works

### About Section
Edit `src/pages/Home.jsx`:
- Hero text and description
- Current focus
- Research areas
- Personal statement

## 🚀 Publishing Changes

### Local Testing
1. Make your changes
2. Run `pnpm run dev` to test locally
3. Check all pages and functionality

### Deployment
1. Build: `pnpm run build`
2. The website auto-deploys when you push to the main branch
3. Check the live site to ensure changes are reflected

## 🔧 Advanced Customization

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation in `src/components/Layout.jsx`

### Styling Changes
- **Colors**: Edit CSS variables in `src/App.css`
- **Typography**: Modify font imports and classes
- **Layout**: Adjust Tailwind classes in components

### New Features
- **Search**: Enhance the garden search functionality
- **Filtering**: Add more sophisticated filtering options
- **Analytics**: Add tracking for popular content

## 📈 Content Strategy

### Regular Updates
- **Weekly**: Add new garden entries for current thoughts
- **Monthly**: Update project status and add new projects
- **Quarterly**: Review and update personal information

### Content Calendar
- **Research Insights**: Document as you discover them
- **Project Milestones**: Update when you reach significant points
- **Learning Notes**: Capture new concepts and techniques
- **Reflection**: Periodic meta-analysis of your research journey

## 🤝 Collaboration

### Sharing Content
- **Individual Pages**: Share direct links to specific projects or notes
- **Collections**: Use tag filtering to create themed collections
- **Updates**: Highlight new content in your professional communications

### Feedback Integration
- **Comments**: Consider how to incorporate feedback from colleagues
- **Versions**: Track how your thinking evolves over time
- **Citations**: Reference and link to related work by others

---

Remember: This is your digital lab notebook. Make it work for your research process and thinking style. The goal is to create a system that grows with you and helps you think more clearly about your work.

