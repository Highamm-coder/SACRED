const SITE_URL = 'https://www.sacredonline.co';
const OG_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cbf682a54_priscilla-du-preez-Wxhsx3X10OA-unsplash.jpg';
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
    aggregateRating: undefined,
  };
  delete productSchema.aggregateRating;

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
    body { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 300; background: var(--dark); color: rgba(255,255,255,0.75); line-height: 1.7; }

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
    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: var(--accent); color: #fff;
      padding: 0.75rem 1.75rem; border-radius: 999px;
      font-weight: 600; font-size: 1rem; text-decoration: none;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #B86761; }

    /* ── Sections ── */
    section { padding: 5rem 2.5rem; }
    .max-w { max-width: 1100px; margin: 0 auto; }
    .max-w-narrow { max-width: 760px; margin: 0 auto; }
    h2.section-title {
      font-size: clamp(2rem, 4vw, 3.2rem);
      font-weight: 500; font-style: italic; line-height: 1.1;
      color: #fff; margin-bottom: 1.25rem;
    }
    .section-sub { color: rgba(255,255,255,0.6); font-size: 1.1rem; max-width: 580px; line-height: 1.7; }

    /* ── Light sections ── */
    .light { background: var(--cream); }
    .light h2.section-title { color: var(--green); }
    .light p, .light .section-sub { color: var(--muted); }

    /* ── Why Unprepared ── */
    .callout {
      margin-top: 2.5rem;
      border-left: 3px solid var(--accent);
      padding: 1.25rem 1.5rem;
      background: rgba(196,117,107,0.06);
      border-radius: 0 8px 8px 0;
    }
    .callout p { color: rgba(255,255,255,0.7); font-size: 1.05rem; }

    /* ── Steps ── */
    .steps { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 2.5rem; }
    .step { display: flex; gap: 1.5rem; align-items: flex-start; }
    .step-num {
      flex-shrink: 0; width: 2.5rem; height: 2.5rem; border-radius: 50%;
      border: 1px solid var(--accent); display: flex; align-items: center; justify-content: center;
      font-weight: 600; color: var(--accent); font-size: 0.9rem;
    }
    .step-body h3 { font-size: 1.3rem; font-weight: 600; color: #fff; margin-bottom: 0.4rem; }
    .step-body p { color: rgba(255,255,255,0.65); font-size: 1rem; line-height: 1.75; }

    /* ── Gains grid ── */
    .gains-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 2rem; margin-top: 2.5rem; }
    .gain h3 { font-size: 1.2rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem; }
    .gain p { color: rgba(255,255,255,0.65); font-size: 0.95rem; line-height: 1.75; }

    /* ── For you ── */
    .for-you-list { margin-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .for-you-item { display: flex; gap: 0.75rem; align-items: flex-start; }
    .check { color: var(--accent); font-weight: 700; flex-shrink: 0; }
    .for-you-item span { color: var(--muted); font-size: 1.05rem; }

    /* ── Testimonials ── */
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.75rem; margin-top: 2.5rem; }
    .testimonial {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; padding: 1.75rem;
    }
    .testimonial blockquote { font-style: italic; color: rgba(255,255,255,0.75); font-size: 1rem; line-height: 1.7; margin-bottom: 1rem; }
    .testimonial cite { color: rgba(255,255,255,0.35); font-size: 0.85rem; }

    /* ── Pricing ── */
    .price-card {
      background: #fff; border-radius: 16px; padding: 2.5rem;
      max-width: 480px; margin: 2.5rem auto 0;
    }
    .price-amount { font-size: 3.5rem; font-weight: 600; color: var(--green); line-height: 1; }
    .price-label { color: var(--muted); font-size: 0.9rem; margin-top: 0.25rem; }
    .price-includes { margin: 1.5rem 0; display: flex; flex-direction: column; gap: 0.6rem; }
    .price-item { display: flex; gap: 0.75rem; color: var(--muted); font-size: 0.95rem; }
    .price-cta {
      display: block; width: 100%; text-align: center;
      background: var(--accent); color: #fff;
      padding: 0.9rem 1.5rem; border-radius: 999px;
      font-weight: 600; font-size: 1rem; text-decoration: none;
      transition: background 0.2s; margin-top: 1.5rem;
    }
    .price-cta:hover { background: #B86761; }
    .guarantee { text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 0.75rem; }

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

    /* ── Final CTA ── */
    .final-cta { text-align: center; }
    .final-cta h2 { font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 500; font-style: italic; color: #fff; margin-bottom: 1rem; }
    .final-cta p { color: rgba(255,255,255,0.6); max-width: 500px; margin: 0 auto 2rem; font-size: 1.05rem; }

    /* ── Footer ── */
    footer {
      background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.07);
      padding: 2rem 2.5rem; text-align: center;
    }
    footer p { color: rgba(255,255,255,0.25); font-size: 0.85rem; }
    footer a { color: rgba(255,255,255,0.35); text-decoration: none; }
    footer a:hover { color: rgba(255,255,255,0.6); }

    @media (max-width: 640px) {
      nav { padding: 1rem 1.25rem; }
      .nav-links .nav-link { display: none; }
      section { padding: 4rem 1.25rem; }
      .hero-content { padding: 1.5rem 1.25rem 2.5rem; }
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

  <!-- Hero -->
  <section class="hero" aria-label="Hero">
    <img
      src="${OG_IMAGE}"
      alt="Christian engaged couple"
      class="hero-img"
      loading="eager"
      fetchpriority="high"
    />
    <div class="hero-overlay" aria-hidden="true"></div>
    <div class="hero-content">
      <h1>Sexual Preparation for Christian Engaged Couples</h1>
      <p>A comprehensive assessment for Christian engaged couples. Covering everything about sexual intimacy that no one taught you to talk about.</p>
      <a href="${SIGNUP_URL}" class="btn-primary">Begin Assessment →</a>
    </div>
  </section>

  <!-- Why Unprepared -->
  <section aria-labelledby="why-heading">
    <div class="max-w-narrow">
      <h2 class="section-title" id="why-heading">Most couples enter marriage<br>sexually unprepared</h2>
      <p class="section-sub">The church has often been silent on the specifics — leaving couples to figure it out on their wedding night. Pain, mismatched expectations, anxiety, and disappointment don't have to be part of your story.</p>
      <div class="callout">
        <p>SACRED gives you the conversations you need before you're married — covering the topics most premarital resources never address.</p>
      </div>
    </div>
  </section>

  <!-- For You -->
  <section class="light" aria-labelledby="foryou-heading">
    <div class="max-w-narrow">
      <h2 class="section-title" id="foryou-heading">This is for you if…</h2>
      <div class="for-you-list">
        <div class="for-you-item"><span class="check">✓</span><span>You're engaged and waiting until marriage</span></div>
        <div class="for-you-item"><span class="check">✓</span><span>You want to enter your wedding night prepared, not anxious</span></div>
        <div class="for-you-item"><span class="check">✓</span><span>You've found these conversations hard to start on your own</span></div>
        <div class="for-you-item"><span class="check">✓</span><span>Your premarital counselling didn't go deep enough on sexual intimacy</span></div>
        <div class="for-you-item"><span class="check">✓</span><span>One or both of you has a sexual history that needs honest conversation</span></div>
        <div class="for-you-item"><span class="check">✓</span><span>You want a biblical, non-graphic resource you can trust</span></div>
      </div>
    </div>
  </section>

  <!-- How It Works -->
  <section aria-labelledby="how-heading">
    <div class="max-w-narrow">
      <h2 class="section-title" id="how-heading">How Sacred Works</h2>
      <p class="section-sub">Comprehensive without being overwhelming, and completely private until you're both ready to share.</p>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-body">
            <h3>Individual Assessment</h3>
            <p>Each partner completes a thorough evaluation privately. This ensures honest responses about expectations, concerns, and desires without pressure or judgment.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-body">
            <h3>Personalised Comparison</h3>
            <p>Receive a detailed analysis highlighting where you align and where you need discussion. Most couples are surprised by both their similarities and differences.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-body">
            <h3>Guided Conversations</h3>
            <p>Use your results as a roadmap for meaningful conversations about your future intimate relationship. No more awkward silences or not knowing where to start.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- What You Gain -->
  <section aria-labelledby="gains-heading">
    <div class="max-w">
      <h2 class="section-title" id="gains-heading">What You'll Gain</h2>
      <div class="gains-grid">
        <div class="gain">
          <h3>Move from Uncertainty to Confidence</h3>
          <p>Understand exactly what to expect and how to communicate about sexual intimacy before your wedding night.</p>
        </div>
        <div class="gain">
          <h3>Prevent Problems Before They Start</h3>
          <p>Address potential challenges and mismatched expectations while you're engaged, rather than discovering them after marriage.</p>
        </div>
        <div class="gain">
          <h3>Build Deeper Connection Through Understanding</h3>
          <p>Create genuine intimacy by truly knowing each other's thoughts, concerns, and desires.</p>
        </div>
        <div class="gain">
          <h3>Enter Marriage Sexually Prepared</h3>
          <p>Feel confident and equipped rather than anxious and uninformed about this crucial aspect of marriage.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="light" aria-labelledby="testimonials-heading">
    <div class="max-w">
      <h2 class="section-title" id="testimonials-heading">What couples are saying</h2>
      <div class="testimonials-grid">
        <div class="testimonial">
          <blockquote>"For the first time, we could talk about intimacy without it being awkward. We actually felt prepared."</blockquote>
          <cite>— Sarah &amp; David, married 1 year</cite>
        </div>
        <div class="testimonial">
          <blockquote>"Our premarital counsellor had no idea this existed. We wish every engaged couple knew about SACRED."</blockquote>
          <cite>— Emily &amp; James, engaged</cite>
        </div>
        <div class="testimonial">
          <blockquote>"The guided questions gave us language we didn't have. Our conversations went deeper than they ever had before."</blockquote>
          <cite>— Rachel &amp; Michael, married 6 months</cite>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section aria-labelledby="faq-heading">
    <div class="max-w-narrow">
      <h2 class="section-title" style="text-align:center" id="faq-heading">Common Questions</h2>
      <div style="margin-top:2rem">
        ${faqRowsHtml}
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section class="light" aria-labelledby="pricing-heading">
    <div class="max-w-narrow" style="text-align:center">
      <h2 class="section-title" id="pricing-heading">One payment. Lifetime access.</h2>
      <p class="section-sub" style="margin:0 auto">No subscriptions. No recurring fees. One couple, one payment, forever.</p>
      <div class="price-card">
        <div class="price-amount">$47</div>
        <div class="price-label">one-time payment</div>
        <div class="price-includes">
          <div class="price-item"><span class="check">✓</span><span>Full sexual expectations assessment for both partners</span></div>
          <div class="price-item"><span class="check">✓</span><span>Side-by-side compatibility report</span></div>
          <div class="price-item"><span class="check">✓</span><span>Guided conversation prompts for every area of difference</span></div>
          <div class="price-item"><span class="check">✓</span><span>Sacred Reflections — 13 deeper questions for connection</span></div>
          <div class="price-item"><span class="check">✓</span><span>Lifetime access for you and your partner</span></div>
        </div>
        <a href="${SIGNUP_URL}" class="price-cta">Begin Your Assessment →</a>
        <p class="guarantee">30-day money-back guarantee. No questions asked.</p>
      </div>
    </div>
  </section>

  <!-- Final CTA -->
  <section class="final-cta" aria-labelledby="final-heading">
    <div class="max-w-narrow">
      <h2 id="final-heading">Start your marriage<br>the right way</h2>
      <p>The conversations you have before your wedding night are the foundation for everything that comes after.</p>
      <a href="${SIGNUP_URL}" class="btn-primary">Begin Assessment — $47 →</a>
    </div>
  </section>

  <footer>
    <p>
      © 2025 SACRED &nbsp;·&nbsp;
      <a href="${SITE_URL}/privacy">Privacy Policy</a> &nbsp;·&nbsp;
      <a href="${SITE_URL}/terms">Terms of Service</a> &nbsp;·&nbsp;
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
      icon.textContent = isOpen ? '+' : '−';
      btn.setAttribute('aria-expanded', String(!isOpen));
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(html);
}
