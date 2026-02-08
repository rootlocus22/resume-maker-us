import { NextResponse } from 'next/server';

/**
 * Next.js Middleware for API Security
 * This runs on the Edge runtime and protects all API routes
 * Blocks direct access to API routes (browser, Postman, curl, etc.)
 */
export function middleware(request) {
  try {
    const { pathname } = request.nextUrl;

    // Only apply to API routes - SEO crawlers won't be affected
    // Middleware only blocks /api/* routes, not pages, so SEO is safe
    if (!pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // Allow known SEO crawlers and bots to pass through (though they shouldn't hit APIs)
    // This is a safety measure in case any legitimate bot needs API access
    const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
    const isKnownBot = /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver/i.test(userAgent);

    // Note: Bots typically don't hit API routes, but if they do, we allow them
    // (though they still need proper encryption for payment APIs)
    if (isKnownBot && !pathname.includes('/create-order') && !pathname.includes('/payment')) {
      return NextResponse.next();
    }

    // Security headers for all API responses
    const response = NextResponse.next();

    // Remove server information
    response.headers.delete('x-powered-by');
    response.headers.delete('server');

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Handle preflight requests (allow OPTIONS for CORS)
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('origin');
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || '';

      if (origin && ((baseUrl && origin.includes(baseUrl)) || allowedOrigins.some(allowed => allowed && origin.includes(allowed)))) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Internal-Request, X-Requested-With');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      return new NextResponse(null, {
        status: 200,
        headers: response.headers
      });
    }

    // ============================================
    // BLOCK DIRECT ACCESS TO SENSITIVE API ROUTES
    // ============================================

    // Get request headers
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const internalRequest = request.headers.get('x-internal-request');
    const requestedWith = request.headers.get('x-requested-with');
    const contentType = request.headers.get('content-type') || '';

    // Get allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'localhost:3000';

    // Get current host to allow requests from the same domain even if baseUrl is misconfigured
    const host = request.headers.get('host');

    // Define trusted domains based on user requirement
    const trustedDomains = [
      'localhost',
      '127.0.0.1',
      'expertresume.us',
      'www.expertresume.us'
    ];

    // Check if request is from the application (not direct access)
    const isInternalRequest = internalRequest === 'true' || requestedWith === 'XMLHttpRequest';

    // Check if referer/origin matches allowed domains OR the current host OR trusted domains
    const isValidOrigin = origin && (
      (baseUrl && origin.includes(baseUrl)) ||
      (host && origin.includes(host)) ||
      trustedDomains.some(domain => origin.includes(domain)) ||
      allowedOrigins.some(allowed => allowed && origin.includes(allowed))
    );

    const isValidReferer = referer && (
      (baseUrl && referer.includes(baseUrl)) ||
      (host && referer.includes(host)) ||
      trustedDomains.some(domain => referer.includes(domain)) ||
      allowedOrigins.some(allowed => allowed && referer.includes(allowed))
    );

    // Check if it's a FormData request (multipart/form-data)
    // FormData requests are typically from the application and should be allowed
    const isFormDataRequest = contentType.includes('multipart/form-data');

    // Only block sensitive payment/admin routes strictly
    // Allow other APIs if they have FormData, internal headers, or valid origin/referer
    const sensitivePaymentRoutes = [
      '/api/create-order',
      '/api/create-resume-service-order',
      '/api/create-guest-order',
      '/api/hosted-resume/create-payment-order',
      '/api/admin/',
      '/api/payment-logs',
      '/api/download-analytics',
      '/api/team-data/',
    ];

    const isSensitivePaymentRoute = sensitivePaymentRoutes.some(route => pathname.startsWith(route));

    // For sensitive payment routes, require strict validation
    if (isSensitivePaymentRoute) {
      const isDirectAccess = !isInternalRequest && !isValidOrigin && !isValidReferer;

      if (isDirectAccess) {
        console.warn(`🚫 Blocked direct access to sensitive route ${pathname}`, {
          referer,
          origin,
          userAgent: userAgent.substring(0, 50),
          method: request.method,
        });

        return NextResponse.json(
          {
            error: 'Forbidden - Direct access to payment API routes is not allowed',
            message: 'This API endpoint can only be accessed from the application',
            code: 'DIRECT_ACCESS_BLOCKED'
          },
          {
            status: 403,
            headers: response.headers
          }
        );
      }
    } else {
      // For non-payment APIs, be more lenient
      // Allow if: FormData request OR internal header OR valid origin/referer
      const isDirectAccess = !isFormDataRequest && !isInternalRequest && !isValidOrigin && !isValidReferer;

      // Check if it's an internal fetch (node, undici, vercel-internal, etc.)
      const isInternalUserAgent =
        userAgent.includes('node') ||
        userAgent.includes('undici') ||
        userAgent.includes('vercel-internal') ||
        userAgent.includes('node-fetch');

      // For non-payment APIs, we allow direct access to facilitate testing and PDF generation
      // The previous blocking logic has been removed as per user request
      /*
      if (isDirectAccess && !isInternalUserAgent) {
        console.warn(`🚫 Blocked direct access to ${pathname}`, {
          referer,
          origin,
          userAgent: userAgent.substring(0, 50),
          method: request.method,
          contentType,
        });

        return NextResponse.json(
          {
            error: 'Forbidden - Direct access to API routes is not allowed',
            message: 'This API endpoint can only be accessed from the application',
            code: 'DIRECT_ACCESS_BLOCKED'
          },
          {
            status: 403,
            headers: response.headers
          }
        );
      }
      */
    }

    // ============================================
    // ADDITIONAL PROTECTION FOR SENSITIVE ROUTES
    // ============================================

    // Only apply strict auth check to payment routes (already checked above)
    if (isSensitivePaymentRoute) {
      // For sensitive payment routes, require additional authentication
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Also check for internal request header as fallback
        if (!isInternalRequest) {
          return NextResponse.json(
            {
              error: 'Unauthorized - Authentication required',
              code: 'AUTH_REQUIRED'
            },
            { status: 401, headers: response.headers }
          );
        }
      }
    }

    // Set CORS headers for valid requests
    if (isValidOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Internal-Request, X-Requested-With');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  } catch (error) {
    console.error('❌ Middleware Error:', error);

    // Return a structured error instead of crashing with MIDDLEWARE_INVOCATION_FAILED
    return new NextResponse(
      JSON.stringify({
        error: 'Middleware Error',
        message: error.message,
        code: 'MIDDLEWARE_CRASH'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
