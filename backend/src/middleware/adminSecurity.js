import rateLimit from 'express-rate-limit';

// Strict rate limiting for admin login attempts
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 minutes
  message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  // Store failed attempts
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Very strict rate limiting for admin routes
export const adminRoutesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Max 50 requests per 15 minutes for admin operations
  message: 'Too many admin requests from this IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// IP Allowlist middleware (optional - configure via environment)
export const ipAllowlist = (req, res, next) => {
  // Get admin IP allowlist from environment variable (comma-separated)
  const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];

  // If no IPs configured, allow all (disabled)
  if (allowedIPs.length === 0 || allowedIPs[0] === '') {
    return next();
  }

  // Get client IP
  const clientIP = req.ip || req.connection.remoteAddress;
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIP = forwardedFor ? forwardedFor.split(',')[0].trim() : clientIP;

  // Check if IP is allowed
  if (allowedIPs.includes(realIP) || allowedIPs.includes('*')) {
    return next();
  }

  // Log unauthorized access attempt
  console.warn(`[SECURITY] Unauthorized admin access attempt from IP: ${realIP}`);

  return res.status(403).json({
    success: false,
    message: 'Access denied. Your IP address is not authorized to access this resource.'
  });
};

// Admin access logger
export const logAdminAccess = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const clientIP = req.ip || req.connection.remoteAddress;
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIP = forwardedFor ? forwardedFor.split(',')[0].trim() : clientIP;
  const userAgent = req.headers['user-agent'];
  const method = req.method;
  const path = req.originalUrl;
  const userId = req.user?.id || 'anonymous';
  const userEmail = req.user?.email || 'N/A';

  console.log(`[ADMIN ACCESS] ${timestamp} | IP: ${realIP} | User: ${userEmail} (${userId}) | ${method} ${path} | UA: ${userAgent}`);

  next();
};

// Security headers specifically for admin routes
export const adminSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy for admin pages
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );

  next();
};
