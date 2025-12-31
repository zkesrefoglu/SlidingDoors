'use client'

import { useState, useRef, useEffect } from 'react'

export default function UploadPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  
  const [sender, setSender] = useState<'dc' | 'izmir' | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [audioUrl])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_UPLOAD_PASSWORD || password === 'sesler2024') {
      setIsAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Incorrect password')
    }
  }

  // Compress audio using Web Audio API
  const compressAudio = async (blob: Blob): Promise<Blob> => {
    setCompressing(true)
    try {
      const audioContext = new AudioContext({ sampleRate: 8000 }) // Phone quality
      audioContextRef.current = audioContext
      
      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      // Convert to mono and downsample heavily
      const offlineContext = new OfflineAudioContext(
        1, // mono
        audioBuffer.duration * 8000,
        8000 // phone quality - very small files
      )
      
      const source = offlineContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(offlineContext.destination)
      source.start()
      
      const renderedBuffer = await offlineContext.startRendering()
      
      // Convert to WAV
      const wavBlob = audioBufferToWav(renderedBuffer)
      
      return wavBlob
    } catch (error) {
      console.error('Compression failed, using original:', error)
      return blob
    } finally {
      setCompressing(false)
    }
  }

  // Convert AudioBuffer to WAV blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16
    
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    
    const data = buffer.getChannelData(0)
    const samples = data.length
    const dataSize = samples * blockAlign
    const bufferSize = 44 + dataSize
    
    const arrayBuffer = new ArrayBuffer(bufferSize)
    const view = new DataView(arrayBuffer)
    
    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + dataSize, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(36, 'data')
    view.setUint32(40, dataSize, true)
    
    // Write audio data
    let offset = 44
    for (let i = 0; i < samples; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/mp4' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)
      setUploadStatus('idle')
      
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
    } catch (err) {
      setStatusMessage('Could not access microphone')
      setUploadStatus('error')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const discardRecording = () => {
    setAudioBlob(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setDuration(0)
    setUploadStatus('idle')
  }

  const uploadRecording = async () => {
    if (!audioBlob || !sender) return

    setUploading(true)
    setUploadStatus('idle')

    try {
      // Always compress audio
      setStatusMessage('Compressing...')
      const compressedBlob = await compressAudio(audioBlob)
      
      // Check if still too large (Vercel limit is 4.5MB)
      if (compressedBlob.size > 4 * 1024 * 1024) {
        setUploadStatus('error')
        setStatusMessage(`File too large (${(compressedBlob.size / (1024 * 1024)).toFixed(1)}MB). Please record under 5 minutes.`)
        setUploading(false)
        return
      }

      const formData = new FormData()
      const filename = `voice-${new Date().toISOString()}.wav`
      formData.append('file', compressedBlob, filename)
      formData.append('sender', sender)
      formData.append('title', new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }))

      setStatusMessage('Sending...')
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setUploadStatus('success')
        setStatusMessage('Sent!')
        setAudioBlob(null)
        if (audioUrl) URL.revokeObjectURL(audioUrl)
        setAudioUrl(null)
        setDuration(0)
      } else {
        const data = await res.json()
        setUploadStatus('error')
        setStatusMessage(data.error || 'Failed to send')
      }
    } catch (error) {
      setUploadStatus('error')
      setStatusMessage('Network error')
    } finally {
      setUploading(false)
      setCompressing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 warm-glow border border-warm-200/50">
            <h1 className="font-display text-3xl text-burgundy-700 text-center mb-8">
              Sesler
            </h1>

            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white/80 font-serif text-burgundy-700 placeholder-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-300 text-center"
                placeholder="Password"
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

  // Sender selection screen
  if (!sender) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-3xl text-burgundy-700 mb-2">
            Sesler
          </h1>
          <p className="font-serif text-burgundy-400 italic mb-10">
            Who is this?
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setSender('dc')}
              className="w-full py-4 px-6 bg-burgundy-500 hover:bg-burgundy-600 text-white font-serif text-lg rounded-xl transition-all duration-300"
            >
              Ziya (DC)
            </button>
            <button
              onClick={() => setSender('izmir')}
              className="w-full py-4 px-6 bg-warm-500 hover:bg-warm-400 text-white font-serif text-lg rounded-xl transition-all duration-300"
            >
              Gulin (Izmir)
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Recording interface
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm text-center">
        
        <h1 className="font-display text-3xl text-burgundy-700 mb-2">
          Sesler
        </h1>
        <p className="font-serif text-burgundy-400 mb-8">
          From <span className="font-semibold">{sender === 'dc' ? 'DC' : 'Izmir'}</span>
          <button 
            onClick={() => setSender(null)} 
            className="ml-2 text-burgundy-300 hover:text-burgundy-500 text-sm"
          >
            (change)
          </button>
        </p>

        {/* Status message */}
        {uploadStatus !== 'idle' && (
          <div className={`mb-8 p-4 rounded-xl font-serif ${
            uploadStatus === 'success' 
              ? 'bg-sage-100 text-sage-600' 
              : 'bg-red-50 text-red-600'
          }`}>
            {statusMessage}
          </div>
        )}

        {/* Compressing indicator */}
        {compressing && (
          <div className="mb-8 p-4 rounded-xl font-serif bg-warm-100 text-burgundy-600">
            Compressing audio...
          </div>
        )}

        {/* Recording button */}
        {!audioBlob && (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-burgundy-500 hover:bg-burgundy-600'
            }`}
          >
            {isRecording ? (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            )}
          </button>
        )}

        {/* Timer */}
        {(isRecording || audioBlob) && (
          <p className={`font-serif text-2xl mt-6 ${duration > 240 ? 'text-red-500' : 'text-burgundy-600'}`}>
            {formatTime(duration)}
          </p>
        )}

        {/* Warning for long recordings */}
        {isRecording && duration > 240 && (
          <p className="font-serif text-sm text-red-500 mt-2">
            Recording is getting long - keep under 5 min for best results
          </p>
        )}

        {/* File size indicator */}
        {audioBlob && (
          <p className="font-serif text-sm text-burgundy-400 mt-2">
            {formatSize(audioBlob.size)} • will be compressed
          </p>
        )}

        {/* Instructions */}
        {!audioBlob && !isRecording && (
          <p className="font-serif text-burgundy-400 mt-6">
            Tap to record
          </p>
        )}

        {isRecording && (
          <p className="font-serif text-burgundy-400 mt-4">
            Tap to stop
          </p>
        )}

        {/* Playback and actions */}
        {audioBlob && audioUrl && (
          <div className="mt-8 space-y-6">
            <audio src={audioUrl} controls className="w-full" />
            
            <div className="flex gap-4">
              <button
                onClick={discardRecording}
                className="flex-1 py-3 px-4 bg-warm-200 hover:bg-warm-300 text-burgundy-600 font-serif rounded-xl transition-colors"
              >
                Discard
              </button>
              <button
                onClick={uploadRecording}
                disabled={uploading || compressing}
                className="flex-1 py-3 px-4 bg-burgundy-500 hover:bg-burgundy-600 text-white font-serif rounded-xl transition-colors disabled:opacity-50"
              >
                {uploading ? (compressing ? 'Compressing...' : 'Sending...') : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Link to listen */}
        <a 
          href="/sesler" 
          className="inline-block mt-12 font-serif text-sm text-burgundy-400 hover:text-burgundy-600 transition-colors"
        >
          Listen to messages
        </a>
      </div>
    </div>
  )
}
