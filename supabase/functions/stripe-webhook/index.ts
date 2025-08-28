// Supabase Edge Function: Stripe Webhook Handler
// This function handles Stripe webhook events to update user payment status

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      console.error('No Stripe signature found')
      return new Response('No signature', { status: 400 })
    }

    // Get the raw body
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!webhookSecret) {
      console.error('No webhook secret configured')
      return new Response('Webhook secret not configured', { status: 500 })
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    console.log('Received webhook event:', event.type, event.id)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Processing completed checkout session:', session.id, {
          amount_total: session.amount_total,
          currency: session.currency,
          payment_status: session.payment_status
        })

        // Validate that payment was successful
        if (session.payment_status !== 'paid') {
          console.error('Checkout session not paid:', session.id, 'Status:', session.payment_status)
          return new Response('Payment not completed', { status: 400 })
        }

        // Extract user information from metadata
        const userId = session.metadata?.user_id
        const userEmail = session.metadata?.user_email || session.customer_email

        if (!userId) {
          console.error('No user_id in session metadata:', session.id)
          return new Response('No user ID in metadata', { status: 400 })
        }

        // Validate user exists before updating
        const { data: existingUser, error: userError } = await supabaseClient
          .from('profiles')
          .select('id, has_paid, full_name, email')
          .eq('id', userId)
          .single()

        if (userError || !existingUser) {
          console.error('User not found for payment update:', userId, userError)
          return new Response('User not found', { status: 404 })
        }

        // Check if user already has paid status (idempotency check)
        if (existingUser.has_paid) {
          console.log(`User ${userId} already has paid status - idempotent update`)
          return new Response(JSON.stringify({ 
            received: true, 
            event_id: event.id,
            message: 'User already has paid status'
          }), { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Update user's payment status with transaction-like approach
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ 
            has_paid: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .eq('has_paid', false) // Only update if not already paid (additional safety)

        if (updateError) {
          console.error('Error updating user payment status:', updateError)
          return new Response('Database update failed', { status: 500 })
        }

        console.log(`Successfully updated payment status for user ${userId}`, {
          email: userEmail,
          amount: session.amount_total,
          session_id: session.id
        })

        // TODO: Send confirmation email to user
        // TODO: Log the successful payment for analytics
        // TODO: Send webhook to other systems if needed

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        // Additional handling if needed
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)
        // TODO: Handle failed payments (notify user, log for follow-up)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice payment succeeded:', invoice.id)
        // Handle subscription payments if you add them later
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription cancelled:', subscription.id)
        // Handle subscription cancellations if you add them later
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Return a response to acknowledge receipt of the event
    return new Response(
      JSON.stringify({ received: true, event_id: event.id }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook handler error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Webhook processing failed'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})