'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { useDarkMode } from '@/app/context/DarkModeContext'

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signInWithGoogle, signInWithGitHub, signInWithEmail, signUpWithEmail } = useAuth()

  let isDarkMode = false
  try {
    const darkModeContext = useDarkMode()
    isDarkMode = darkModeContext.isDarkMode
  } catch {
    isDarkMode = false
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setError(null)
    setLoading(true)

    try {
      if (provider === 'google') {
        await signInWithGoogle()
      } else {
        await signInWithGitHub()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
      setLoading(false)
    }
  }

  return (
    <div className={`w-full max-w-md p-8 rounded-2xl backdrop-blur-lg ${
      isDarkMode
        ? 'bg-gray-800/50 border border-gray-700'
        : 'bg-white/50 border border-gray-200'
    } shadow-2xl`}>
      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            mode === 'login'
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setMode('signup')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            mode === 'signup'
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Social Auth Buttons - Commented out for now */}
      {/* <div className="space-y-3 mb-6">
        <button
          onClick={() => handleSocialAuth('google')}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            isDarkMode
              ? 'bg-white text-gray-900 hover:bg-gray-100'
              : 'bg-white text-gray-900 hover:bg-gray-50'
          } border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <button
          onClick={() => handleSocialAuth('github')}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            isDarkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>
      </div> */}

      {/* Divider - Commented out for now */}
      {/* <div className="relative mb-6">
        <div className={`absolute inset-0 flex items-center`}>
          <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className={`px-2 ${isDarkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-white/50 text-gray-500'}`}>
            Or continue with email
          </span>
        </div>
      </div> */}

      {/* Email Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className={`w-full py-3 px-4 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className={`w-full py-3 px-4 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-100 border border-red-400 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>
    </div>
  )
}
