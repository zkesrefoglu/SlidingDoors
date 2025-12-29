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
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set())
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({})

  useEffect(() => {
    // Load read status from localStorage
    const stored = localStorage.getItem('sesler-read')
    if (stored) {
      setReadMessages(new Set(JSON.parse(stored)))
    }
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

  const markAsRead = (url: string) => {
    const newRead = new Set(readMessages)
    newRead.add(url)
    setReadMessages(newRead)
    localStorage.setItem('sesler-read', JSON.stringify([...newRead]))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const turkeyTime = toZonedTime(date, 'Europe/Istanbul')
    return format(turkeyTime, "d MMMM yyyy 'at' HH:mm")
  }

  const handlePlay = (url: string) => {
    if (currentPlaying && currentPlaying !== url) {
      const currentAudio = audioRefs.current[currentPlaying]
      if (currentAudio) {
        currentAudio.pause()
      }
    }
    setCurrentPlaying(url)
    markAsRead(url)
  }

  const handleEnded = () => {
    setCurrentPlaying(null)
  }

  const unreadCount = messages.filter(m => !readMessages.has(m.url)).length

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
        <header className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-burgundy-700 mb-3">
            Sesler
          </h1>
          <p className="font-serif text-lg text-burgundy-400 italic">
            {unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
          </p>
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
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isUnread = !readMessages.has(message.url)
              const isPlaying = currentPlaying === message.url
              
              return (
                <article 
                  key={message.url}
                  className={`rounded-2xl p-5 transition-all duration-300 ${
                    isUnread 
                      ? 'bg-burgundy-50 border-2 border-burgundy-200' 
                      : 'bg-white/60 border border-warm-200/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Unread indicator */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      isPlaying 
                        ? 'bg-burgundy-500 text-white' 
                        : isUnread
                          ? 'bg-burgundy-500 text-white'
                          : 'bg-warm-100 text-burgundy-400'
                    }`}>
                      {isPlaying ? (
                        <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : isUnread ? (
                        <span className="text-xs font-bold">NEW</span>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      {/* Title/Date */}
                      <h2 className={`font-display text-lg mb-1 ${isUnread ? 'text-burgundy-700 font-semibold' : 'text-burgundy-600'}`}>
                        {message.title || `Message ${messages.length - index}`}
                      </h2>
                      <p className="font-serif text-sm text-burgundy-400 mb-3">
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
              )
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <a 
            href="/upload" 
            className="inline-block px-6 py-3 bg-burgundy-500 hover:bg-burgundy-600 text-white font-serif rounded-xl transition-colors"
          >
            Record a message
          </a>
          <p className="font-serif text-sm text-burgundy-300 mt-6 italic">
            DC & Izmir
          </p>
        </footer>
      </div>
    </div>
  )
}
