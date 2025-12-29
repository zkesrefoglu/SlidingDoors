'use client'

import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

interface VoiceMessage {
  url: string
  pathname: string
  uploadedAt: string
  size: number
  title?: string
}

export default function SeslerPage() {
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({})

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    // Convert to Turkey time for display
    const turkeyTime = toZonedTime(date, 'Europe/Istanbul')
    return format(turkeyTime, "d MMMM yyyy 'at' HH:mm")
  }

  const formatDuration = (audio: HTMLAudioElement | null) => {
    if (!audio || !audio.duration || isNaN(audio.duration)) return ''
    const mins = Math.floor(audio.duration / 60)
    const secs = Math.floor(audio.duration % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlay = (url: string) => {
    // Pause any currently playing audio
    if (currentPlaying && currentPlaying !== url) {
      const currentAudio = audioRefs.current[currentPlaying]
      if (currentAudio) {
        currentAudio.pause()
      }
    }
    setCurrentPlaying(url)
  }

  const handleEnded = () => {
    setCurrentPlaying(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-burgundy-300 border-t-burgundy-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-burgundy-500 font-serif italic">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl text-burgundy-700 mb-3">
            Sesler
          </h1>
          <p className="font-serif text-lg text-burgundy-400 italic">
            Voices across the distance
          </p>
          <div className="mt-6 flex justify-center">
            <svg className="w-24 h-1 text-warm-400" viewBox="0 0 100 4">
              <path d="M0 2 Q25 0 50 2 Q75 4 100 2" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </div>
        </header>

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-warm-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-burgundy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="font-serif text-xl text-burgundy-500 italic">
              No messages yet...
            </p>
            <p className="font-serif text-burgundy-300 mt-2">
              New voices will appear here soon
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <article 
                key={message.url}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 warm-glow border border-warm-200/50 transition-all duration-300 hover:bg-white/80"
              >
                <div className="flex items-start gap-4">
                  {/* Play indicator */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    currentPlaying === message.url 
                      ? 'bg-burgundy-500 text-white' 
                      : 'bg-warm-100 text-burgundy-500'
                  }`}>
                    {currentPlaying === message.url ? (
                      <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <span className="font-display text-lg">{messages.length - index}</span>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    {/* Title/Date */}
                    <h2 className="font-display text-lg text-burgundy-700 mb-1">
                      {message.title || `Message ${messages.length - index}`}
                    </h2>
                    <p className="font-serif text-sm text-burgundy-400 mb-4">
                      {formatDate(message.uploadedAt)}
                    </p>

                    {/* Audio Player */}
                    <audio
                      ref={el => { audioRefs.current[message.url] = el }}
                      src={message.url}
                      controls
                      className="w-full h-10 rounded-lg"
                      onPlay={() => handlePlay(message.url)}
                      onEnded={handleEnded}
                      onPause={() => currentPlaying === message.url && setCurrentPlaying(null)}
                      preload="metadata"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-24 h-1 text-warm-400" viewBox="0 0 100 4">
              <path d="M0 2 Q25 0 50 2 Q75 4 100 2" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </div>
          <p className="font-serif text-sm text-burgundy-300 italic">
            DC & Izmir, {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  )
}
