import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

interface VoiceMessage {
  url: string
  pathname: string
  title?: string
  uploadedAt: string
  size: number
}

export async function GET() {
  try {
    // List all metadata files
    const { blobs } = await list({
      prefix: 'metadata/',
    })

    // Fetch and parse each metadata file
    const messages: VoiceMessage[] = []
    
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url)
        if (response.ok) {
          const metadata = await response.json()
          messages.push(metadata)
        }
      } catch (e) {
        console.error('Failed to fetch metadata:', blob.url, e)
      }
    }

    // Sort by upload date, newest first
    messages.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )

    return NextResponse.json({ messages })
    
  } catch (error) {
    console.error('Failed to list messages:', error)
    
    // If blob storage is not configured, return empty
    return NextResponse.json({ messages: [] })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
