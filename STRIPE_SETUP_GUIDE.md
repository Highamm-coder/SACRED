# 💳 SACRED Platform - Stripe Payment Integration Setup Guide

## 🚀 **Complete Stripe Integration Implemented**

This guide covers the complete deployment of the Stripe payment system for the SACRED platform.

## 📋 **What's Been Implemented**

### ✅ **Frontend Integration**
- Real Stripe.js integration (replacing placeholders)
- Professional payment UI with $47 pricing
- Payment success verification with retry logic
- Error handling and user feedback

### ✅ **Backend Integration**
- Supabase Edge Functions for secure payment processing
- Stripe webhook handling for automatic user activation
- Database integration for payment status updates

### ✅ **Security Features**
- Server-side payment verification
- Webhook signature validation
- User authentication for checkout creation
- No sensitive payment data stored locally

## 🔧 **Deployment Steps**

### **Step 1: Stripe Account Setup**

1. **Create/Access Stripe Account**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Complete account verification for live payments

2. **Get API Keys**
   ```bash
   # From Stripe Dashboard > Developers > API Keys
   Publishable key: pk_live_...  (or pk_test_... for testing)
   Secret key: sk_live_...       (or sk_test_... for testing)
   ```

3. **Create Webhook Endpoint**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Click "Add endpoint"
   - URL: `https://your-project-id.supabase.co/functions/v1/stripe-webhook`
   - Events to send:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy the webhook signing secret: `whsec_...`

### **Step 2: Supabase Edge Functions Deployment**

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   supabase login
   ```

2. **Link Your Project**
   ```bash
   supabase link --project-ref your-project-id
   ```

3. **Set Environment Variables**
   ```bash
   # Set in Supabase Dashboard > Settings > Edge Functions
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
   ```

4. **Deploy Edge Functions**
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook
   ```

### **Step 3: Frontend Environment Configuration**

1. **Update .env.local**
   ```bash
   # Add to your .env.local file
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
   ```

2. **Verify Environment Variables**
   ```bash
   # .env.local should include:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_SITE_URL=https://www.sacredonline.co
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   ```

### **Step 4: Test the Integration**

1. **Test Mode First**
   - Use `pk_test_...` and `sk_test_...` keys
   - Use test card: `4242 4242 4242 4242`
   - Verify webhook delivery in Stripe Dashboard

2. **Production Testing**
   - Switch to live keys
   - Test with small amount first
   - Verify webhook delivery
   - Check database updates

## 🔐 **Security Checklist**

### ✅ **Implemented Security Features**
- ✅ Server-side payment processing (Edge Functions)
- ✅ Webhook signature verification
- ✅ User authentication for checkout creation
- ✅ Metadata validation in webhooks
- ✅ Database permission checks
- ✅ No sensitive data in frontend code

### 🔒 **Security Best Practices**
- Never store Stripe secret keys in frontend code
- Always verify webhook signatures
- Use HTTPS for all payment-related endpoints
- Validate user permissions before payment operations
- Log payment events for audit trails

## 💰 **Payment Flow**

### **Customer Journey**
1. **User visits PaymentRequired page**
2. **Clicks "Upgrade and Pay" button**
3. **Frontend calls create-checkout-session Edge Function**
4. **User redirected to Stripe Checkout**
5. **Completes payment with card details**
6. **Stripe webhook fires to stripe-webhook Edge Function**
7. **Database updated: `has_paid = true`**
8. **User redirected to PaymentSuccess page**
9. **Success page verifies payment status**
10. **User redirected to Dashboard with full access**

### **Technical Flow**
```
Frontend (PaymentRequired.jsx)
    ↓ createStripeCheckoutSession()
Edge Function (create-checkout-session)
    ↓ stripe.checkout.sessions.create()
Stripe Checkout
    ↓ payment completion
Stripe Webhook
    ↓ checkout.session.completed
Edge Function (stripe-webhook)
    ↓ update profiles.has_paid = true
Database (Supabase)
    ↓ user now has access
Frontend (PaymentSuccess.jsx)
    ↓ verifyCheckoutSession()
Dashboard (full access)
```

## 🧪 **Testing Scenarios**

### **Test Cases to Verify**
1. **Successful Payment**
   - User completes payment → `has_paid = true`
   - Access granted to protected pages
   - Proper redirect to Dashboard

2. **Failed Payment**
   - Card declined → user stays on payment page
   - No database changes
   - User can retry payment

3. **Webhook Failures**
   - Payment succeeds but webhook fails
   - User verification polling handles delay
   - Manual verification possible

4. **User Already Paid**
   - Checkout creation blocked
   - Proper error message shown
   - Redirect to Dashboard

## 📊 **Monitoring & Analytics**

### **What to Monitor**
- Stripe Dashboard for payment analytics
- Supabase Edge Function logs
- Database payment status updates
- User conversion rates

### **Key Metrics**
- Payment success rate
- Webhook delivery success
- User activation time
- Revenue tracking

## 🆘 **Troubleshooting**

### **Common Issues**

1. **"Failed to create checkout session"**
   - Check Stripe API keys are set correctly
   - Verify Edge Function is deployed
   - Check user authentication

2. **"Payment verification timed out"**
   - Check webhook endpoint URL
   - Verify webhook signing secret
   - Check Supabase service role key

3. **"User has already purchased access"**
   - Check database `has_paid` status
   - Use admin panel to reset if needed

4. **Edge Function deployment fails**
   - Verify Supabase CLI is latest version
   - Check project linking
   - Verify environment variables

## 🚀 **Go Live Checklist**

### **Before Production Deploy**
- [ ] Stripe account fully verified
- [ ] Live API keys obtained and set
- [ ] Webhook endpoint configured with live URL
- [ ] Edge Functions deployed with live keys
- [ ] End-to-end testing completed
- [ ] Error handling tested
- [ ] Monitoring setup complete

### **After Production Deploy**
- [ ] Test with real payment (small amount)
- [ ] Verify webhook delivery
- [ ] Check database updates
- [ ] Monitor error logs for 24 hours
- [ ] User acceptance testing

## 💸 **Pricing Configuration**

**Current Setup:**
- **Product:** SACRED Relationship Assessment
- **Price:** $47.00 USD (one-time payment)
- **Features:** Lifetime access for couple
- **Payment Methods:** All major credit/debit cards
- **Promo Codes:** Enabled (can be added in Stripe Dashboard)

**To modify pricing:**
1. Update amount in Edge Function: `unit_amount: 4700` (cents)
2. Update display in PaymentRequired.jsx
3. Redeploy Edge Function

## 📞 **Support**

For technical issues:
1. Check Stripe Dashboard for payment status
2. Check Supabase logs for Edge Function errors
3. Verify environment variables are set correctly
4. Contact support with session ID for payment-specific issues

---

**🎉 Your Stripe integration is complete and ready for production!**