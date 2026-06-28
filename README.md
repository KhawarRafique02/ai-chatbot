# KhawarAI – AI Chatbot

A production-ready AI chatbot built with Next.js 14, Google Gemini, and Supabase.

## Features
- 🤖 Google Gemini AI (free, no credit card)
- 🔐 Supabase Auth (email/password)
- 💾 Chat history saved to database
- 🎯 4 AI Modes: General, Code, Creative, Translator
- ⚡ Real-time streaming responses
- 📱 Mobile responsive

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
The `.env.local` file already has your keys.

### 3. Supabase SQL
Run the SQL from `supabase-setup.sql` in Supabase SQL Editor.

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/KhawarRafique02/ai-chatbot.git
git push -u origin main
```
Then in Vercel: Import repo → Add environment variables → Deploy

### Environment Variables for Vercel
Add these in Vercel project settings:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY  
- GEMINI_API_KEY
