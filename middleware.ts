import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Публичные роуты (доступны без авторизации)
const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/onboarding',
];

// Роуты которые требуют авторизации
const PROTECTED_ROUTES = [
  '/',
  '/dashboard',
  '/profile',
  '/favorites',
  '/appointments',
  '/book',
  '/notifications',
];

// Роуты только для мастеров
const MASTER_ROUTES = [
  '/dashboard',
  '/dashboard/appointments',
  '/dashboard/services',
  '/dashboard/schedule',
  '/dashboard/notifications',
  '/dashboard/settings',
  '/dashboard/statistics',
];

// Роуты только для клиентов
const CLIENT_ROUTES = [
  '/',
  '/profile',
  '/favorites',
  '/appointments',
  '/book',
  '/notifications',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Получаем токены из cookies
  const authTokens = request.cookies.get('auth-tokens');
  const isAuthenticated = !!authTokens;
  
  let userRole: 'MASTER' | 'CLIENT' | null = null;
  
  if (authTokens?.value) {
    try {
      const parsed = JSON.parse(authTokens.value);
      userRole = parsed.state?.user?.role;
    } catch {
      // Игнорируем ошибки парсинга
    }
  }

  // Проверяем публичные роуты
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith('/onboarding')
  );

  // Проверяем защищенные роуты
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  // Проверяем роуты мастеров
  const isMasterRoute = MASTER_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  // Проверяем роуты клиентов
  const isClientRoute = CLIENT_ROUTES.some(route => 
    pathname.startsWith(route) && !pathname.startsWith('/dashboard')
  );

  // Редирект с публичных роутов если авторизован
  if (isPublicRoute && isAuthenticated && userRole) {
    if (userRole === 'CLIENT') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (userRole === 'MASTER') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Редирект на sign-in если не авторизован и пытаемся зайти на главную (клиентский дашборд)
  if (pathname === '/' && !isAuthenticated) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Редирект на sign-in если не авторизован и пытаемся зайти на защищенный роут
  if (isProtectedRoute && !isAuthenticated && pathname !== '/') {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Проверка доступа для мастеров
  if (isMasterRoute && isAuthenticated && userRole !== 'MASTER') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Проверка доступа для клиентов
  if (isClientRoute && isAuthenticated && userRole !== 'CLIENT') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
