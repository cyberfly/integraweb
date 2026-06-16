import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { createMpaPlugin } from "vite-plugin-virtual-mpa";
import { resolve } from "path";
import { readFileSync } from "fs";
import { getContentFromDirectory } from "./lib/content.js";
import {
  generateBlogCard,
  generateBlogListContent,
  generateBlogPostContent,
  generateTrainingListContent,
  generateTrainingDetail,
  generateUpcomingBanner,
  generateTrainingHighlight,
} from "./lib/templates.js";

const __dirname = resolve();

const blogDir = resolve(__dirname, "content/blog");
const blogPosts = getContentFromDirectory(blogDir, {
  sortBy: "date",
  order: "desc",
});

const recentBlogPosts = blogPosts.slice(0, 3);

const trainingDir = resolve(__dirname, "content/training");
const trainings = getContentFromDirectory(trainingDir, {
  sortBy: "date",
  order: "desc",
});

const blogListTemplate = readFileSync(
  resolve(__dirname, "templates/blog-list.html"),
  "utf-8"
);
const blogPostTemplate = readFileSync(
  resolve(__dirname, "templates/blog-post.html"),
  "utf-8"
);
const trainingListTemplate = readFileSync(
  resolve(__dirname, "templates/training-list.html"),
  "utf-8"
);

const indexContent = readFileSync(resolve(__dirname, "index.html"), "utf-8");
const aboutContent = readFileSync(resolve(__dirname, "about.html"), "utf-8");
const servicesContent = readFileSync(resolve(__dirname, "services.html"), "utf-8");
const contactContent = readFileSync(resolve(__dirname, "contact.html"), "utf-8");

function generateHomepageContent() {
  const recentBlogHtml = recentBlogPosts
    .map((post, i) => generateBlogCard(post, i))
    .join("\n");
  return indexContent
    .replace("<%- recentBlogPosts %>", recentBlogHtml)
    .replace("<%- upcomingBanner %>", generateUpcomingBanner(trainings))
    .replace("<%- trainingHighlight %>", generateTrainingHighlight(trainings));
}

function generateTrainingListPage() {
  return generateTrainingListContent(trainings, trainingListTemplate);
}

const pages = [
  {
    name: "index",
    entry: "/src/main.js",
    data: {
      title: "Integra Solid — Integrate AI. Automate Work. Accelerate Growth.",
      description: "Integra Solid helps businesses integrate AI, automate workflows, and upskill teams. From manual to intelligent — we guide your AI transformation.",
      activePage: "home",
      content: generateHomepageContent(),
    },
  },
  {
    name: "about",
    entry: "/src/main.js",
    data: {
      title: "About — Integra Solid",
      description: "Learn how Integra Solid guides businesses through AI transformation — from strategy to implementation to team readiness.",
      activePage: "about",
      content: aboutContent,
    },
  },
  {
    name: "services",
    entry: "/src/main.js",
    data: {
      title: "Services — Integra Solid",
      description: "AI Integration, AI Automation, and AI Training — three core services to transform your business from manual to intelligent.",
      activePage: "services",
      content: servicesContent,
    },
  },
  {
    name: "contact",
    entry: "/src/main.js",
    data: {
      title: "Contact — Integra Solid",
      description: "Book a free consultation with Integra Solid and discover how AI can work for your business.",
      activePage: "contact",
      content: contactContent,
    },
  },
  {
    name: "blog",
    entry: "/src/main.js",
    data: {
      title: "Blog — Integra Solid",
      description: "AI insights, automation tips, and transformation stories from the Integra Solid team.",
      activePage: "blog",
      content: generateBlogListContent(blogPosts, blogListTemplate),
    },
  },
  {
    name: "training",
    entry: "/src/main.js",
    data: {
      title: "Training — Integra Solid",
      description: "Hands-on AI training from Integra Solid — Claude Code mastery, vibe coding for beginners, and private team sessions. See our past and upcoming cohorts.",
      activePage: "training",
      content: generateTrainingListPage(),
    },
  },
  ...trainings.map((item) => ({
    name: `training-${item.slug}`,
    filename: `training/${item.slug}.html`,
    entry: "/src/main.js",
    data: {
      title: `${item.frontmatter.title} — Integra Solid`,
      description: item.frontmatter.summary,
      activePage: "training",
      content: generateTrainingDetail(item, trainings),
    },
  })),
  ...blogPosts.map((post) => ({
    name: `blog-${post.slug}`,
    filename: `blog/${post.slug}.html`,
    entry: "/src/main.js",
    data: {
      title: `${post.frontmatter.title} — Integra Solid`,
      description: post.frontmatter.description,
      activePage: "blog",
      content: generateBlogPostContent(post, blogPostTemplate, blogPosts),
    },
  })),
];

const rewrites = [
  { from: /^\/$/, to: "/index.html" },
  ...blogPosts.map((post) => ({
    from: new RegExp(`^/blog/${post.slug}(\.html)?$`),
    to: `/blog/${post.slug}.html`,
  })),
  ...trainings.map((item) => ({
    from: new RegExp(`^/training/${item.slug}(\.html)?$`),
    to: `/training/${item.slug}.html`,
  })),
];

const rootRewrite = {
  name: "root-rewrite",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === "/") req.url = "/index.html";
      next();
    });
  },
};

export default defineConfig({
  plugins: [
    rootRewrite,
    tailwindcss(),
    createMpaPlugin({
      template: "base.html",
      pages,
      rewrites,
    }),
  ],
});
