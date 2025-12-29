'use client'

import { useState, useEffect } from 'react'

interface VoiceMessage {
  url: string
  pathname: string
  uploadedAt: string
  size: number
  title?: string
  metadataPath?: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    // Use a separate admin password
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'sesleradmin2024') {
      setIsAuthenticated(true)
      setAuthError('')
      fetchMessages()
    } else {
      setAuthError('Incorrect password')
    }
  }

  const fetchMessages = async () => {
    setLoading(true)
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

  const deleteMessage = async (message: VoiceMessage) => {
    if (!confirm('Delete this message permanently?')) return
    
    setDeleting(message.url)
    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          audioUrl: message.url,
          metadataPath: message.pathname 
        }),
      })
      
      if (res.ok) {
        setMessages(messages.filter(m => m.url !== message.url))
      } else {
        alert('Failed to delete')
      }
    } catch (error) {
      alert('Error deleting message')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 warm-glow border border-warm-200/50">
            <h1 className="font-display text-3xl text-burgundy-700 text-center mb-2">
              Admin
            </h1>
            <p className="font-serif text-burgundy-400 text-center italic mb-8">
              Manage messages
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white/80 font-serif text-burgundy-700 placeholder-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-300 text-center"
                placeholder="Admin password"
              />

              {authError && (
                <p className="font-serif text-sm text-red-500 text-center">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-6 bg-burgundy-500 hover:bg-burgundy-600 text-white font-serif rounded-xl transition-colors"
              >
                Enter
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="font-display text-3xl text-burgundy-700 mb-2">Admin</h1>
          <p className="font-serif text-burgundy-400">{messages.length} messages</p>
        </header>

        {loading ? (
          <p className="text-center font-serif text-burgundy-400">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-center font-serif text-burgundy-400">No messages</p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.url}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-warm-200/50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-grow min-w-0">
                    <p className="font-serif text-burgundy-700 truncate">
                      {message.title || 'Untitled'}
                    </p>
                    <p className="font-serif text-sm text-burgundy-400">
                      {formatDate(message.uploadedAt)} • {formatSize(message.size)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <audio src={message.url} controls className="h-8 w-32" />
                    <button
                      onClick={() => deleteMessage(message)}
                      disabled={deleting === message.url}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-serif text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting === message.url ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <a href="/" className="font-serif text-burgundy-400 hover:text-burgundy-600">
            Back to home
          </a>
        </div>
      </div>
    </div>
  )
}
