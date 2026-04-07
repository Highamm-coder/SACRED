# SACRED — App State (April 2026)

## What It Is
Pre-marriage sexual intimacy assessment platform for Christian couples. Users pay $47 (one-time) to access assessments and receive personalized reports.

## Stack
- **Frontend:** React 18 + Vite, React Router v7, Tailwind CSS, Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments:** Stripe (one-time checkout, $47 USD)
- **Email:** Resend
- **Deployment:** Vercel → sacredonline.co

---

## Feature Status

### Working
- Auth — Supabase email/password, profile auto-creation, role system (user/editor/admin)
- Payment — Stripe checkout, webhook updates `has_paid`, paywall enforcement
- Assessment wizard — multi-question form, progress tracking, answer persistence
- Report — alignment visualizations (Recharts), card/list toggle, sorting
- Blog/CMS — blog posts, admin CMS interface, editor roles, media library
- Onboarding — user info, wedding date, consent flow

### Incomplete
- **Education page** — "Coming Soon" placeholder. Table (`education_resources`) exists and is populated.
- **Shop page** — "Coming Soon" placeholder. Table (`product_recommendations`) exists and is populated.
- **Payment confirmation email** — TODO in `stripe-webhook` edge function. Resend is integrated, just not called post-payment.
- **Account deletion** — placeholder function in `src/api/functions.js`, not implemented.
- **Recommended videos** — stub returns empty array (2 locations in `src/api/entities.js`).
- **Wedding date checking** — placeholder function.

### Deprecated / Legacy
- **Partner system** — two-partner collaborative assessment model was built, then removed. Replaced by single-account model.
  - `backup_partner_system/` directory still present (safe to delete)
  - `SQL MD/` directory has historical migrations (safe to delete)
  - `src/utils/partnerUtils.js` has leftover helpers with TODO to remove

---

## Database (18 tables)

| Domain | Tables |
|--------|--------|
| Users | `profiles` |
| Assessments | `questions`, `answers`, `assessment_sections`, `assessment_interpretations`, `assessment_config`, `assessment_responses`, `couple_assessments`, `misalignment_discussions`, `open_ended_questions`, `open_ended_answers` |
| CMS | `blog_posts`, `education_resources`, `product_recommendations`, `page_content`, `media_library` |
| Analytics | `user_analytics`, `content_analytics` |

> **Risk:** Assessment table schemas have no migration files — they exist only in the live Supabase DB. A `pg_dump` of the schema is needed for safety.

---

## Known Risks

1. **No assessment schema migrations** — DB loss = unrecoverable structure
2. **Payment confirmation email missing** — users get no email receipt after paying
3. **Account deletion not implemented** — potential compliance issue
4. **Payment verification race condition** — PaymentSuccess polls for 15s; slow webhooks can cause false failure UX

---

## Immediate Next Steps (suggested priority)

1. Wire payment confirmation email into `stripe-webhook` edge function
2. Complete Education page (data exists, just needs frontend)
3. Complete Shop page (data exists, just needs frontend)
4. Dump assessment schema to a migration file
5. Implement account deletion
6. Delete `backup_partner_system/` and `SQL MD/`
