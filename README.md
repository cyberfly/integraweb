# integrasolid

A modern static website built with staticbase.

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production (dist/)
npm run preview  # Preview production build
```

## Stack

- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **Alpine.js** — Interactivity
- **Marked** — Markdown parser
- **Gray Matter** — Frontmatter

## Adding Blog Posts

Create `content/blog/<slug>.md`:

```markdown
---
title: "Post Title"
slug: post-slug
date: 2026-01-28
description: "Brief description"
---

Content here...
```

## Deployment

Supports Netlify, Vercel, GitHub Pages, Cloudflare Pages.
