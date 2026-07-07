import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { Loader2, ArrowRight, Check, Download, Mail } from 'lucide-react';

// Config for all lead magnets. Slugs must match the capture-lead edge function's MAGNETS map.
export const LEAD_MAGNETS = {
  'wedding-night-guide': {
    title: 'Your Wedding Night: A Step-by-Step Guide',
    eyebrow: 'Free Guide · Wedding Night',
    promise: 'Walk into your wedding night prepared, not panicked.',
    description: 'The honest, shame-free walkthrough nobody gave you: what to expect, how to start, and how to handle the moments no one talks about.',
    bullets: [
      'A realistic hour-by-hour picture of the night itself',
      'What to say when you have no idea how to begin',
      'The practical packing list (yes, including the lubricant)',
      'What to do if one of you isn’t ready',
    ],
    cluster: 'wedding-night',
    relatedPost: '/blog/christian-wedding-night-guide',
  },
  'purity-culture-devotional': {
    title: 'Healing from Purity Culture: A 7-Day Devotional',
    eyebrow: 'Free Devotional · Purity Culture',
    promise: 'Seven days to untangle what you were taught from what God actually says.',
    description: 'A Scripture-grounded devotional for engaged couples carrying shame they never chose. One reading, one reflection, one prayer each day.',
    bullets: [
      'Daily Scripture readings that speak directly to shame',
      'Reflection prompts to name the messages you absorbed',
      'Prayers for releasing what was never from God',
      'A shared practice to do with your fiancé(e)',
    ],
    cluster: 'purity-culture',
    relatedPost: '/blog/healing-purity-culture-before-marriage',
  },
  'conversation-cards': {
    title: 'Sacred Conversation Cards: 30 Questions',
    eyebrow: 'Free Cards · Communication',
    promise: 'Thirty questions that start the conversations you’ve been avoiding.',
    description: 'Printable conversation cards for engaged couples, organized by comfort level, from easy openers to the questions you’re afraid to ask.',
    bullets: [
      '30 questions organized from gentle to brave',
      'Designed for date nights, road trips, or quiet evenings',
      'No shame, no scripts, just honest openers',
      'Print them or read them from your phone',
    ],
    cluster: 'communication',
    relatedPost: '/blog/how-sex-works-christian-couples-guide',
  },
  'scripture-guide': {
    title: 'Scripture Guide: What Does the Bible Actually Say?',
    eyebrow: 'Free Guide · Theology',
    promise: 'The passages your youth group skipped, in context.',
    description: 'A verse-by-verse walk through what Scripture actually says about sex, desire, pleasure, and marriage, without the shame-based filter.',
    bullets: [
      'Song of Solomon, Proverbs 5, 1 Corinthians 7, and more',
      'What each passage says and what it doesn’t',
      'Where purity culture departed from the text',
      'A framework for building your own convictions as a couple',
    ],
    cluster: 'whats-allowed',
    relatedPost: '/blog/biblical-theology-sexual-pleasure-marriage',
  },
  'conversation-planner': {
    title: 'Pre-Marriage Intimacy Conversation Planner',
    eyebrow: 'Free Planner · Preparation',
    promise: 'A month-by-month conversation plan for the run-up to your wedding.',
    description: 'Map the intimacy conversations that matter onto your engagement timeline, so nothing important gets left for the honeymoon.',
    bullets: [
      'Which conversations to have at 6, 3, and 1 month out',
      'How to bring up the awkward topics naturally',
      'Boundaries, expectations, fears, and hopes, all covered',
      'Works alongside any premarital counseling program',
    ],
    cluster: 'communication',
    relatedPost: '/blog/sex-expectations-first-year-marriage-christian',
  },
  'counselor-guide': {
    title: 'Guide to Choosing a Pre-Marriage Counselor',
    eyebrow: 'Free Guide · Counseling',
    promise: 'Find a counselor who shares your values and actually covers intimacy.',
    description: 'The questions to ask, the red flags to watch for, and how to make sure sexual preparation doesn’t get skipped in your premarital counseling.',
    bullets: [
      'The 10 questions to ask before booking a counselor',
      'How to tell if intimacy will actually be covered',
      'Theological alignment: what to check and how',
      'What premarital counseling typically costs and covers',
    ],
    cluster: 'counseling',
    relatedPost: '/blog/christian-wedding-night-guide',
  },
};

const sharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
  .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; }
  .font-sacred-medium { font-family: 'Cormorant Garamond', serif; font-weight: 500; }
  .font-sacred-bold { font-family: 'Cormorant Garamond', serif; font-weight: 600; }
`;

function GuideNav() {
  return (
    <header className="py-4 px-6 md:px-10 bg-[#F5F1EB]/95 backdrop-blur border-b border-[#E6D7C9] sticky top-0 z-20">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <a href="/" className="text-2xl font-sacred tracking-widest text-[#2F4F3F]">SACRED</a>
        <div className="flex items-center gap-6">
          <Link to="/guides" className="font-sacred text-base text-[#2F4F3F]/75 hover:text-[#C4756B]">Free Guides</Link>
          <a href="/blog" className="font-sacred text-base text-[#2F4F3F]/75 hover:text-[#C4756B]">Blog</a>
          <Link
            to="/Signup"
            className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold rounded-full px-5 py-2 text-sm transition-colors"
          >
            Begin Assessment
          </Link>
        </div>
      </nav>
    </header>
  );
}

function GuideFooter() {
  return (
    <footer className="bg-[#2F4F3F] py-12 px-6 text-center">
      <p className="font-sacred text-2xl text-[#F5F1EB] tracking-widest mb-3">SACRED</p>
      <p className="font-sacred text-[#F5F1EB]/70 max-w-md mx-auto mb-6">
        Sexual preparation for Christian engaged couples. Private, shame-free, theologically grounded.
      </p>
      <Link
        to="/Signup"
        className="inline-flex items-center gap-2 bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold rounded-full px-6 py-3 transition-colors"
      >
        Take the assessment <ArrowRight className="w-4 h-4" />
      </Link>
    </footer>
  );
}

// Email-gate form: posts to the capture-lead edge function, which records the
// lead and returns a short-lived signed download URL (also emailed via Resend).
function EmailGate({ slug, magnet }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (state === 'loading') return;
    setState('loading');
    setErrorMsg('');
    try {
      const { data, error } = await supabase.functions.invoke('capture-lead', {
        body: {
          email,
          full_name: name,
          magnet_slug: slug,
          source_path: window.location.pathname,
        },
      });
      if (error) {
        let message = 'Something went wrong. Please try again.';
        try {
          const body = await error.context?.json?.();
          if (body?.error) message = body.error;
        } catch { /* keep generic message */ }
        setErrorMsg(message);
        setState('error');
        return;
      }
      setDownloadUrl(data?.download_url || null);
      setState('done');
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="bg-white rounded-2xl p-8 border border-[#E6D7C9] soft-shadow text-center">
        <div className="w-12 h-12 rounded-full bg-[#2F4F3F] flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-[#F5F1EB]" />
        </div>
        <h3 className="font-sacred-medium text-2xl text-[#2F4F3F] mb-2">It&rsquo;s on its way</h3>
        <p className="font-sacred text-[#6B5B73] mb-6">
          We&rsquo;ve emailed your copy of <em>{magnet.title}</em>. You can also download it right now:
        </p>
        {downloadUrl && (
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-2 bg-[#2F4F3F] hover:bg-[#243D30] text-[#F5F1EB] font-sacred-bold rounded-full px-6 py-3 transition-colors"
          >
            <Download className="w-4 h-4" /> Download now
          </a>
        )}
        <p className="font-sacred text-sm text-[#6B5B73] mt-6">
          Ready for the real conversation?{' '}
          <Link to="/Signup" className="text-[#C4756B] underline">Take the SACRED assessment</Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-[#E6D7C9] soft-shadow">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-[#C4756B]" />
        <h3 className="font-sacred-medium text-xl text-[#2F4F3F]">Get the free guide</h3>
      </div>
      <p className="font-sacred text-[#6B5B73] text-sm mb-5">
        Tell us where to send it. You&rsquo;ll also join the SACRED newsletter, thoughtful weekly encouragement for engaged couples. Unsubscribe anytime.
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First name (optional)"
        className="w-full mb-3 px-4 py-3 rounded-lg border border-[#E6D7C9] bg-[#F5F1EB]/50 font-sacred text-[#2F4F3F] focus:outline-none focus:border-[#C4756B]"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="w-full mb-4 px-4 py-3 rounded-lg border border-[#E6D7C9] bg-[#F5F1EB]/50 font-sacred text-[#2F4F3F] focus:outline-none focus:border-[#C4756B]"
      />
      {errorMsg && <p className="font-sacred text-sm text-[#C4756B] mb-3">{errorMsg}</p>}
      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#C4756B] hover:bg-[#B86761] disabled:opacity-60 text-white font-sacred-bold rounded-full px-6 py-3 transition-colors"
      >
        {state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {state === 'loading' ? 'Sending…' : 'Send me the guide'}
      </button>
      <p className="font-sacred text-xs text-[#6B5B73]/70 mt-4 text-center">
        We respect your privacy. No spam, ever.
      </p>
    </form>
  );
}

export function GuidesIndex() {
  useEffect(() => {
    document.title = 'Free Guides for Engaged Couples | SACRED';
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F1EB]">
      <style>{sharedStyles}</style>
      <GuideNav />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <p className="font-sacred-bold text-[#C4756B] text-xs tracking-[0.25em] uppercase mb-4 text-center">Free Resources</p>
        <h1 className="font-sacred text-4xl md:text-5xl text-[#2F4F3F] text-center mb-4">
          Guides for the conversations that matter
        </h1>
        <p className="font-sacred text-lg text-[#6B5B73] text-center max-w-2xl mx-auto mb-14">
          Practical, shame-free resources for Christian engaged couples. Pick the one you need most, we&rsquo;ll send it straight to your inbox.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(LEAD_MAGNETS).map(([slug, m]) => (
            <Link
              key={slug}
              to={`/guides/${slug}`}
              className="bg-white rounded-2xl p-7 border border-[#E6D7C9] hover:border-[#C4756B] transition-colors flex flex-col"
            >
              <p className="font-sacred-bold text-[#C4756B] text-xs tracking-[0.2em] uppercase mb-3">{m.eyebrow}</p>
              <h2 className="font-sacred-medium text-2xl text-[#2F4F3F] mb-2 leading-snug">{m.title}</h2>
              <p className="font-sacred text-[#6B5B73] mb-5 flex-1">{m.promise}</p>
              <span className="inline-flex items-center gap-2 font-sacred-bold text-[#2F4F3F]">
                Get the free guide <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </main>
      <GuideFooter />
    </div>
  );
}

export default function LeadMagnetPage() {
  const { slug } = useParams();
  const magnet = LEAD_MAGNETS[slug];

  useEffect(() => {
    if (magnet) document.title = `${magnet.title} | Free Guide | SACRED`;
  }, [magnet]);

  if (!magnet) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex flex-col">
        <style>{sharedStyles}</style>
        <GuideNav />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-sacred text-3xl text-[#2F4F3F] mb-4">We couldn&rsquo;t find that guide</h1>
          <Link to="/guides" className="font-sacred text-[#C4756B] underline">Browse all free guides</Link>
        </div>
        <GuideFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB]">
      <style>{sharedStyles}</style>
      <GuideNav />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="font-sacred-bold text-[#C4756B] text-xs tracking-[0.25em] uppercase mb-4">{magnet.eyebrow}</p>
            <h1 className="font-sacred text-4xl md:text-5xl text-[#2F4F3F] leading-tight mb-4">{magnet.title}</h1>
            <p className="font-sacred-medium text-xl text-[#2F4F3F]/80 mb-4">{magnet.promise}</p>
            <p className="font-sacred text-lg text-[#6B5B73] mb-8">{magnet.description}</p>
            <ul className="space-y-3 mb-8">
              {magnet.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-5 h-5 rounded-full bg-[#2F4F3F] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#F5F1EB]" />
                  </span>
                  <span className="font-sacred text-[#2F4F3F] text-lg">{b}</span>
                </li>
              ))}
            </ul>
            <p className="font-sacred text-sm text-[#6B5B73]">
              Want to go deeper first?{' '}
              <a href={magnet.relatedPost} className="text-[#C4756B] underline">Read the related article</a>
            </p>
          </div>
          <div className="lg:sticky lg:top-24">
            <EmailGate slug={slug} magnet={magnet} />
          </div>
        </div>
      </main>
      <GuideFooter />
    </div>
  );
}
