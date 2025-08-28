# Base44 App


This app was created automatically by Base44.
It's a Vite+React app that communicates with the Base44 API.

## Running the app

```bash
npm install
npm run dev
```

## Building the app

```bash
npm run build
```

## Payment Integration

The platform includes a complete Stripe payment integration:

- **Secure checkout** via Stripe Checkout
- **Webhook handling** for automatic user activation  
- **Supabase Edge Functions** for server-side processing

### Setup Payment Integration
```bash
# 1. Deploy Stripe Edge Functions
./deploy-stripe.sh

# 2. Configure environment variables (see .env.example)
# 3. Set up Stripe webhook (see STRIPE_SETUP_GUIDE.md)
```

See `STRIPE_SETUP_GUIDE.md` for complete setup instructions.

## Key Features

- **Partner 2 Onboarding** - Dedicated signup flow for invited partners
- **Secure Invite System** - Token-based invites with expiration
- **Payment Integration** - Complete Stripe checkout and verification
- **Mobile Optimized** - Responsive design for all devices
- **Admin Dashboard** - User management and analytics

For more information and support, please contact Base44 support at app@base44.com.