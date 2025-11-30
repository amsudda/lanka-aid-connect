// In-memory store for failed login attempts
// In production, this should be moved to Redis or database
const loginAttempts = new Map();
const lockedAccounts = new Map();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

/**
 * Track failed login attempts
 */
export const trackFailedLogin = (identifier) => {
  const now = Date.now();
  const key = identifier.toLowerCase();

  // Get existing attempts
  const attempts = loginAttempts.get(key) || [];

  // Filter out old attempts (outside the window)
  const recentAttempts = attempts.filter(
    timestamp => now - timestamp < ATTEMPT_WINDOW
  );

  // Add new attempt
  recentAttempts.push(now);
  loginAttempts.set(key, recentAttempts);

  // Check if account should be locked
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    lockedAccounts.set(key, now + LOCKOUT_DURATION);
    console.warn(`[SECURITY] Account locked due to too many failed attempts: ${identifier}`);
    return {
      locked: true,
      attemptsRemaining: 0,
      lockoutEnd: new Date(now + LOCKOUT_DURATION)
    };
  }

  return {
    locked: false,
    attemptsRemaining: MAX_ATTEMPTS - recentAttempts.length,
    attempts: recentAttempts.length
  };
};

/**
 * Check if account is currently locked
 */
export const isAccountLocked = (identifier) => {
  const key = identifier.toLowerCase();
  const lockoutEnd = lockedAccounts.get(key);

  if (!lockoutEnd) {
    return { locked: false };
  }

  const now = Date.now();

  // Check if lockout has expired
  if (now >= lockoutEnd) {
    // Unlock account
    lockedAccounts.delete(key);
    loginAttempts.delete(key);
    return { locked: false };
  }

  // Still locked
  const remainingTime = Math.ceil((lockoutEnd - now) / 1000 / 60); // minutes
  return {
    locked: true,
    remainingMinutes: remainingTime,
    lockoutEnd: new Date(lockoutEnd)
  };
};

/**
 * Clear login attempts on successful login
 */
export const clearLoginAttempts = (identifier) => {
  const key = identifier.toLowerCase();
  loginAttempts.delete(key);
  lockedAccounts.delete(key);
};

/**
 * Middleware to check account lockout before login
 */
export const checkAccountLockout = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next();
  }

  const lockStatus = isAccountLocked(email);

  if (lockStatus.locked) {
    console.warn(`[SECURITY] Login attempt on locked account: ${email} from IP: ${req.ip}`);
    return res.status(423).json({
      success: false,
      message: `Account temporarily locked due to too many failed login attempts. Please try again in ${lockStatus.remainingMinutes} minutes.`,
      lockedUntil: lockStatus.lockoutEnd
    });
  }

  next();
};

/**
 * Get current status for an identifier (for debugging/admin)
 */
export const getLoginAttemptStatus = (identifier) => {
  const key = identifier.toLowerCase();
  const attempts = loginAttempts.get(key) || [];
  const lockoutEnd = lockedAccounts.get(key);

  return {
    attempts: attempts.length,
    locked: !!lockoutEnd && Date.now() < lockoutEnd,
    lockoutEnd: lockoutEnd ? new Date(lockoutEnd) : null
  };
};

// Clean up old entries periodically (every hour)
setInterval(() => {
  const now = Date.now();

  // Clean up old attempts
  for (const [key, attempts] of loginAttempts.entries()) {
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < ATTEMPT_WINDOW
    );

    if (recentAttempts.length === 0) {
      loginAttempts.delete(key);
    } else {
      loginAttempts.set(key, recentAttempts);
    }
  }

  // Clean up expired lockouts
  for (const [key, lockoutEnd] of lockedAccounts.entries()) {
    if (now >= lockoutEnd) {
      lockedAccounts.delete(key);
    }
  }

  console.log(`[SECURITY] Cleanup: ${loginAttempts.size} active attempts, ${lockedAccounts.size} locked accounts`);
}, 60 * 60 * 1000); // Run every hour
