#!/bin/bash

# SACRED Supabase Database Setup Script
# This script will automatically run the database migration

echo "🚀 Setting up SACRED database on Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Login to Supabase (you'll need to authenticate)
echo "🔐 Please login to Supabase..."
supabase login

# Link to your project
echo "🔗 Linking to your Supabase project..."
supabase link --project-ref evdhaonwtwlteaocgapt

# Run the migration
echo "📊 Running database migration..."
supabase db push

echo "✅ Database setup complete!"
echo "🎉 Your SACRED app is now running on Supabase!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Test the application"
echo "3. Check authentication flow"