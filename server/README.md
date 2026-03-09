# Taskify Server

Node.js backend for Taskify with auth and forgot-password flow.

## Setup

1. Copy `.env.example` to `.env` and fill in your values.
2. Create the `profiles` table in Supabase: open **Dashboard → SQL Editor**, then run the script in `server/supabase-migrations/001_profiles_and_otp.sql` (or the minimal `001_profiles_minimal.sql`). This creates `public.profiles` with `email`, `password_reset_otp`, and `password_reset_otp_expires_at`. If you already ran 001, run `002_profiles_insert_on_signup.sql` for the insert policy, then `003_add_email_to_profiles.sql` to add and backfill the `email` column.
3. Install and run:

```bash
cd server
yarn install
yarn dev
```

Production: `yarn build && yarn start`.

## Auth API (base path: `/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/forgot-password` | Request OTP; body: `{ "email": "..." }` |
| POST | `/auth/verify-reset-otp` | Verify OTP; body: `{ "email": "...", "otp": "..." }` |
| POST | `/auth/verify-reset-otp-and-set-password` | Set new password; body: `{ "email", "otp", "newPassword" }` |
| POST | `/auth/change-password` | Change password (Bearer token); body: `{ "currentPassword", "newPassword" }` |
| POST | `/auth/delete-user` | Delete account (Bearer token) |

OTP is 6 digits and expires in 15 minutes. Configure SMTP in `.env` to send OTP emails.

**Mobile app:** In the project root `.env`, set `EXPO_PUBLIC_API_URL` to your server URL (e.g. `http://localhost:3001` for simulator, or `http://YOUR_IP:3001` for a physical device).
