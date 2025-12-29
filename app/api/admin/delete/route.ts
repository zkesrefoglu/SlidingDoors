import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const { audioUrl, metadataPath } = await request.json()

    if (!audioUrl) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    // Delete the audio file
    try {
      await del(audioUrl)
    } catch (e) {
      console.error('Failed to delete audio:', e)
    }

    // Delete the metadata file
    if (metadataPath) {
      try {
        // Construct metadata URL from audio path
        const timestamp = metadataPath.split('voice-')[1]?.split('.')[0]
        if (timestamp) {
          const metadataUrl = audioUrl.replace(/voice-.*$/, `metadata/${timestamp}.json`)
          await del(metadataUrl)
        }
      } catch (e) {
        console.error('Failed to delete metadata:', e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
