'use client'

import { useState } from 'next/navigation'

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

          <p className="font-serif text-burgundy-500 mb-8 max-w-md mx-auto">
            A private space for two old friends<br />
            separated by 5,000 miles and 7 hours,<br />
            but connected by memories and voices.
          </p>

          <button
            onClick={() => setEntered(true)}
            className="px-8 py-4 bg-burgundy-500 hover:bg-burgundy-600 text-white font-serif text-lg rounded-xl transition-all duration-300 hover:shadow-lg"
          >
            Enter
          </button>

          <p className="font-serif text-sm text-burgundy-300 mt-12 italic">
            DC & Izmir, {new Date().getFullYear()}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
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

        {/* Two Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          
          {/* Ziya's Card */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 warm-glow border border-warm-200/50 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-burgundy-400 to-burgundy-600 flex items-center justify-center text-white font-display text-2xl">
              Z
            </div>
            <h2 className="font-display text-2xl text-burgundy-700 mb-1">Ziya</h2>
            <p className="font-serif text-burgundy-400 italic mb-4">Washington, DC</p>
            
            <a 
              href="https://www.instagram.com/qorqut/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-burgundy-500 hover:text-burgundy-700 font-serif text-sm mb-6 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @qorqut
            </a>

            <div className="space-y-3">
              <a 
                href="/upload" 
                className="block w-full py-3 px-6 bg-burgundy-500 hover:bg-burgundy-600 text-white font-serif rounded-xl transition-colors"
              >
                Upload Voice Message
              </a>
            </div>
          </div>

          {/* Gulin's Card */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 warm-glow border border-warm-200/50 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center text-white font-display text-2xl">
              G
            </div>
            <h2 className="font-display text-2xl text-burgundy-700 mb-1">Gulin</h2>
            <p className="font-serif text-burgundy-400 italic mb-4">Izmir, Turkey</p>
            
            <a 
              href="https://www.instagram.com/gulin_donusumkocu/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-burgundy-500 hover:text-burgundy-700 font-serif text-sm mb-6 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @gulin_donusumkocu
            </a>

            <div className="space-y-3">
              <a 
                href="/upload" 
                className="block w-full py-3 px-6 bg-warm-500 hover:bg-warm-400 text-white font-serif rounded-xl transition-colors"
              >
                Upload Voice Message
              </a>
            </div>
          </div>
        </div>

        {/* Listen Section */}
        <div className="text-center mb-16">
          <a 
            href="/sesler"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-warm-200/50 warm-glow hover:bg-white/80 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-burgundy-100 flex items-center justify-center group-hover:bg-burgundy-200 transition-colors">
              <svg className="w-6 h-6 text-burgundy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5z" />
              </svg>
            </div>
            <div className="text-left">
              <span className="block font-display text-xl text-burgundy-700">Listen to Messages</span>
              <span className="block font-serif text-sm text-burgundy-400">Hear all shared voice messages</span>
            </div>
          </a>
        </div>

        {/* Footer */}
        <footer className="text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-24 h-1 text-warm-400" viewBox="0 0 100 4">
              <path d="M0 2 Q25 0 50 2 Q75 4 100 2" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </div>
          <p className="font-serif text-sm text-burgundy-300">
            College friends since 1987
          </p>
          <p className="font-serif text-sm text-burgundy-300 italic mt-1">
            5,000 miles apart, but never far
          </p>
        </footer>
      </div>
    </div>
  )
}
