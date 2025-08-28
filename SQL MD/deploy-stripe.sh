#!/bin/bash

# SACRED Platform - Stripe Deployment Script
# This script helps deploy the Stripe integration to Supabase

echo "🚀 SACRED Platform - Stripe Integration Deployment"
echo "================================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "✅ Supabase CLI found"

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "❌ Project not linked to Supabase. Please run:"
    echo "   supabase link --project-ref your-project-id"
    exit 1
fi

echo "✅ Project linked to Supabase"

# Deploy Edge Functions
echo "📦 Deploying Edge Functions..."

echo "  → Deploying create-checkout-session..."
supabase functions deploy create-checkout-session

echo "  → Deploying stripe-webhook..."
supabase functions deploy stripe-webhook

echo "✅ Edge Functions deployed successfully!"

# Remind about environment variables
echo ""
echo "🔧 Don't forget to set these environment variables in Supabase Dashboard:"
echo "   → Settings > Edge Functions > Environment Variables"
echo ""
echo "   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key"
echo "   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret"
echo ""

# Remind about webhook setup
echo "🔗 Set up your Stripe webhook:"
echo "   1. Go to Stripe Dashboard > Developers > Webhooks"
echo "   2. Add endpoint: https://$(supabase status | grep 'API URL' | awk '{print $3}' | sed 's|https://||')/functions/v1/stripe-webhook"
echo "   3. Select events: checkout.session.completed, payment_intent.succeeded"
echo "   4. Copy the webhook signing secret to environment variables"
echo ""

echo "🎉 Stripe deployment complete!"
echo "📖 See STRIPE_SETUP_GUIDE.md for detailed configuration steps"