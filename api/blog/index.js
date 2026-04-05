import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.sacredonline.co';
const DEFAULT_OG_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cbf682a54_priscilla-du-preez-Wxhsx3X10OA-unsplash.jpg';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function excerpt(text, max = 200) {
  const clean = stripHtml(text || '');
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
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

function cardHtml(post) {
  const date = post.published_at || post.created_at;
  const formattedDate = new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const postExcerpt = excerpt(post.description || post.content, 220);

  return `
  <article class="card">
    ${post.featured_image ? `
    <a href="${SITE_URL}/blog/${post.slug}" class="card-image-link">
      <div class="card-image">
        <img src="${escAttr(post.featured_image)}" alt="${escAttr(post.title)}" loading="lazy" />
      </div>
    </a>` : `
    <a href="${SITE_URL}/blog/${post.slug}" class="card-image-link">
      <div class="card-image card-image--placeholder"></div>
    </a>`}
    <div class="card-body">
      <span class="card-type">${escHtml(post.resource_type || 'Article')}</span>
      <h2 class="card-title">
        <a href="${SITE_URL}/blog/${post.slug}">${escHtml(post.title)}</a>
      </h2>
      <p class="card-excerpt">${escHtml(postExcerpt)}</p>
      <div class="card-meta">
        ${post.author ? `<span>${escHtml(post.author)}</span>` : ''}
        <span>${formattedDate}</span>
      </div>
    </div>
  </article>`;
}

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  const { data: posts, error } = await supabase
    .from('education_resources')
    .select('id, title, slug, description, content, resource_type, featured_image, author, published_at, created_at')
    .eq('status', 'published')
    .order('order_index', { ascending: true });

  const canonicalUrl = `${SITE_URL}/blog`;
  const pageTitle = 'Education & Resources | SACRED';
  const pageDesc = 'Thoughtful articles to help Christian engaged couples prepare for the gift of marital intimacy.';

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'SACRED Education',
    url: canonicalUrl,
    description: pageDesc,
    publisher: { '@type': 'Organization', name: 'SACRED', url: SITE_URL },
  });

  const postsHtml = (!error && posts && posts.length > 0)
    ? posts.map(cardHtml).join('\n')
    : `<div class="empty"><p>Articles coming soon — check back shortly.</p></div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${escHtml(pageTitle)}</title>
  <meta name="description" content="${escAttr(pageDesc)}" />
  <link rel="canonical" href="${canonicalUrl}" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${escAttr(pageTitle)}" />
  <meta property="og:description" content="${escAttr(pageDesc)}" />
  <meta property="og:image" content="${DEFAULT_OG_IMAGE}" />
  <meta property="og:site_name" content="SACRED" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escAttr(pageTitle)}" />
  <meta name="twitter:description" content="${escAttr(pageDesc)}" />
  <meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />

  <script type="application/ld+json">${schema}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --green: #2F4F3F; --cream: #F5F1EB; --border: #E6D7C9;
      --muted: #6B5B73; --accent: #C4756B; --dark: #141E16;
    }
    body { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 300; background: var(--dark); color: var(--muted); }

    nav { background: var(--dark); padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); }
    nav a.logo { font-size: 1.4rem; letter-spacing: 0.2em; font-weight: 300; color: rgba(255,255,255,0.9); text-decoration: none; }
    nav .nav-links { display: flex; align-items: center; gap: 1.5rem; }
    nav .nav-links a { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem; }
    nav .nav-links a:hover { color: #fff; }
    nav .cta { background: var(--accent); color: #fff !important; padding: 0.5rem 1.25rem; border-radius: 999px; font-weight: 600; }
    nav .cta:hover { background: #B86761 !important; }

    .hero { padding: 5rem 2rem 4rem; }
    .hero .eyebrow { color: var(--accent); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 1.25rem; }
    /* Blog index has no post title — only one H1 on this page */
    .hero h1 { font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 500; font-style: italic; color: #fff; line-height: 1.05; max-width: 700px; }
    .hero p { margin-top: 1.25rem; color: rgba(255,255,255,0.55); font-size: 1.15rem; max-width: 560px; line-height: 1.7; }

    .content { background: var(--cream); border-radius: 1.5rem 1.5rem 0 0; padding: 4rem 2rem 6rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; max-width: 1100px; margin: 0 auto; }

    .card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); transition: box-shadow 0.2s; }
    .card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
    .card-image-link { display: block; }
    .card-image { aspect-ratio: 16/9; overflow: hidden; background: var(--cream); }
    .card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
    .card:hover .card-image img { transform: scale(1.04); }
    .card-image--placeholder { background: linear-gradient(135deg, #2F4F3F22, #C4756B22); }
    .card-body { padding: 1.5rem; }
    .card-type { display: block; color: var(--accent); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; text-transform: capitalize; margin-bottom: 0.6rem; }
    .card-title { font-size: 1.25rem; font-weight: 500; line-height: 1.2; margin-bottom: 0.75rem; }
    .card-title a { color: var(--green); text-decoration: none; }
    .card-title a:hover { color: var(--accent); }
    .card-excerpt { font-size: 0.95rem; color: var(--muted); line-height: 1.75; margin-bottom: 1rem; }
    .card-meta { display: flex; gap: 1rem; font-size: 0.8rem; color: rgba(107,91,115,0.6); }

    .empty { text-align: center; padding: 4rem 1rem; color: var(--muted); font-size: 1.1rem; max-width: 1100px; margin: 0 auto; }

    @media (max-width: 640px) { nav { padding: 1rem; } .hero { padding: 3rem 1rem 2.5rem; } .content { padding: 2.5rem 1rem 4rem; } .grid { grid-template-columns: 1fr; } }
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

  <section class="hero">
    <p class="eyebrow">Education &amp; Resources</p>
    <h1>Wisdom for the<br>journey ahead</h1>
    <p>Thoughtful articles to help Christian engaged couples prepare for the gift of marital intimacy.</p>
  </section>

  <section class="content">
    <div class="grid">
      ${postsHtml}
    </div>
  </section>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
  res.status(200).send(html);
}
