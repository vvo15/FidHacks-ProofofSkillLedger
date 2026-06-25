import type { Metadata } from 'next'
import { Young_Serif, Space_Mono, Space_Grotesk } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const youngSerif = Young_Serif({
  weight: '400',
  variable: '--font-display',
  subsets: ['latin'],
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  variable: '--font-mono',
  subsets: ['latin'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'storybook',
  description: 'Your GitHub story, visualised.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${youngSerif.variable} ${spaceMono.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
