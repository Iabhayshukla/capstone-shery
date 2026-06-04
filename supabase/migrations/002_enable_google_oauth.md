# Enabling Google OAuth in Supabase

## Steps (do this once in Supabase Dashboard)

1. Go to https://app.supabase.com → Your Project → **Authentication → Providers**
2. Click **Google** and toggle it **Enabled**
3. Add your Google OAuth credentials:
   - **Client ID**: from Google Cloud Console → APIs & Services → Credentials
   - **Client Secret**: from the same Google OAuth 2.0 Client

## Google Cloud Console Setup

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Enable **Google+ API** (or "People API")
4. Create OAuth 2.0 credentials:
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `http://localhost:5000/api/auth/callback` (development)

## Supabase Redirect URL

In Supabase → Authentication → URL Configuration, set:
- **Site URL**: `http://localhost:3000` (dev) / your production URL (prod)
- **Redirect URLs**: add both dev and prod URLs

No SQL migration needed — this is entirely dashboard configuration.