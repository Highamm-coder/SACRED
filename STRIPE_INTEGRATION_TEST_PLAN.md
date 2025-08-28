# SACRED Platform - Stripe Integration Test Plan

## Overview
This document outlines comprehensive test scenarios for the SACRED platform's Stripe payment integration to ensure reliability, security, and proper user experience.

## Pre-Test Setup Checklist

### Environment Configuration
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
- [ ] Supabase Edge Functions are deployed with correct environment variables:
  - [ ] `STRIPE_SECRET_KEY` (matches publishable key environment)
  - [ ] `STRIPE_WEBHOOK_SECRET` 
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Webhook endpoint is configured in Stripe Dashboard
- [ ] Database `profiles` table has `has_paid` column

### Stripe Dashboard Setup
- [ ] Webhook endpoint: `https://[project-id].supabase.co/functions/v1/stripe-webhook`
- [ ] Events configured: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Test/Live mode matches environment variable

## Test Scenarios

### 1. **Environment Validation Tests**

#### Test 1.1: Missing Configuration
**Objective**: Ensure proper error handling when Stripe is not configured
**Steps**:
1. Remove or comment out `VITE_STRIPE_PUBLISHABLE_KEY` from `.env.local`
2. Restart development server
3. Navigate to `/PaymentRequired` page
**Expected Results**:
- [ ] Console shows environment validation errors
- [ ] Payment button is disabled
- [ ] Error message indicates payment system not configured
- [ ] No Stripe initialization attempts

#### Test 1.2: Invalid Key Format
**Objective**: Validate key format checking
**Steps**:
1. Set `VITE_STRIPE_PUBLISHABLE_KEY=invalid_key_format`
2. Restart development server
3. Check console output
**Expected Results**:
- [ ] Environment validator catches invalid format
- [ ] Clear error message about key format requirements

#### Test 1.3: Test vs Live Mode Detection
**Objective**: Ensure proper environment detection
**Steps**:
1. Set test key: `pk_test_...`
2. Check payment page
3. Switch to live key: `pk_live_...` (if available)
4. Check payment page again
**Expected Results**:
- [ ] Test mode shows "🧪 Test Mode Active" indicator
- [ ] Live mode shows "🔒 Live Payments Enabled" indicator

### 2. **Payment Flow Tests**

#### Test 2.1: Successful Payment Flow (Test Mode)
**Objective**: Complete end-to-end payment process
**Prerequisites**: Test Stripe keys configured
**Steps**:
1. Create test user account and login
2. Navigate to `/PaymentRequired`
3. Click "Upgrade and Pay" button
4. Use test card: `4242 4242 4242 4242`, any future date, any CVC
5. Complete Stripe Checkout
6. Wait on PaymentSuccess page
**Expected Results**:
- [ ] Redirect to Stripe Checkout
- [ ] Payment processed successfully
- [ ] Webhook triggers and updates database
- [ ] PaymentSuccess page shows verification progress
- [ ] User `has_paid` status becomes `true`
- [ ] Redirect to Dashboard after 3 seconds
- [ ] Dashboard shows full access

#### Test 2.2: Declined Payment
**Objective**: Handle payment failures gracefully
**Steps**:
1. Navigate to `/PaymentRequired`
2. Click "Upgrade and Pay"
3. Use declined test card: `4000 0000 0000 0002`
**Expected Results**:
- [ ] Stripe shows card declined error
- [ ] User remains on Stripe Checkout
- [ ] User can retry with different card
- [ ] Database `has_paid` remains `false`

#### Test 2.3: Abandoned Payment
**Objective**: Handle incomplete payment flow
**Steps**:
1. Navigate to `/PaymentRequired`
2. Click "Upgrade and Pay"
3. Close Stripe Checkout window/tab
4. Return to application
**Expected Results**:
- [ ] User can retry payment
- [ ] No database changes
- [ ] PaymentRequired page still accessible

### 3. **Duplicate Payment Prevention Tests**

#### Test 3.1: Already Paid User Blocking
**Objective**: Prevent duplicate payments for users who already paid
**Prerequisites**: User with `has_paid = true`
**Steps**:
1. Login as user who already paid
2. Navigate to `/PaymentRequired`
**Expected Results**:
- [ ] Automatic redirect to Dashboard OR
- [ ] Error message about already purchased access
- [ ] No Stripe Checkout creation

#### Test 3.2: Concurrent Payment Attempts
**Objective**: Handle multiple simultaneous payment attempts
**Steps**:
1. Open two browser tabs with same user
2. Start payment process in both tabs simultaneously
**Expected Results**:
- [ ] Only one payment should succeed
- [ ] Database remains consistent
- [ ] Second attempt shows appropriate error

### 4. **Webhook and Verification Tests**

#### Test 4.1: Webhook Processing
**Objective**: Ensure webhooks properly update user status
**Steps**:
1. Complete payment flow
2. Monitor Supabase Edge Function logs
3. Check database changes
**Expected Results**:
- [ ] Webhook received within seconds of payment
- [ ] Correct user ID extracted from metadata
- [ ] Database `has_paid` updated to `true`
- [ ] Console logs show successful processing

#### Test 4.2: Payment Verification Retry Logic
**Objective**: Test retry mechanism if webhook is delayed
**Steps**:
1. Temporarily disable webhook (or simulate delay)
2. Complete payment
3. Observe PaymentSuccess page behavior
**Expected Results**:
- [ ] Shows "Verifying payment..." with attempt counter
- [ ] Attempts verification multiple times
- [ ] Uses exponential backoff timing
- [ ] Shows retry button if verification fails

#### Test 4.3: Invalid Webhook Signature
**Objective**: Ensure webhook security
**Steps**:
1. Send webhook with invalid signature to endpoint
**Expected Results**:
- [ ] Webhook rejected with 400 error
- [ ] No database changes
- [ ] Security error logged

### 5. **Error Handling and Recovery Tests**

#### Test 5.1: Network Failure During Payment
**Objective**: Handle network interruptions
**Steps**:
1. Start payment process
2. Simulate network disconnection during Stripe Checkout
3. Reconnect and check status
**Expected Results**:
- [ ] Graceful error handling
- [ ] User can retry payment
- [ ] Clear error messages

#### Test 5.2: Supabase Database Unavailable
**Objective**: Handle database connectivity issues
**Steps**:
1. Simulate database unavailability during webhook processing
**Expected Results**:
- [ ] Webhook returns appropriate error code
- [ ] Stripe will retry webhook delivery
- [ ] No data corruption

#### Test 5.3: Edge Function Timeout
**Objective**: Handle function execution limits
**Steps**:
1. Monitor Edge Function execution time
2. Test with slow network conditions
**Expected Results**:
- [ ] Functions complete within timeout limits
- [ ] Appropriate error handling if timeout occurs

### 6. **User Experience Tests**

#### Test 6.1: Mobile Responsiveness
**Objective**: Ensure payment flow works on mobile devices
**Steps**:
1. Test payment flow on mobile browser
2. Test various screen sizes
**Expected Results**:
- [ ] Payment page is responsive
- [ ] Stripe Checkout works on mobile
- [ ] Status indicators are visible

#### Test 6.2: Browser Compatibility
**Objective**: Ensure cross-browser compatibility
**Steps**:
1. Test in Chrome, Firefox, Safari, Edge
2. Test payment flow in each
**Expected Results**:
- [ ] Consistent behavior across browsers
- [ ] No JavaScript errors
- [ ] Stripe integration works in all browsers

### 7. **Security Tests**

#### Test 7.1: Sensitive Data Exposure
**Objective**: Ensure no sensitive data in frontend
**Steps**:
1. Inspect browser network tab during payment
2. Check browser console for sensitive data
3. Review source code exposure
**Expected Results**:
- [ ] No secret keys in frontend code
- [ ] No sensitive payment data stored locally
- [ ] Only public/publishable keys visible

#### Test 7.2: Session Security
**Objective**: Validate session and user authentication
**Steps**:
1. Attempt to create payment without authentication
2. Test with expired session
**Expected Results**:
- [ ] Unauthenticated requests rejected
- [ ] Expired sessions handled properly
- [ ] User metadata correctly attached to payment

### 8. **Performance Tests**

#### Test 8.1: Payment Page Load Time
**Objective**: Ensure fast page load
**Steps**:
1. Measure PaymentRequired page load time
2. Test Stripe.js initialization time
**Expected Results**:
- [ ] Page loads within 2 seconds
- [ ] Stripe initializes within 1 second
- [ ] No blocking JavaScript

#### Test 8.2: Webhook Processing Time
**Objective**: Ensure fast webhook processing
**Steps**:
1. Monitor webhook processing duration
2. Test with high load if possible
**Expected Results**:
- [ ] Webhook processes within 5 seconds
- [ ] Database updates complete quickly
- [ ] No timeout errors

## Production Readiness Checklist

### Before Going Live
- [ ] All test scenarios pass with test keys
- [ ] Switch to live Stripe keys (publishable and secret)
- [ ] Update webhook endpoint for production environment
- [ ] Test with small real payment amount
- [ ] Verify webhook delivery in production
- [ ] Monitor error logs for 24 hours
- [ ] Set up monitoring and alerts

### Post-Launch Monitoring
- [ ] Track payment success rates
- [ ] Monitor webhook delivery rates
- [ ] Watch for error patterns
- [ ] Monitor user conversion rates
- [ ] Check database consistency daily

## Common Issues and Solutions

### Issue: Webhook not received
**Symptoms**: Payment succeeds but user status not updated
**Solutions**:
1. Check webhook URL in Stripe Dashboard
2. Verify webhook signing secret
3. Check Supabase Edge Function logs
4. Ensure events are configured correctly

### Issue: Payment verification timeout
**Symptoms**: PaymentSuccess page shows timeout error
**Solutions**:
1. Check webhook processing time
2. Verify database connectivity
3. Check Edge Function timeout settings
4. Review user authentication

### Issue: Duplicate payments
**Symptoms**: User charged twice
**Solutions**:
1. Review duplicate prevention logic
2. Check database constraints
3. Implement better session handling
4. Add payment idempotency

### Issue: Environment configuration errors
**Symptoms**: Payment page not working
**Solutions**:
1. Run environment validator
2. Check all required environment variables
3. Verify key formats and permissions
4. Restart application after changes

## Success Metrics

### Payment Flow Success Rate
- **Target**: > 95% successful payment completions
- **Measurement**: Successful payments / Total payment attempts

### Webhook Reliability
- **Target**: > 99% webhook delivery success
- **Measurement**: Successful webhooks / Total webhooks sent

### Payment Verification Time
- **Target**: < 10 seconds average
- **Measurement**: Time from payment to user status update

### User Experience
- **Target**: < 3 clicks to complete payment
- **Measurement**: User interaction tracking

---

**Note**: Run this test plan whenever making changes to payment logic, updating Stripe versions, or deploying to new environments.