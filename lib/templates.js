/* ---------------------------------------------------------------- Blog */

const BLOG_ACCENTS = ["a-brand", "a-indigo", "a-mint"];

export function readingTime(html) {
  const text = String(html || "").replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

const shortDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

const longDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

export function generateBlogCard(post, index = 0) {
  const { frontmatter } = post;
  const accent = BLOG_ACCENTS[index % BLOG_ACCENTS.length];
  const category = frontmatter.category || "Insights";
  const rt = readingTime(post.content);
  const url = `/blog/${post.slug}.html`;
  return `
    <article class="blog-card ${accent} reveal">
      <div class="bc-top">
        <span class="bc-cat">${category}</span>
        <span class="bc-rt">${rt}</span>
      </div>
      <h3><a href="${url}">${frontmatter.title}</a></h3>
      <p>${frontmatter.description || ""}</p>
      <div class="bc-foot">
        <time datetime="${frontmatter.date}">${shortDate(frontmatter.date)}</time>
        <a href="${url}" class="read-more">Read <span aria-hidden="true">→</span></a>
      </div>
    </article>
  `;
}

export function generateFeaturedBlogCard(post) {
  const { frontmatter } = post;
  const category = frontmatter.category || "Insights";
  const rt = readingTime(post.content);
  const url = `/blog/${post.slug}.html`;
  return `
    <article class="blog-featured reveal">
      <a class="bf-media" href="${url}" tabindex="-1" aria-hidden="true">
        <span class="bf-mark"></span>
        <span class="bf-kicker">Integrate · Automate · Accelerate</span>
      </a>
      <div class="bf-body">
        <div class="bc-top">
          <span class="bc-cat featured">★ Featured</span>
          <span class="bc-rt">${rt}</span>
        </div>
        <h2><a href="${url}">${frontmatter.title}</a></h2>
        <p>${frontmatter.description || ""}</p>
        <div class="bf-foot">
          <div class="bf-author">
            <span class="bf-badge">IS</span>
            <div><strong>Integra Solid</strong><small>${longDate(frontmatter.date)}</small></div>
          </div>
          <a href="${url}" class="btn btn-primary">Read article →</a>
        </div>
      </div>
    </article>
  `;
}

export function generateBlogListContent(posts, template) {
  if (!posts.length) {
    return template
      .replace("<%- featuredPost %>", "")
      .replace(
        "<%- moreArticles %>",
        `<p class="lede" style="text-align:center;margin:0 auto">No articles yet — check back soon.</p>`
      );
  }

  const [featured, ...rest] = posts;
  const featuredHtml = generateFeaturedBlogCard(featured);
  const moreArticles = rest.length
    ? `
      <div class="blog-more-head reveal">
        <h2>More articles</h2>
        <span class="bm-line"></span>
      </div>
      <div class="blog-grid">
        ${rest.map((p, i) => generateBlogCard(p, i)).join("\n")}
      </div>`
    : "";

  return template
    .replace("<%- featuredPost %>", featuredHtml)
    .replace("<%- moreArticles %>", moreArticles);
}

export function generateBlogPostContent(post, template, allPosts = []) {
  const { frontmatter, content } = post;
  const category = frontmatter.category || "Insights";
  const rt = readingTime(content);

  const idx = allPosts.findIndex((p) => p.slug === post.slug);
  const nav = prevNextNav({
    older: idx >= 0 ? allPosts[idx + 1] : null,
    newer: idx > 0 ? allPosts[idx - 1] : null,
    urlFor: (p) => `/blog/${p.slug}.html`,
    label: (p) => p.frontmatter.title,
    allHref: "/blog.html",
    allLabel: "All articles",
  });

  const related = allPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const relatedHtml = related.length
    ? `
      <section class="pad-tight alt-bg">
        <div class="wrap">
          <div class="blog-more-head reveal">
            <h2>Keep reading</h2>
            <span class="bm-line"></span>
          </div>
          <div class="blog-grid">
            ${related.map((p, i) => generateBlogCard(p, i)).join("\n")}
          </div>
        </div>
      </section>`
    : "";

  const cta = `
    <section class="post-cta">
      <div class="wrap">
        <div class="post-cta-inner reveal">
          <div class="post-cta-copy">
            <span class="eyebrow">Ready to act on this?</span>
            <h2>Let's put AI to work in your business.</h2>
            <p>Book a free consultation and we'll map the highest-impact ways to integrate, automate, and accelerate — tailored to your team.</p>
          </div>
          <div class="post-cta-actions">
            <a href="/contact.html" class="btn btn-white">Book a free consultation →</a>
            <a href="/services.html" class="btn btn-ghost-light">Explore our services</a>
          </div>
        </div>
      </div>
    </section>`;

  return template
    .replace(/<%=\s*category\s*%>/g, category)
    .replace(/<%=\s*title\s*%>/g, frontmatter.title)
    .replace(/<%=\s*date\s*%>/g, longDate(frontmatter.date))
    .replace(/<%=\s*isoDate\s*%>/g, new Date(frontmatter.date).toISOString().slice(0, 10))
    .replace(/<%=\s*readTime\s*%>/g, rt)
    .replace(/<%-\s*content\s*%>/g, content)
    .replace("<%- postNav %>", nav)
    .replace("<%- postCta %>", cta)
    .replace("<%- relatedPosts %>", relatedHtml);
}

/* ---------------------------------------------------------------- Training */

const TRAINING_URL = (slug) => `/training/${slug}.html`;

export function generateUpcomingBanner(trainings) {
  const upcoming = trainings
    .filter((t) => t.frontmatter.status === "upcoming")
    .sort((a, b) => new Date(a.frontmatter.date) - new Date(b.frontmatter.date));
  if (!upcoming.length) return "";
  const fm = upcoming[0].frontmatter;
  return `
    <section class="promo">
      <div class="wrap promo-inner">
        <div class="promo-left">
          <span class="promo-tag">◆ Upcoming · ${fm.dateLabel}</span>
          <strong>${fm.title}</strong>
          <span class="promo-sub">${fm.tagline || fm.summary}</span>
        </div>
        <div class="promo-cta">
          <a href="${TRAINING_URL(upcoming[0].slug)}" class="btn btn-white">Details &amp; register — ${fm.price} →</a>
        </div>
      </div>
    </section>`;
}

export function generateTrainingHighlight(trainings, limit = 3) {
  if (!trainings.length) return "";
  const upcoming = trainings.filter((t) => t.frontmatter.status === "upcoming");
  const past = trainings.filter((t) => t.frontmatter.status !== "upcoming");
  const featured = [...upcoming, ...past].slice(0, limit);
  const cards = featured.map(generateTrainingCard).join("\n");
  return `
    <section class="pad">
      <div class="wrap">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:40px;gap:20px;flex-wrap:wrap">
          <div>
            <span class="eyebrow reveal">Learn it yourself</span>
            <h2 class="reveal" style="margin-bottom:8px">Hands-on AI training</h2>
            <p class="lede reveal">From complete beginner to advanced developer — live, practical sessions you can join.</p>
          </div>
          <a href="/training.html" style="font-family:var(--mono);font-size:.82rem;font-weight:600;color:var(--brand);text-decoration:none;letter-spacing:.04em">View all training →</a>
        </div>
        <div class="training-grid">${cards}</div>
      </div>
    </section>`;
}

function statusBadge(status) {
  const label = status === "upcoming" ? "Upcoming" : "Past";
  return `<span class="status-badge ${status === "upcoming" ? "upcoming" : "past"}">${label}</span>`;
}

export function generateTrainingCard(item) {
  const fm = item.frontmatter;
  const url = TRAINING_URL(item.slug);
  return `
    <article class="training-card reveal">
      <div class="t-top">
        <time datetime="${fm.date}">${fm.dateLabel || fm.date}</time>
        ${statusBadge(fm.status)}
      </div>
      <span class="t-tagline">${fm.series || fm.edition || ""}</span>
      <h3><a href="${url}">${fm.title}</a></h3>
      <p>${fm.summary || ""}</p>
      <div class="t-meta-row">
        <span>◆ ${fm.format || ""}</span>
        <span>◷ ${fm.duration || ""}</span>
        <span>● ${fm.level || ""}</span>
      </div>
      <a href="${url}" class="read-more">${fm.status === "upcoming" ? "Register & details" : "View recap"} →</a>
    </article>
  `;
}

export function generateTrainingListContent(trainings, template) {
  const upcoming = trainings.filter((t) => t.frontmatter.status === "upcoming");
  const past = trainings.filter((t) => t.frontmatter.status !== "upcoming");

  const section = (eyebrow, heading, blurb, items, extraClass = "") => {
    if (!items.length) return "";
    const cards = items.map(generateTrainingCard).join("\n");
    return `
      <section class="pad-tight ${extraClass}">
        <div class="wrap">
          <span class="eyebrow reveal">${eyebrow}</span>
          <h2 class="reveal">${heading}</h2>
          <p class="lede reveal" style="margin-bottom:8px">${blurb}</p>
          <div class="training-grid" style="margin-top:40px">${cards}</div>
        </div>
      </section>`;
  };

  const sections =
    section(
      "Next up",
      "Upcoming training",
      "Reserve your seat before it fills up.",
      upcoming
    ) +
    section(
      "Our track record",
      "Past training we've delivered",
      "Real cohorts, real developers, real outcomes — here's what we've run so far.",
      past,
      "alt-bg"
    );

  return template.replace("<%- trainingSections %>", sections);
}

function listBlock(items, cls) {
  return (items || []).map((i) => `<li>${i}</li>`).join("\n");
}

// Prev / next pagination shared by training and blog detail pages.
// `older`/`newer` are the chronological neighbours; either may be null.
function prevNextNav({ older, newer, urlFor, label, allHref, allLabel }) {
  const cell = (it, dir, arrow) =>
    it
      ? `<a class="pn-link pn-${dir}" href="${urlFor(it)}">
          <span class="pn-dir">${arrow}</span>
          <span class="pn-title">${label(it)}</span>
        </a>`
      : `<span class="pn-link pn-empty" aria-hidden="true"></span>`;
  return `
  <nav class="post-nav" aria-label="Pagination">
    ${cell(older, "prev", "← Previous")}
    <a class="pn-all" href="${allHref}">${allLabel}</a>
    ${cell(newer, "next", "Next →")}
  </nav>`;
}

export function generateTrainingDetail(item, allTrainings = []) {
  const fm = item.frontmatter;
  const isUpcoming = fm.status === "upcoming";

  const idx = allTrainings.findIndex((t) => t.slug === item.slug);
  const nav = prevNextNav({
    older: idx >= 0 ? allTrainings[idx + 1] : null,
    newer: idx > 0 ? allTrainings[idx - 1] : null,
    urlFor: (t) => `/training/${t.slug}.html`,
    label: (t) => t.frontmatter.title,
    allHref: "/training.html",
    allLabel: "All training",
  });

  const heroMeta = [
    fm.dateLabel && `<span><b>📅 ${fm.dateLabel}</b></span>`,
    fm.format && `<span>${fm.format}</span>`,
    fm.level && `<span>${fm.level}</span>`,
    fm.language && `<span>${fm.language}</span>`,
  ]
    .filter(Boolean)
    .join("");

  const metaCells = [
    ["Format", fm.format],
    ["Duration", fm.duration],
    ["Level", fm.level],
    [isUpcoming ? "Price" : "Attendance", isUpcoming ? fm.price : fm.attendees],
  ]
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<div class="cell"><small>${k}</small><strong>${v}</strong></div>`
    )
    .join("");

  const outcomes = (fm.outcomes || [])
    .map(
      (o) => `<div class="check"><div class="mk">✓</div><span>${o}</span></div>`
    )
    .join("");

  const agenda = (fm.agenda || [])
    .map(
      (a) => `
      <div class="slot">
        <div class="slot-time">${a.time}</div>
        <div class="slot-what"><strong>${a.title}</strong><span>${a.desc}</span></div>
      </div>`
    )
    .join("");

  const chips = (fm.topics || [])
    .map((t) => `<span class="chip">${t}</span>`)
    .join("");

  const audience = (fm.audience || [])
    .map((a) => `<li>${a}</li>`)
    .join("");

  const includes = (fm.includes || [])
    .map((i) => `<li>${i}</li>`)
    .join("");

  const requirements = fm.requirements
    ? `
      <div class="t-aside-card">
        <h4>What you'll need</h4>
        <ul class="ticklist">${listBlock(fm.requirements)}</ul>
      </div>`
    : "";

  const primaryCta = isUpcoming
    ? `<a href="${fm.registerUrl}" target="_blank" rel="noopener" class="btn btn-primary">Register now — ${fm.price} →</a>`
    : `<a href="/training.html" class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.3)">← All training</a>
       <a href="/contact.html" class="btn btn-primary">Run this for my team →</a>`;

  const finalCta = isUpcoming
    ? `
      <section class="final pad">
        <div class="wrap">
          <span class="eyebrow" style="color:rgba(255,255,255,.75)">${fm.dateLabel}</span>
          <h2>Seats are limited.</h2>
          <p>${fm.summary}</p>
          <a href="${fm.registerUrl}" target="_blank" rel="noopener" class="btn btn-white">Reserve your seat — ${fm.price} →</a>
        </div>
      </section>`
    : `
      <section class="final pad">
        <div class="wrap">
          <span class="eyebrow" style="color:rgba(255,255,255,.75)">Missed this cohort?</span>
          <h2>Bring this training to your team.</h2>
          <p>We run private and upcoming editions of our trainings. Tell us your team's level and we'll tailor a session.</p>
          <a href="/contact.html" class="btn btn-white">Talk to us about training →</a>
        </div>
      </section>`;

  return `
  <!-- Training hero -->
  <section class="hero" style="padding:64px 0 72px">
    <div class="wrap" style="max-width:820px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
        <span class="eyebrow" style="margin-bottom:0">${fm.series || "Training"} · ${fm.edition || ""}</span>
        ${statusBadge(fm.status)}
      </div>
      <h1 style="font-size:clamp(2.3rem,5.5vw,3.8rem)">${fm.title}</h1>
      <p class="lede" style="margin-top:18px;max-width:58ch">${fm.tagline ? `<strong style="color:#fff">${fm.tagline}.</strong> ` : ""}${fm.summary}</p>
      <div class="t-hero-meta">${heroMeta}</div>
      <div class="hero-actions" style="margin-top:30px">${primaryCta}</div>
    </div>
  </section>

  <!-- Quick facts -->
  <section class="pad-tight" style="padding-bottom:0">
    <div class="wrap">
      <div class="t-meta">${metaCells}</div>
    </div>
  </section>

  <!-- Overview -->
  <section class="pad-tight">
    <div class="wrap" style="max-width:740px">
      <span class="eyebrow reveal">Overview</span>
      <div class="prose prose-lg max-w-none reveal" style="font-family:var(--body);color:var(--ink-soft);line-height:1.8">
        ${item.content}
      </div>
    </div>
  </section>

  <!-- What you'll learn -->
  ${
    outcomes
      ? `<section class="prep pad-tight">
    <div class="wrap">
      <div class="prep-grid">
        <div class="reveal">
          <span class="eyebrow">Outcomes</span>
          <h2>What you'll walk away with.</h2>
          <p class="lede" style="margin-top:14px">Practical, hands-on skills you can use the very next day — not theory.</p>
        </div>
        <div class="checklist reveal">${outcomes}</div>
      </div>
    </div>
  </section>`
      : ""
  }

  <!-- Curriculum / agenda -->
  ${
    agenda
      ? `<section class="dark-section pad">
    <div class="wrap" style="max-width:780px">
      <span class="eyebrow reveal">${isUpcoming ? "The day" : "Curriculum"}</span>
      <h2 class="reveal">${isUpcoming ? "What we'll build, hour by hour." : "What we covered."}</h2>
      <div class="timeline" style="margin-top:40px">${agenda}</div>
    </div>
  </section>`
      : ""
  }

  <!-- Who it's for + topics + requirements -->
  <section class="pad-tight">
    <div class="wrap">
      <div class="t-split">
        <div class="reveal">
          <span class="eyebrow">Who it's for</span>
          <h2 style="font-size:clamp(1.6rem,3.5vw,2.3rem)">Is this you?</h2>
          <ul class="ticklist" style="margin-top:20px">${audience}</ul>
          ${requirements}
        </div>
        <div class="reveal">
          ${
            includes
              ? `<div class="t-aside-card">
            <h4>What's included</h4>
            <ul class="ticklist">${includes}</ul>
          </div>`
              : ""
          }
          ${chips ? `<div style="margin-top:24px"><span class="eyebrow">Topics covered</span><div class="chips">${chips}</div></div>` : ""}
        </div>
      </div>
    </div>
  </section>

  <!-- Trainer -->
  <section class="pad-tight alt-bg">
    <div class="wrap">
      <div class="company-card reveal">
        <div class="company-badge">IS</div>
        <div>
          <span class="eyebrow">Your trainer</span>
          <h2>Led by Integra Solid</h2>
          <p>Hands-on training from a team that integrates and automates AI for real businesses every day. Our sessions are built on live demonstrations and real-world use cases — not slides.</p>
          <div class="company-stats">
            <div><span>300+</span><small>Developers trained</small></div>
            <div><span>3</span><small>Editions of 101</small></div>
            <div><span>100%</span><small>Hands-on, live</small></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  ${finalCta}

  <section class="pad-tight" style="padding-top:8px">
    <div class="wrap" style="max-width:820px">
      ${nav}
    </div>
  </section>
  `;
}
