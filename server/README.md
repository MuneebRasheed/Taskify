# Taskify Server

Node.js backend for Taskify with auth and forgot-password flow.

## Setup

1. Copy `.env.example` to `.env` and fill in your values.
2. Create required goals tables in Supabase: open **Dashboard → SQL Editor** and run `server/supabase-migrations/004_goals_schema.sql`. This creates `public.goals`, `public.goal_items`, and `public.item_completions`.
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
