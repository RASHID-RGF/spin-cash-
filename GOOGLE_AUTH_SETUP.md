# Google Authentication Implementation

## Changes Made
- Modified `src/pages/Login.tsx` to include a "Sign in with Google" button.
- Implemented `handleGoogleLogin` function using `supabase.auth.signInWithOAuth`.
- Added a visual divider between the email/password form and the Google button.

## Next Steps for You
1.  **Configure Supabase**: You must enable the Google provider in your Supabase project dashboard.
    - Go to Authentication -> Providers -> Google.
    - Enable it and provide the Client ID and Secret from Google Cloud Console.
    - Add the redirect URL to your Google Cloud Console Credentials (e.g., `https://<your-project-id>.supabase.co/auth/v1/callback`).
2.  **Test**: Once configured, click the "Sign in with Google" button on the login page to verify it works.
