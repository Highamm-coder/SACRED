// Supabase Edge Function: Capture Lead + Deliver Lead Magnet
// Gates lead magnet downloads behind an email address. Records the lead,
// returns a short-lived signed URL, and emails the download link via Resend.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// slug -> file in the private lead-magnets bucket + display title
const MAGNETS: Record<string, { file: string; title: string }> = {
  'wedding-night-guide': { file: 'lm1_wedding_night_guide.pdf', title: 'Your Wedding Night: A Step-by-Step Guide' },
  'purity-culture-devotional': { file: 'lm2_purity_culture_devotional.pdf', title: 'Healing from Purity Culture: A 7-Day Devotional' },
  'conversation-cards': { file: 'lm3_conversation_cards.pdf', title: 'Sacred Conversation Cards: 30 Questions' },
  'scripture-guide': { file: 'lm4_scripture_guide.pdf', title: 'Scripture Guide: What Does the Bible Actually Say?' },
  'conversation-planner': { file: 'lm5_intimacy_conversation_planner.pdf', title: 'Pre-Marriage Intimacy Conversation Planner' },
  'counselor-guide': { file: 'lm6_counselor_selection_guide.pdf', title: 'Guide to Choosing a Pre-Marriage Counselor' },
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { email, full_name, magnet_slug, source_path } = await req.json()

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return new Response(JSON.stringify({ error: 'Please enter a valid email address' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const magnet = MAGNETS[magnet_slug]
    if (!magnet) {
      return new Response(JSON.stringify({ error: 'Unknown resource' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const cleanEmail = email.trim().toLowerCase()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Record the lead (idempotent per email+magnet; 23505 = duplicate is fine)
    const { error: insertError } = await supabase.from('leads').insert({
      email: cleanEmail,
      full_name: (full_name || '').toString().slice(0, 120) || null,
      magnet_slug,
      source_path: (source_path || '').toString().slice(0, 300) || null,
    })
    if (insertError && insertError.code !== '23505') {
      console.error('Lead insert failed:', insertError)
      return new Response(JSON.stringify({ error: 'Could not save your details, please try again' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Signed URL valid for 1 hour
    const { data: signed, error: signError } = await supabase.storage
      .from('lead-magnets')
      .createSignedUrl(magnet.file, 3600, { download: magnet.file })
    if (signError || !signed?.signedUrl) {
      console.error('Signed URL failed:', signError)
      return new Response(JSON.stringify({ error: 'Could not prepare your download, please try again' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Email delivery (non-blocking: a failed email must not fail the request)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      try {
        const firstName = (full_name || '').split(' ')[0] || 'there'
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'SACRED <noreply@sacredonline.co>',
            to: [cleanEmail],
            subject: `Your free guide: ${magnet.title}`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2F4F3F;">
                <h1 style="font-weight: 500;">Here's your guide</h1>
                <p>Hi ${firstName},</p>
                <p>Thanks for requesting <strong>${magnet.title}</strong>. Your download is ready:</p>
                <p style="margin: 32px 0;">
                  <a href="${signed.signedUrl}" style="background: #2F4F3F; color: #F5F1EB; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Download the guide</a>
                </p>
                <p style="font-size: 14px; color: #6B5B73;">This link is valid for one hour. If it expires, just request the guide again and we'll send a fresh one.</p>
                <p>When you're ready to go deeper, the SACRED assessment covers 40+ intimate topics and gives you and your partner a private roadmap for the conversations that matter.</p>
                <p><a href="https://www.sacredonline.co" style="color: #C4756B;">Learn more about the assessment</a></p>
                <p>— The SACRED Team</p>
              </div>`,
          }),
        })
        if (!emailRes.ok) {
          console.error('Lead magnet email failed:', emailRes.status, await emailRes.text())
        }
      } catch (emailError) {
        console.error('Lead magnet email error:', emailError)
      }
    } else {
      console.warn('RESEND_API_KEY not set - skipping lead magnet delivery email')
    }

    return new Response(JSON.stringify({ success: true, download_url: signed.signedUrl, title: magnet.title }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('capture-lead error:', error)
    return new Response(JSON.stringify({ error: 'Something went wrong, please try again' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
