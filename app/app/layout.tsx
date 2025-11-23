import type { Metadata } from 'next'
import { Inter, Noto_Serif } from 'next/font/google'
import './globals.css'
import { WhiteboardProvider } from './context/WhiteboardContext'
import { EditingProvider } from './context/EditingContext'
import { DarkModeProvider } from './context/DarkModeContext'
import { AuthProvider } from './components/auth/AuthProvider'
import { ConditionalLayout } from './components/ConditionalLayout'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const notoSerif = Noto_Serif({
  variable: '--font-noto-serif',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Socratic.ai',
  description: 'Organize, draft, and refine your scholarship essays',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSerif.variable} antialiased`}>
        <AuthProvider>
          <DarkModeProvider>
            <EditingProvider>
              <WhiteboardProvider>
                <ConditionalLayout>{children}</ConditionalLayout>
              </WhiteboardProvider>
            </EditingProvider>
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
