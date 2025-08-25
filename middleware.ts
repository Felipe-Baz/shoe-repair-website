import { NextRequest, NextResponse } from 'next/server';

// Caminhos que não precisam de autenticação
const PUBLIC_PATHS = ['/', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  // Verificação simples do token fake
  if (token !== 'fake-jwt-token') {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
};
