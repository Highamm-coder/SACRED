# Fix Email Confirmation URL - Supabase Configuration

## Issue
Email variable `{{ .ConfirmationURL }}` is still linked to localhost instead of `https://www.sacredonline.co`

## Root Cause
The confirmation URL in Supabase emails comes from two sources:
1. **Site URL setting** in Supabase dashboard (primary)
2. **emailRedirectTo parameter** in signup calls (override)

## Solution

### 1. Update Supabase Dashboard Settings

Go to your Supabase project dashboard:
1. Navigate to **Authentication > Settings**
2. Under **Site URL**, set: `https://www.sacredonline.co`
3. Under **Redirect URLs**, add: `https://www.sacredonline.co/**`

### 2. Verify Environment Configuration

For production deployment, ensure `.env.production` has:
```bash
VITE_SITE_URL=https://www.sacredonline.co
```

### 3. Check Email Template (Optional)

In Supabase dashboard:
1. Go to **Authentication > Email Templates**
2. Check the **Confirm Signup** template
3. Ensure `{{ .ConfirmationURL }}` uses the correct domain

## Technical Details

Our code is already correctly setting `emailRedirectTo`:

```javascript
// In src/api/services/users.js
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: userData,
    emailRedirectTo: getSiteUrl() // This calls the production URL
  }
});
```

But Supabase's **Site URL** setting in the dashboard takes precedence for email templates.

## Verification

After updating the Supabase dashboard settings:
1. Test Partner 2 signup flow
2. Check the confirmation email URL
3. Should now point to `https://www.sacredonline.co` instead of localhost

## Note

The `getSiteUrl()` function already has the correct fallback:
- Uses `VITE_SITE_URL` if set
- Falls back to `https://www.sacredonline.co` on server-side
- Only uses `window.location.origin` in development