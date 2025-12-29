'use client'

import { useState, useRef, FormEvent } from 'react'

export default function UploadPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAuth = (e: FormEvent) => {
    e.preventDefault()
    // Check password against environment variable (will be validated server-side for real auth)
    // For now, we'll do a simple client-side check that matches the env var
    if (password === process.env.NEXT_PUBLIC_UPLOAD_PASSWORD || password === 'sesler2024') {
      setIsAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Incorrect password')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Accept audio files
      if (selectedFile.type.startsWith('audio/') || 
          selectedFile.name.endsWith('.m4a') || 
          selectedFile.name.endsWith('.mp3') ||
          selectedFile.name.endsWith('.wav')) {
        setFile(selectedFile)
        setUploadStatus('idle')
        
        // Auto-generate title from filename if not set
        if (!title) {
          const baseName = selectedFile.name.replace(/\.[^/.]+$/, '')
          setTitle(baseName)
        }
      } else {
        setStatusMessage('Please select an audio file')
        setUploadStatus('error')
      }
    }
  }

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setUploadStatus('idle')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title || file.name)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setUploadStatus('success')
        setStatusMessage('Voice message uploaded successfully! Email notification sent.')
        setFile(null)
        setTitle('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setUploadStatus('error')
        setStatusMessage(data.error || 'Upload failed')
      }
    } catch (error) {
      setUploadStatus('error')
      setStatusMessage('Network error. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 warm-glow border border-warm-200/50">
            <h1 className="font-display text-3xl text-burgundy-700 text-center mb-2">
              Sesler
            </h1>
            <p className="font-serif text-burgundy-400 text-center italic mb-8">
              Private upload portal
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label htmlFor="password" className="block font-serif text-sm text-burgundy-600 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white/80 font-serif text-burgundy-700 placeholder-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-transparent transition-all"
                  placeholder="Enter password"
                />
              </div>

              {authError && (
                <p className="font-serif text-sm text-red-500">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-6 bg-burgundy-500 hover:bg-burgundy-600 text-white font-serif rounded-xl transition-colors duration-200"
              >
                Enter
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Upload interface
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="font-display text-4xl text-burgundy-700 mb-2">
            Upload
          </h1>
          <p className="font-serif text-burgundy-400 italic">
            Share your voice
          </p>
        </header>

        {/* Upload Form */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 warm-glow border border-warm-200/50">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block font-serif text-sm text-burgundy-600 mb-2">
                Title (optional)
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white/80 font-serif text-burgundy-700 placeholder-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-transparent transition-all"
                placeholder="Give this message a title..."
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block font-serif text-sm text-burgundy-600 mb-2">
                Voice Recording
              </label>
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-burgundy-400 hover:bg-warm-50/50 ${
                  file ? 'border-burgundy-400 bg-warm-50/50' : 'border-warm-300'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.m4a,.mp3,.wav"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {file ? (
                  <div>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-burgundy-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-burgundy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <p className="font-serif text-burgundy-700">{file.name}</p>
                    <p className="font-serif text-sm text-burgundy-400 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-warm-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-burgundy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="font-serif text-burgundy-500">
                      Click to select an audio file
                    </p>
                    <p className="font-serif text-sm text-burgundy-300 mt-1">
                      M4A, MP3, WAV supported
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Messages */}
            {uploadStatus !== 'idle' && (
              <div className={`p-4 rounded-xl font-serif text-sm ${
                uploadStatus === 'success' 
                  ? 'bg-sage-100 text-sage-600 border border-sage-200' 
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {statusMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || uploading}
              className={`w-full py-4 px-6 font-serif text-lg rounded-xl transition-all duration-200 ${
                !file || uploading
                  ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                  : 'bg-burgundy-500 hover:bg-burgundy-600 text-white'
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload & Send Notification'
              )}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-center font-serif text-sm text-burgundy-300 italic">
          Voice recordings from your iPhone will be automatically uploaded and a notification email will be sent.
        </p>
      </div>
    </div>
  )
}
