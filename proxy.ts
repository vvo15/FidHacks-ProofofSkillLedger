import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export const proxy = auth((req) => {
  const isAuthed = !!req.auth
  const { pathname } = req.nextUrl

  const protectedPaths = ['/graph', '/api/github']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !isAuthed) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: ['/graph/:path*', '/api/github/:path*'],
}
