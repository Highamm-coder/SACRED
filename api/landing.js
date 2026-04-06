const SITE_URL = 'https://www.sacredonline.co';
const OG_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cbf682a54_priscilla-du-preez-Wxhsx3X10OA-unsplash.jpg';
const THIS_IS_FOR_YOU_IMG = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c994f4bda_Screenshot2025-07-20at101100PM.png';
const SIGNUP_URL = `${SITE_URL}/signup`;
const LOGIN_URL = `${SITE_URL}/login`;
const BLOG_URL = `${SITE_URL}/blog`;

const faqs = [
  {
    q: 'Does SACRED cover what to expect on our wedding night?',
    a: "Yes — specifically. The assessment covers physical expectations, pain, arousal, orgasm timelines, and what first-time sex actually looks like in practice. It's the preparation most premarital resources skip.",
  },
  {
    q: 'Is it explicit or graphic?',
    a: "No. The questions are direct and specific — because vague questions lead to vague conversations — but they're not pornographic. Think honest and plain, not explicit.",
  },
  {
    q: 'Does this replace premarital counselling?',
    a: "No. SACRED covers the sexual preparation that most premarital counselling doesn't touch. They work well together — most counsellors don't go where SACRED goes.",
  },
  {
    q: 'What if we disagree on our results?',
    a: "That's the point. Finding a difference in the assessment is far better than discovering it on your wedding night. Every area of difference comes with a guided discussion prompt to help you work through it.",
  },
  {
    q: 'Is this theologically conservative?',
    a: 'Yes. SACRED was built by a Christian couple for couples who are waiting until marriage. The framework is biblically grounded throughout.',
  },
  {
    q: "What if one of us has a sexual history and the other doesn't?",
    a: "The assessment addresses this directly. It's one of the most important conversations to have before marriage, and one of the most commonly avoided. SACRED creates the structure to have it honestly.",
  },
  {
    q: 'How long does it take?',
    a: 'Most people finish in 20–30 minutes. You each complete it privately, then review your results together.',
  },
];

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* Static SVG converging lines — two paths meeting at centre bottom */
const convergingLines = (color = 'white', opacity = 0.2) => `
<div class="conv-lines" aria-hidden="true">
  <svg viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 0 20 C 300 20, 480 110, 600 110" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.5"/>
    <path d="M 1200 20 C 900 20, 720 110, 600 110" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.5"/>
  </svg>
</div>`;

export default function handler(req, res) {
  const seoTitle = 'SACRED | Pre-Marriage Sexual Preparation for Christian Couples';
  const seoDesc = 'The only assessment built for engaged Christian couples. Prepare for intimacy together — privately, biblically, and confidently. $47, 30-day guarantee.';
  const canonicalUrl = SITE_URL;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'SACRED Pre-Marriage Sexual Intimacy Assessment',
    description: 'A comprehensive sexual intimacy assessment for Christian engaged couples. Complete individually, compare together, guided conversation prompts for every difference.',
    url: canonicalUrl,
    image: OG_IMAGE,
    brand: { '@type': 'Brand', name: 'SACRED' },
    offers: {
      '@type': 'Offer',
      price: '47.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: SIGNUP_URL,
      priceValidUntil: '2027-12-31',
      seller: { '@type': 'Organization', name: 'SACRED' },
    },
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SACRED',
    url: SITE_URL,
    logo: OG_IMAGE,
    sameAs: [],
  };

  const faqRowsHtml = faqs.map((f, i) => `
  <div class="faq-item">
    <button class="faq-q" onclick="toggleFaq(${i})" aria-expanded="false" aria-controls="faq-a-${i}">
      <span>${esc(f.q)}</span>
      <span class="faq-icon" id="faq-icon-${i}">+</span>
    </button>
    <div class="faq-a" id="faq-a-${i}" hidden>${esc(f.a)}</div>
  </div>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${esc(seoTitle)}</title>
  <meta name="description" content="${escAttr(seoDesc)}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta name="robots" content="index, follow" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${escAttr(seoTitle)}" />
  <meta property="og:description" content="${escAttr(seoDesc)}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="SACRED" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escAttr(seoTitle)}" />
  <meta name="twitter:description" content="${escAttr(seoDesc)}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />

  <!-- Schema.org -->
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(productSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(orgSchema)}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --dark: #141E16; --green: #2F4F3F; --cream: #F5F1EB;
      --border: #E6D7C9; --muted: #6B5B73; --accent: #C4756B;
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-weight: 300;
      background: var(--dark);
      color: rgba(255,255,255,0.75);
      line-height: 1.7;
    }

    /* ── Nav ── */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 50;
      padding: 1.1rem 2.5rem;
      display: flex; align-items: center; justify-content: space-between;
      background: transparent;
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }
    nav.scrolled {
      background: rgba(245,241,235,0.96);
      backdrop-filter: blur(10px);
      box-shadow: 0 1px 12px rgba(0,0,0,0.08);
    }
    nav.scrolled .logo { color: var(--green); }
    nav.scrolled .nav-link { color: var(--green); opacity: 0.75; }
    nav.scrolled .nav-link:hover { opacity: 1; color: var(--accent); }
    nav.scrolled .nav-cta { background: var(--accent); }
    .logo { font-size: 1.9rem; letter-spacing: 0.2em; font-weight: 300; color: rgba(255,255,255,0.9); text-decoration: none; }
    .nav-links { display: flex; align-items: center; gap: 1.75rem; }
    .nav-link { color: rgba(255,255,255,0.75); text-decoration: none; font-size: 1rem; transition: color 0.2s, opacity 0.2s; }
    .nav-link:hover { color: #fff; }
    .nav-cta {
      background: var(--accent); color: #fff !important;
      padding: 0.55rem 1.4rem; border-radius: 999px;
      font-weight: 600; font-size: 0.95rem; text-decoration: none;
      transition: background 0.2s;
    }
    .nav-cta:hover { background: #B86761 !important; }

    /* ── Hero ── */
    .hero {
      position: relative; height: 100vh; min-height: 600px;
      display: flex; align-items: flex-end;
    }
    .hero-img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%);
    }
    .hero-content {
      position: relative; z-index: 2;
      padding: 2rem 2.5rem 3rem; max-width: 480px;
    }
    .hero-content h1 {
      font-size: clamp(2.2rem, 4vw, 3.4rem);
      font-weight: 500; font-style: italic;
      color: #fff; line-height: 1.05; margin-bottom: 0.9rem;
    }
    .hero-content p {
      color: rgba(255,255,255,0.8); font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem;
    }
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: var(--accent); color: #fff;
      padding: 0.75rem 1.75rem; border-radius: 999px;
      font-weight: 600; font-size: 1rem; text-decoration: none;
      font-family: 'Cormorant Garamond', Georgia, serif;
      transition: background 0.2s; cursor: pointer; border: none;
    }
    .btn:hover { background: #B86761; }
    .btn-center { display: flex; justify-content: center; margin-top: 2.5rem; }

    /* ── Sections ── */
    section { padding: 5rem 2.5rem; }
    .max-w { max-width: 1100px; margin: 0 auto; }
    .max-w-narrow { max-width: 760px; margin: 0 auto; }
    .max-w-wide { max-width: 1200px; margin: 0 auto; }
    h2.section-title {
      font-size: clamp(2rem, 4vw, 3.2rem);
      font-weight: 500; font-style: italic; line-height: 1.2;
      color: #fff; margin-bottom: 1.25rem;
    }
    .section-center { text-align: center; }
    .section-sub { color: rgba(255,255,255,0.7); font-size: 1.1rem; max-width: 640px; line-height: 1.7; }

    /* ── Light sections (cream bg) ── */
    /* Override body's white color so nothing bleeds in */
    .ls { background: var(--cream); }
    .ls, .ls * { color: var(--muted); }
    .ls h2.section-title { color: var(--green); font-style: normal; }
    .ls h2.italic { font-style: italic; }
    .ls h3 { color: var(--green); }
    .ls .section-sub { color: var(--muted); }
    .ls .check { color: var(--accent); }
    .ls .btn { color: #fff; }
    .ls .btn:hover { color: #fff; }

    /* ── Decorative arc (WhyUnprepared) ── */
    .dec-arc {
      position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;
    }

    /* ── Callout ── */
    .callout {
      margin-top: 2.5rem;
      border-left: 3px solid var(--accent);
      padding: 1.25rem 1.5rem;
      background: rgba(196,117,107,0.06);
      border-radius: 0 8px 8px 0;
    }
    .callout p { color: rgba(255,255,255,0.7); font-size: 1.05rem; }

    /* ── This Is For You — two-col ── */
    .for-you-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;
    }
    .for-you-list { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .for-you-item { display: flex; gap: 0.75rem; align-items: flex-start; }
    .check { color: var(--accent); font-weight: 700; flex-shrink: 0; font-size: 1.1rem; }
    .for-you-img { border-radius: 1.5rem; width: 100%; object-fit: cover; }

    /* ── Steps ── */
    .steps { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 0; }
    .step { display: flex; gap: 2rem; align-items: flex-start; padding-bottom: 3rem; }
    .step-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
    .step-num {
      width: 2.5rem; height: 2.5rem; border-radius: 50%;
      border: 1px solid var(--accent); display: flex; align-items: center; justify-content: center;
      font-weight: 600; color: var(--accent); font-size: 0.9rem; flex-shrink: 0;
    }
    .step-connector {
      width: 1px; flex: 1; margin-top: 0.75rem; min-height: 80px;
      background: linear-gradient(to bottom, rgba(196,117,107,0.4), rgba(196,117,107,0.05));
    }
    .step-body { padding-top: 0.25rem; }
    .step-body h3 { font-size: 1.3rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem; }
    .step-body p { color: rgba(255,255,255,0.65); font-size: 1rem; line-height: 1.75; max-width: 480px; }

    /* ── Gains grid ── */
    .gains-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 2.5rem; margin-top: 2.5rem; }
    .gain h3 { font-size: 1.2rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem; }
    .gain p { color: rgba(255,255,255,0.65); font-size: 0.95rem; line-height: 1.75; }

    /* ── Explore grid ── */
    .explore-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; margin-top: 2.5rem; }
    .explore-col h3 { font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 1rem; }
    .explore-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .explore-item { display: flex; gap: 0.75rem; align-items: flex-start; }
    .dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; flex-shrink: 0; margin-top: 0.55rem; }
    .explore-item span { color: rgba(255,255,255,0.65); font-size: 0.95rem; line-height: 1.65; }

    /* ── Testimonials (on cream bg) ── */
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2.5rem; margin-top: 2.5rem; }
    .testimonial blockquote { font-style: italic; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1rem; }
    .testimonial cite { font-size: 0.85rem; opacity: 0.6; font-style: normal; font-weight: 600; }

    /* ── FAQ ── */
    .faq-item { border-bottom: 1px solid rgba(255,255,255,0.1); }
    .faq-q {
      width: 100%; display: flex; justify-content: space-between; align-items: flex-start;
      gap: 1.5rem; padding: 1.25rem 0; text-align: left;
      background: none; border: none; cursor: pointer; color: #fff;
      font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.05rem; font-weight: 600; line-height: 1.4;
    }
    .faq-icon { flex-shrink: 0; color: rgba(255,255,255,0.4); font-size: 1.2rem; line-height: 1; margin-top: 0.1rem; }
    .faq-a { padding: 0 0 1.25rem; color: rgba(255,255,255,0.65); font-size: 0.95rem; line-height: 1.75; }

    /* ── Investment section ── */
    .investment-price { font-size: clamp(3rem, 8vw, 5rem); font-weight: 600; color: var(--accent); line-height: 1; margin-bottom: 0.5rem; }
    .investment-sub { font-size: 0.9rem; opacity: 0.6; }
    .investment-guarantee { font-size: 0.95rem; line-height: 1.7; margin-top: 1.25rem; max-width: 520px; }

    /* ── Final CTA ── */
    .final-cta-section {
      position: relative; padding: 8rem 2.5rem;
      background-image: url('${OG_IMAGE}');
      background-size: cover; background-position: center;
    }
    .final-cta-overlay { position: absolute; inset: 0; background: rgba(47,79,63,0.65); }
    .final-cta-content { position: relative; z-index: 2; text-align: center; max-width: 760px; margin: 0 auto; }
    .final-cta-content h2 {
      font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 500; font-style: italic;
      color: #fff; line-height: 1.15; margin-bottom: 1.25rem;
    }
    .final-cta-content p { color: rgba(255,255,255,0.8); font-size: 1.1rem; line-height: 1.7; margin-bottom: 2.5rem; max-width: 540px; margin-left: auto; margin-right: auto; }

    /* ── Converging lines ── */
    .conv-lines { display: none; width: 100%; height: 80px; pointer-events: none; select: none; }
    .conv-lines svg { width: 100%; height: 100%; }

    /* ── Footer ── */
    footer {
      background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.07);
      padding: 2rem 2.5rem; text-align: center;
    }
    footer p { color: rgba(255,255,255,0.25); font-size: 0.85rem; }
    footer a { color: rgba(255,255,255,0.35); text-decoration: none; }
    footer a:hover { color: rgba(255,255,255,0.6); }

    @media (min-width: 641px) {
      .conv-lines { display: block; }
    }
    @media (max-width: 900px) {
      .explore-grid { grid-template-columns: 1fr; gap: 2rem; }
    }
    @media (max-width: 768px) {
      .for-you-grid { grid-template-columns: 1fr; }
      .for-you-img-col { order: -1; }
    }
    @media (max-width: 640px) {
      nav { padding: 1rem 1.25rem; }
      .nav-links .nav-link { display: none; }
      section { padding: 3.5rem 1.25rem; }
      .hero-content { padding: 1.5rem 1.25rem 2.5rem; }
      .final-cta-section { padding: 5rem 1.25rem; }
    }
  </style>
</head>
<body>

  <nav id="main-nav">
    <a href="${SITE_URL}" class="logo">SACRED</a>
    <div class="nav-links">
      <a href="${BLOG_URL}" class="nav-link">Blog</a>
      <a href="${LOGIN_URL}" class="nav-link">Sign in</a>
      <a href="${SIGNUP_URL}" class="nav-cta">Begin Assessment</a>
    </div>
  </nav>

  <!-- ── Hero ── -->
  <section class="hero" aria-label="Hero">
    <img src="${OG_IMAGE}" alt="Christian engaged couple" class="hero-img" loading="eager" fetchpriority="high" />
    <div class="hero-overlay" aria-hidden="true"></div>
    <div class="hero-content">
      <h1>Sexual Preparation for Christian Engaged Couples</h1>
      <p>A comprehensive assessment for Christian engaged couples. Covering everything about sexual intimacy that no one taught you to talk about.</p>
      <a href="${SIGNUP_URL}" class="btn">Begin Assessment →</a>
    </div>
  </section>

  ${convergingLines('white', 0.15)}

  <!-- ── Why Most Christian Couples Feel Unprepared ── -->
  <section aria-labelledby="why-heading" style="position:relative;overflow:hidden;">
    <svg class="dec-arc" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <path d="M -100 500 A 900 900 0 0 1 1300 500" stroke="white" stroke-opacity="0.07" stroke-width="1"/>
      <path d="M -100 600 A 1000 1000 0 0 1 1300 600" stroke="white" stroke-opacity="0.04" stroke-width="1"/>
    </svg>
    <div class="max-w-narrow section-center" style="position:relative;z-index:1;">
      <h2 class="section-title" id="why-heading">Why Most Christian Couples Feel Unprepared</h2>
      <p class="section-sub" style="margin:0 auto 1.5rem;">
        Most Christian couples grew up hearing "don't think about sex" and are now expected to build intimate marriages without practical preparation. The gap between prohibition and expectation leaves couples feeling unprepared for one of marriage's most important aspects.
      </p>
      <p class="section-sub" style="margin:0 auto 2.5rem;">
        This feels overwhelming for everyone — <strong style="color:#fff;font-weight:600;">you're not uniquely behind or unprepared.</strong> Every Christian couple is having this exact same realization right now. Sacred provides the comprehensive preparation and guidance you need.
      </p>
      <a href="${SIGNUP_URL}" class="btn">Get Prepared Together →</a>
    </div>
  </section>

  ${convergingLines('rgba(47,79,63)', 0.3)}

  <!-- ── This Is For You ── (light) -->
  <section class="ls" aria-labelledby="foryou-heading">
    <div class="max-w-wide">
      <div class="for-you-grid">
        <div>
          <h2 class="section-title" id="foryou-heading">This Is For You If:</h2>
          <ul class="for-you-list" style="list-style:none;">
            <li class="for-you-item"><span class="check">✓</span><span>You're a Christian engaged couple committed to honoring God in your sexual relationship</span></li>
            <li class="for-you-item"><span class="check">✓</span><span>You grew up hearing "don't think about sex" and now feel behind or unprepared</span></li>
            <li class="for-you-item"><span class="check">✓</span><span>You feel unprepared for the intimate side of marriage despite being ready to commit</span></li>
            <li class="for-you-item"><span class="check">✓</span><span>You want honest conversations about sexuality but don't know how to start them</span></li>
            <li class="for-you-item"><span class="check">✓</span><span>You believe thoughtful preparation honors both God and your future spouse</span></li>
          </ul>
          <div style="margin-top:2rem;">
            <a href="${SIGNUP_URL}" class="btn">Yes, This Is Us →</a>
          </div>
        </div>
        <div class="for-you-img-col">
          <img
            src="${THIS_IS_FOR_YOU_IMG}"
            alt="Couple in a loving embrace"
            class="for-you-img"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>

  ${convergingLines('rgba(47,79,63)', 0.3)}

  <!-- ── How Sacred Works ── -->
  <section aria-labelledby="how-heading">
    <div class="max-w-narrow">
      <h2 class="section-title" id="how-heading">How Sacred Works</h2>
      <p class="section-sub">Comprehensive without being overwhelming, and completely private until you're both ready to share.</p>
      <div class="steps">
        <div class="step">
          <div class="step-left">
            <div class="step-num">1</div>
            <div class="step-connector"></div>
          </div>
          <div class="step-body">
            <h3>Individual Assessment</h3>
            <p>Each partner completes a thorough evaluation privately. This ensures honest responses about expectations, concerns, and desires without pressure or judgment.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-left">
            <div class="step-num">2</div>
            <div class="step-connector"></div>
          </div>
          <div class="step-body">
            <h3>Personalized Comparison</h3>
            <p>Receive a detailed analysis highlighting where you align and where you need discussion. Most couples are surprised by both their similarities and differences.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-left">
            <div class="step-num">3</div>
          </div>
          <div class="step-body">
            <h3>Guided Conversations</h3>
            <p>Use your results as a roadmap for meaningful conversations about your future intimate relationship. No more awkward silences or not knowing where to start.</p>
          </div>
        </div>
      </div>
      <div style="margin-top:1rem;">
        <a href="${SIGNUP_URL}" class="btn">Start Your Assessment →</a>
      </div>
    </div>
  </section>

  ${convergingLines('white', 0.15)}

  <!-- ── What You'll Gain ── -->
  <section aria-labelledby="gains-heading">
    <div class="max-w">
      <div class="section-center" style="margin-bottom:2.5rem;">
        <h2 class="section-title" id="gains-heading">What You'll Gain</h2>
      </div>
      <div class="gains-grid">
        <div class="gain">
          <h3>Move from Uncertainty to Confidence</h3>
          <p>Understand exactly what to expect and how to communicate about sexual intimacy before your wedding night. Sacred focuses on preparation and expectations, not spoiling the intimate discoveries that make your relationship special.</p>
        </div>
        <div class="gain">
          <h3>Prevent Problems Before They Start</h3>
          <p>Address potential challenges and mismatched expectations while you're engaged, rather than discovering them after marriage. Most couples wish they'd had these conversations earlier.</p>
        </div>
        <div class="gain">
          <h3>Build Deeper Connection Through Understanding</h3>
          <p>Create genuine intimacy by truly knowing each other's thoughts, concerns, and desires. The conversations that feel awkward at first become the foundation for lifelong connection.</p>
        </div>
        <div class="gain">
          <h3>Enter Marriage Sexually Prepared</h3>
          <p>Feel confident and equipped rather than anxious and uninformed about this crucial aspect of marriage. Preparation is wisdom, not impurity.</p>
        </div>
      </div>
      <div class="btn-center">
        <a href="${SIGNUP_URL}" class="btn">Gain These Benefits →</a>
      </div>
    </div>
  </section>

  ${convergingLines('white', 0.15)}

  <!-- ── What You'll Explore Together ── -->
  <section aria-labelledby="explore-heading">
    <div class="max-w-wide">
      <div class="section-center" style="margin-bottom:2.5rem;">
        <h2 class="section-title" id="explore-heading">What You'll Explore Together</h2>
        <p class="section-sub" style="margin:0 auto;">These are the topics every couple needs to discuss but most never do until problems arise.</p>
      </div>
      <div class="explore-grid">
        <div class="explore-col">
          <h3>Sexual Knowledge &amp; Understanding</h3>
          <ul class="explore-list" style="list-style:none;">
            <li class="explore-item"><div class="dot"></div><span>Physical intimacy expectations and realistic preparation</span></li>
            <li class="explore-item"><div class="dot"></div><span>Communication during intimate moments</span></li>
            <li class="explore-item"><div class="dot"></div><span>Understanding pleasure, satisfaction, and realistic timelines</span></li>
          </ul>
        </div>
        <div class="explore-col">
          <h3>Boundaries &amp; Comfort Levels</h3>
          <ul class="explore-list" style="list-style:none;">
            <li class="explore-item"><div class="dot"></div><span>Physical boundaries and preferences that honor both partners</span></li>
            <li class="explore-item"><div class="dot"></div><span>Frequency expectations and handling differences in desire</span></li>
            <li class="explore-item"><div class="dot"></div><span>Navigating the learning curve together</span></li>
          </ul>
        </div>
        <div class="explore-col">
          <h3>Practical Preparation</h3>
          <ul class="explore-list" style="list-style:none;">
            <li class="explore-item"><div class="dot"></div><span>Addressing potential challenges before they become problems</span></li>
            <li class="explore-item"><div class="dot"></div><span>Family planning considerations and contraception decisions</span></li>
            <li class="explore-item"><div class="dot"></div><span>Building long-term intimacy patterns that grow with your marriage</span></li>
          </ul>
        </div>
      </div>
      <div class="btn-center">
        <a href="${SIGNUP_URL}" class="btn">Explore These Topics →</a>
      </div>
    </div>
  </section>

  ${convergingLines('rgba(47,79,63)', 0.3)}

  <!-- ── What Couples Are Saying ── (light) -->
  <section class="ls" aria-labelledby="testimonials-heading">
    <div class="max-w">
      <div class="section-center" style="margin-bottom:2.5rem;">
        <h2 class="section-title italic" id="testimonials-heading">What Couples Are Saying</h2>
      </div>
      <div class="testimonials-grid">
        <div class="testimonial">
          <blockquote>"For the first time, we could talk about intimacy without it being awkward. Sacred gave us the framework to discuss everything openly and biblically. We actually felt prepared."</blockquote>
          <cite>— Sarah &amp; David, married 1 year</cite>
        </div>
        <div class="testimonial">
          <blockquote>"We thought we'd talked about everything, but Sacred showed us how many assumptions we were making. The conversations were eye-opening and brought us so much closer."</blockquote>
          <cite>— Jennifer &amp; Michael, engaged</cite>
        </div>
        <div class="testimonial">
          <blockquote>"I wish every Christian couple had access to this. It's what we all need but no one teaches us."</blockquote>
          <cite>— Pastor James, recommending to his engaged couples</cite>
        </div>
      </div>
      <div class="btn-center">
        <a href="${SIGNUP_URL}" class="btn">Join These Couples →</a>
      </div>
    </div>
  </section>

  ${convergingLines('rgba(47,79,63)', 0.3)}

  <!-- ── Designed for Your Privacy ── -->
  <section aria-labelledby="privacy-heading">
    <div class="max-w-narrow section-center">
      <h2 class="section-title" id="privacy-heading">Designed for Your Privacy</h2>
      <p class="section-sub" style="margin:0 auto 1.5rem;">Your responses remain completely confidential until both partners complete their assessments. No pressure, no judgment — just thorough preparation.</p>
      <p class="section-sub" style="margin:0 auto 2.5rem;">Created by relationship experts specifically for Christian couples who want to honor God while preparing comprehensively for intimate marriage.</p>
      <a href="${SIGNUP_URL}" class="btn">Start Privately →</a>
    </div>
  </section>

  ${convergingLines('white', 0.15)}

  <!-- ── Common Questions ── -->
  <section aria-labelledby="faq-heading">
    <div class="max-w-narrow">
      <div class="section-center" style="margin-bottom:2.5rem;">
        <h2 class="section-title" id="faq-heading">Common Questions</h2>
      </div>
      <div>
        ${faqRowsHtml}
      </div>
      <div class="btn-center">
        <a href="${SIGNUP_URL}" class="btn">Begin Assessment →</a>
      </div>
    </div>
  </section>

  ${convergingLines('white', 0.15)}

  <!-- ── Sacred = Exclusive, Consensual, Dignifying ── -->
  <section aria-labelledby="tagline-heading">
    <div class="max-w-narrow section-center">
      <h2 class="section-title" id="tagline-heading">Sacred = Exclusive, Consensual, Dignifying</h2>
      <p class="section-sub" style="margin:0 auto 2.5rem;">Sacred equips engaged Christian couples with the knowledge and biblical framework to enter marriage sexually confident and prepared.</p>
      <a href="${SIGNUP_URL}" class="btn">Begin Your Sacred Journey →</a>
    </div>
  </section>

  ${convergingLines('rgba(47,79,63)', 0.3)}

  <!-- ── The Investment in Your Marriage ── (light) -->
  <section class="ls" aria-labelledby="investment-heading">
    <div class="max-w-narrow section-center">
      <h2 class="section-title" id="investment-heading">The Investment in Your Marriage</h2>
      <div style="margin-bottom:1.5rem;">
        <div class="investment-price">$47</div>
        <p class="investment-sub">The average cost of a wedding in the United States is around $33,000</p>
      </div>
      <div style="margin-bottom:1.5rem;">
        <a href="${SIGNUP_URL}" class="btn">Start Your Assessment →</a>
      </div>
      <p class="investment-guarantee">30-day money-back guarantee. If these conversations don't help you feel more prepared and confident about intimate marriage, we'll refund your investment completely.</p>
    </div>
  </section>

  <!-- ── Ready to Begin? ── -->
  <section class="final-cta-section" aria-labelledby="final-heading">
    <div class="final-cta-overlay" aria-hidden="true"></div>
    <div class="final-cta-content">
      <h2 id="final-heading">Ready to Begin?</h2>
      <p>Join hundreds of couples who chose comprehensive preparation over hoping for the best. Sexual intimacy is too important to leave to chance.</p>
      <a href="${SIGNUP_URL}" class="btn">Begin Your Sacred Assessment →</a>
    </div>
  </section>

  <footer>
    <p>
      &copy; 2025 SACRED &nbsp;&middot;&nbsp;
      <a href="${SITE_URL}/privacy">Privacy Policy</a> &nbsp;&middot;&nbsp;
      <a href="${SITE_URL}/terms">Terms of Service</a> &nbsp;&middot;&nbsp;
      <a href="${BLOG_URL}">Blog</a>
    </p>
  </footer>

  <script>
    // Nav scroll state
    var nav = document.getElementById('main-nav');
    window.addEventListener('scroll', function() {
      nav.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.5);
    }, { passive: true });

    // FAQ accordion
    function toggleFaq(i) {
      var answer = document.getElementById('faq-a-' + i);
      var icon = document.getElementById('faq-icon-' + i);
      var btn = answer.previousElementSibling;
      var isOpen = !answer.hidden;
      answer.hidden = isOpen;
      icon.textContent = isOpen ? '+' : '\u2212';
      btn.setAttribute('aria-expanded', String(!isOpen));
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(html);
}
