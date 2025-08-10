# SACRED Platform - Deployment Guide

## 🚀 Quick Deployment

### 1. Environment Variables Required

Create a `.env.local` file or set these environment variables in your deployment platform:

```bash
# Required - Get from Supabase Dashboard
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Settings
VITE_APP_NAME=SACRED
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# Optional - For email invitations
VITE_RESEND_API_KEY=your_resend_api_key
```

### 2. Database Setup

Run these SQL scripts in your Supabase SQL Editor:

1. `CLEAN_CMS_SCHEMA.sql` - Creates all database tables
2. `ADD_ASSESSMENT_SECTIONS.sql` - Creates assessment sections
3. `COMPLETE_QUESTIONS_IMPORT.sql` - Imports all 35 SACRED questions

### 3. Deploy to Vercel/Netlify

#### Vercel:
```bash
npm install -g vercel
vercel --env VITE_SUPABASE_URL=your_url --env VITE_SUPABASE_ANON_KEY=your_key
```

#### Netlify:
```bash
npm run build
# Upload dist/ folder to Netlify
# Add environment variables in Netlify dashboard
```

### 4. Admin Access

1. Create your admin account through normal signup
2. In Supabase, update your profile:
   ```sql
   UPDATE profiles 
   SET role = 'admin', has_paid = true 
   WHERE email = 'your-email@domain.com';
   ```
3. Access admin CMS at `/AdminCMS`

## 🔧 Platform-Specific Instructions

### Vercel Deployment
1. Connect GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify Deployment
1. Connect GitHub repository  
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in site settings

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📋 Post-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Database schema applied
- [ ] Assessment questions imported (35 total)
- [ ] Admin account created and verified
- [ ] CMS accessible at `/AdminCMS`
- [ ] Landing page loads correctly
- [ ] User signup/login works
- [ ] Assessment flow functional
- [ ] Report generation works

## 🐛 Troubleshooting

### "Only Landing Page Shows"
- Check environment variables are set
- Verify Supabase connection works
- Check browser console for errors

### "Database Errors"
- Ensure all SQL scripts have been run
- Check Supabase RLS policies are active
- Verify table structure matches code

### "Assessment Not Loading"
- Run `COMPLETE_QUESTIONS_IMPORT.sql` 
- Check questions table has 35 rows
- Verify `is_active = true` on questions

### "Admin CMS Access Denied" 
- Set your user role to 'admin' in profiles table
- Ensure you're logged in with admin account
- Check RLS policies allow admin access

## 🔗 Important URLs After Deployment

- Landing: `/` or `/Landing`
- Login: `/Login` 
- Admin CMS: `/AdminCMS`
- Dashboard: `/Dashboard`
- Assessment: `/Assessment`

## 📞 Support

If deployment issues persist, check:
1. Browser console errors
2. Network tab for failed requests  
3. Supabase logs for database errors
4. Environment variable configuration