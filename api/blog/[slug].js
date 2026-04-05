import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.sacredonline.co';
const DEFAULT_OG_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cbf682a54_priscilla-du-preez-Wxhsx3X10OA-unsplash.jpg';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Replace any <h1> tags in rich-text content with <h2> so the post title remains the only H1
function sanitizeContent(html) {
  if (!html) return '';
  return html
    .replace(/<h1(\s[^>]*)?>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>');
}

function excerpt(text, max = 155) {
  if (!text) return '';
  const clean = stripHtml(text);
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

function buildHtml(post) {
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const seoTitle = post.seo_title || `${post.title} | SACRED`;
  const seoDesc = post.seo_description || excerpt(post.description || post.content, 155);
  const ogImage = post.featured_image || DEFAULT_OG_IMAGE;
  const publishedAt = post.published_at || post.created_at || new Date().toISOString();
  const updatedAt = post.updated_at || publishedAt;
  const author = post.author || 'Matt Higham';

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: seoDesc,
    image: ogImage,
    author: { '@type': 'Person', name: author },
    publisher: {
      '@type': 'Organization',
      name: 'SACRED',
      url: SITE_URL,
    },
    datePublished: publishedAt,
    dateModified: updatedAt,
    url: canonicalUrl,
  });

  const content = sanitizeContent(post.content || '');
  const descHtml = post.description
    ? `<div class="description">${sanitizeContent(post.description)}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${escHtml(seoTitle)}</title>
  <meta name="description" content="${escAttr(seoDesc)}" />
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${escAttr(seoTitle)}" />
  <meta property="og:description" content="${escAttr(seoDesc)}" />
  <meta property="og:image" content="${escAttr(ogImage)}" />
  <meta property="og:site_name" content="SACRED" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escAttr(seoTitle)}" />
  <meta name="twitter:description" content="${escAttr(seoDesc)}" />
  <meta name="twitter:image" content="${escAttr(ogImage)}" />

  <!-- Article dates -->
  <meta property="article:published_time" content="${publishedAt}" />
  <meta property="article:modified_time" content="${updatedAt}" />

  <!-- JSON-LD -->
  <script type="application/ld+json">${schema}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --green: #2F4F3F;
      --cream: #F5F1EB;
      --border: #E6D7C9;
      --muted: #6B5B73;
      --accent: #C4756B;
      --dark: #141E16;
    }
    body {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-weight: 300;
      background: var(--cream);
      color: var(--muted);
      line-height: 1.7;
    }

    /* ── Nav ── */
    nav {
      background: var(--dark);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    nav a.logo {
      font-size: 1.4rem;
      letter-spacing: 0.2em;
      font-weight: 300;
      color: rgba(255,255,255,0.9);
      text-decoration: none;
    }
    nav .nav-links { display: flex; align-items: center; gap: 1.5rem; }
    nav .nav-links a {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    nav .nav-links a:hover { color: #fff; }
    nav .cta {
      background: var(--accent);
      color: #fff !important;
      padding: 0.5rem 1.25rem;
      border-radius: 999px;
      font-weight: 600;
    }
    nav .cta:hover { background: #B86761 !important; }

    /* ── Hero ── */
    .post-hero {
      background: var(--dark);
      padding: 4rem 2rem 3rem;
      text-align: center;
    }
    .post-hero .back {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: rgba(255,255,255,0.5);
      text-decoration: none;
      font-size: 0.85rem;
      margin-bottom: 2rem;
      transition: color 0.2s;
    }
    .post-hero .back:hover { color: rgba(255,255,255,0.85); }
    .post-hero .type-label {
      display: inline-block;
      color: var(--accent);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    .post-hero h1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 500;
      font-style: italic;
      color: #fff;
      line-height: 1.1;
      max-width: 800px;
      margin: 0 auto 1.5rem;
    }
    .post-meta {
      display: flex;
      justify-content: center;
      gap: 2rem;
      color: rgba(255,255,255,0.4);
      font-size: 0.9rem;
    }

    /* ── Featured image ── */
    .featured-image {
      max-width: 860px;
      margin: 0 auto;
      padding: 0 1.5rem;
      transform: translateY(-2rem);
    }
    .featured-image img {
      width: 100%;
      border-radius: 12px;
      display: block;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    }

    /* ── Body ── */
    .post-body {
      max-width: 720px;
      margin: 0 auto;
      padding: 0 1.5rem 5rem;
    }
    .description {
      font-size: 1.25rem;
      font-style: italic;
      color: var(--muted);
      line-height: 1.7;
      border-bottom: 1px solid var(--border);
      padding-bottom: 2rem;
      margin-bottom: 2.5rem;
    }
    .post-content h2 {
      font-size: 1.8rem;
      font-weight: 600;
      color: var(--green);
      margin: 2.5rem 0 1rem;
      line-height: 1.2;
    }
    .post-content h3 {
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--green);
      margin: 2rem 0 0.75rem;
    }
    .post-content p {
      font-size: 1.15rem;
      line-height: 1.85;
      color: var(--muted);
      margin-bottom: 1.5rem;
    }
    .post-content ul, .post-content ol {
      padding-left: 1.75rem;
      margin-bottom: 1.5rem;
      color: var(--muted);
      font-size: 1.15rem;
      line-height: 1.85;
    }
    .post-content li { margin-bottom: 0.6rem; }
    .post-content blockquote {
      border-left: 4px solid var(--accent);
      padding: 1rem 1.5rem;
      margin: 2rem 0;
      background: #fff;
      border-radius: 0 8px 8px 0;
      font-style: italic;
      font-size: 1.25rem;
    }
    .post-content strong { font-weight: 600; color: var(--green); }
    .post-content a { color: var(--accent); }
    .post-content img {
      max-width: 100%;
      border-radius: 8px;
      margin: 2rem 0;
    }

    /* ── Footer strip ── */
    .post-footer {
      border-top: 1px solid var(--border);
      padding: 2rem 1.5rem;
      text-align: center;
    }
    .post-footer a {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
    }

    @media (max-width: 640px) {
      nav { padding: 1rem; }
      .post-hero { padding: 3rem 1rem 2rem; }
      .post-body { padding: 0 1rem 4rem; }
    }
  </style>
</head>
<body>
  <nav>
    <a href="${SITE_URL}" class="logo">SACRED</a>
    <div class="nav-links">
      <a href="${SITE_URL}/blog">Education</a>
      <a href="${SITE_URL}/login">Sign in</a>
      <a href="${SITE_URL}/signup" class="cta">Begin Assessment</a>
    </div>
  </nav>

  <article>
    <div class="post-hero">
      <a href="${SITE_URL}/blog" class="back">← All articles</a>
      <span class="type-label">${escHtml(post.resource_type || 'Article')}</span>
      <h1>${escHtml(post.title)}</h1>
      <div class="post-meta">
        ${author ? `<span>${escHtml(author)}</span>` : ''}
        <span>${new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>

    ${post.featured_image ? `
    <div class="featured-image">
      <img src="${escAttr(post.featured_image)}" alt="${escAttr(post.title)}" loading="eager" />
    </div>` : ''}

    <div class="post-body">
      ${descHtml}
      <div class="post-content">${content}</div>
    </div>

    <div class="post-footer">
      <a href="${SITE_URL}/blog">← Back to all articles</a>
    </div>
  </article>
</body>
</html>`;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  const slug = req.query.slug;
  if (!slug) {
    res.status(400).send('Missing slug');
    return;
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  const { data: post, error } = await supabase
    .from('education_resources')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !post) {
    res.status(404).send(`<!DOCTYPE html><html><head><title>Not Found | SACRED</title></head><body><h1>Article not found</h1><a href="${process.env.VITE_SITE_URL || 'https://www.sacredonline.co'}/blog">← Back to articles</a></body></html>`);
    return;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(buildHtml(post));
}
