import { NextRequest, NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'
import { Resend } from 'resend'

// Initialize Resend only when API key is available
const getResend = () => {
  if (process.env.RESEND_API_KEY) {
    return new Resend(process.env.RESEND_API_KEY)
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check file type
    if (!file.type.startsWith('audio/') && 
        !file.name.endsWith('.m4a') && 
        !file.name.endsWith('.mp3') &&
        !file.name.endsWith('.wav')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const extension = file.name.split('.').pop() || 'm4a'
    const filename = `voice-${timestamp}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type || 'audio/mp4',
    })

    // Store metadata (title and upload time) in a JSON blob
    const metadata = {
      url: blob.url,
      pathname: blob.pathname,
      title: title || `Message from ${new Date().toLocaleDateString()}`,
      uploadedAt: new Date().toISOString(),
      size: file.size,
    }

    // Store metadata in a separate blob
    const metadataFilename = `metadata/${timestamp}.json`
    await put(metadataFilename, JSON.stringify(metadata), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    })

    // Send email notification
    const resend = getResend()
    if (resend && process.env.RECIPIENT_EMAIL) {
      try {
        // Support multiple recipients (comma-separated)
        const recipients = process.env.RECIPIENT_EMAIL.split(',').map(e => e.trim())
        await resend.emails.send({
          from: process.env.SENDER_EMAIL || 'Sesler <noreply@zke-solutions.com>',
          to: recipients,
          subject: `New Voice Message: ${title || 'Untitled'}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Georgia, serif; background-color: #FDF8F3; padding: 40px 20px; }
                .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(139, 68, 68, 0.1); }
                h1 { color: #6B3333; font-size: 28px; margin-bottom: 8px; }
                .subtitle { color: #B86B6B; font-style: italic; margin-bottom: 32px; }
                .message-box { background: #F9EDE3; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
                .label { color: #8B4444; font-size: 14px; margin-bottom: 4px; }
                .value { color: #4A2323; font-size: 18px; }
                .button { display: inline-block; background: #8B4444; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 16px; }
                .footer { margin-top: 32px; text-align: center; color: #B86B6B; font-size: 14px; font-style: italic; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Sesler</h1>
                <p class="subtitle">A new voice awaits...</p>
                
                <div class="message-box">
                  <p class="label">Title</p>
                  <p class="value">${title || 'Untitled'}</p>
                </div>
                
                <p style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://zke-solutions.com'}/sesler" class="button">
                    Listen Now
                  </a>
                </p>
                
                <p class="footer">
                  DC & Izmir
                </p>
              </div>
            </body>
            </html>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Don't fail the upload if email fails
      }
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      message: 'Upload successful',
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
