'use client'

import { useState } from 'react'

export default function WelcomePage() {
  const [entered, setEntered] = useState(false)

  if (!entered) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <h1 className="font-display text-5xl md:text-6xl text-burgundy-700 mb-4">
            Sesler
          </h1>
          <p className="font-serif text-xl text-burgundy-400 italic mb-12">
            Voices across the distance
          </p>
          
          <div className="flex justify-center mb-12">
            <svg className="w-32 h-1 text-warm-400" viewBox="0 0 100 4">
              <path d="M0 2 Q25 0 50 2 Q75 4 100 2" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </div>

          <button
            onClick={() => setEntered(true)}
            className="px-8 py-4 bg-burgundy-500 hover:bg-burgundy-600 text-white font-serif text-lg rounded-xl transition-all duration-300 hover:shadow-lg"
          >
            Enter
          </button>

          <p className="font-serif text-sm text-burgundy-300 mt-16 italic">
            DC & Izmir
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center">
        
        <h1 className="font-display text-4xl text-burgundy-700 mb-2">
          Sesler
        </h1>
        <p className="font-serif text-burgundy-400 italic mb-12">
          Ziya & Gulin
        </p>

        <div className="space-y-4">
          <a 
            href="/upload"
            className="block w-full py-4 px-6 bg-burgundy-500 hover:bg-burgundy-600 text-white font-serif text-lg rounded-xl transition-all duration-300"
          >
            Record & Send
          </a>
          
          <a 
            href="/sesler"
            className="block w-full py-4 px-6 bg-white/60 hover:bg-white/80 border border-warm-200 text-burgundy-700 font-serif text-lg rounded-xl transition-all duration-300"
          >
            Listen
          </a>
        </div>

        <p className="font-serif text-xs text-burgundy-200 mt-16">
          Friends since 1987
        </p>
      </div>
    </div>
  )
}
