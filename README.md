# Sesler - Private Voice Message Portal

A private voice message sharing portal for staying connected across time zones.

## Features

- Upload voice recordings from iPhone or any device
- Automatic email notifications when new messages are uploaded
- Beautiful, warm listener interface
- Password-protected upload page
- Hidden URL for privacy
- Supports M4A, MP3, WAV audio formats

## Architecture

```
/sesler          - Listener page (for her)
/upload          - Upload page (for you, password protected)
/api/upload      - Upload endpoint (handles file storage + email)
/api/messages    - Lists all messages
```

## Setup Instructions

### 1. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel
```

When prompted:
- Link to existing project or create new
- Select your ZKE Solutions team
- Project name: `sesler` (or similar)

### 2. Add Vercel Blob Storage

1. Go to Vercel Dashboard > Your Project > Storage
2. Click "Create Database" > "Blob"
3. Name it (e.g., "sesler-storage")
4. Connect to your project
5. The `BLOB_READ_WRITE_TOKEN` will be automatically added

### 3. Set Up Resend for Email

1. Go to [resend.com](https://resend.com) and create account
2. Add your domain (zke-solutions.com) and verify DNS
3. Create an API key
4. Add to Vercel Environment Variables:
   - `RESEND_API_KEY` = your API key
   - `SENDER_EMAIL` = `Sesler <noreply@zke-solutions.com>`
   - `RECIPIENT_EMAIL` = her email address

### 4. Configure Environment Variables

In Vercel Dashboard > Project > Settings > Environment Variables, add:

| Variable | Value | Description |
|----------|-------|-------------|
| `RESEND_API_KEY` | `re_xxxxx` | From Resend dashboard |
| `SENDER_EMAIL` | `Sesler <noreply@zke-solutions.com>` | From address |
| `RECIPIENT_EMAIL` | `her@email.com` | Where to send notifications |
| `NEXT_PUBLIC_SITE_URL` | `https://zke-solutions.com` | Your domain |
| `NEXT_PUBLIC_UPLOAD_PASSWORD` | `your-secret-password` | Upload page password |

### 5. Connect Domain

If deploying to a subdomain or path:

1. In Vercel Dashboard > Project > Settings > Domains
2. Add `zke-solutions.com` or a subdomain like `sesler.zke-solutions.com`

Or configure as a path at your existing domain using Vercel redirects.

### 6. Redeploy

After setting environment variables:
```bash
vercel --prod
```

## Usage

### Uploading (You)

1. Go to `https://your-domain.com/upload`
2. Enter the password
3. Select your iPhone voice recording (.m4a file)
4. Add an optional title
5. Click "Upload & Send Notification"

### Listening (Her)

1. She receives an email notification
2. Clicks the link to go to `/sesler`
3. Listens to the voice messages

## Privacy

- `/sesler` page is not linked from anywhere (hidden URL)
- Google won't index it (`noindex, nofollow` meta tags)
- Upload page is password protected
- Share the URL only with her

## Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

## Tech Stack

- Next.js 14 (App Router)
- Vercel Blob Storage
- Resend Email
- Tailwind CSS
- TypeScript

---

*DC & Izmir, 2024*
