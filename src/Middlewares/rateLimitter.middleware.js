// backend/src/middlewares/rateLimit.js
import { get, set } from "../DB/redis.service.js";

// ================================
// 🧠 IN-MEMORY STORE (للحالات العادية)
// ================================
const ipRequest = new Map(); // { ip: { count, startTime } }
const blockedIps = new Map(); // { ip: blockedUntil }
const blockAttempts = new Map(); // { ip: { count, lastBlockTime } }

// ================================
// ⚙️ CONFIGURATION
// ================================
const RATE_LIMIT = 60;              // عدد الطلبات المسموحة
const WINDOW_MS = 60 * 1000;        // النافذة الزمنية (1 دقيقة)
const BLOCK_DURATION = 5 * 60 * 1000; // مدة البلوك (5 دقائق)
const MAX_BLOCK_ATTEMPTS = 3;       // عدد البلوكات قبل البلوك الدائم

// ================================
// 🛡️ CLEANUP INTERVAL (كل ساعة)
// ================================
setInterval(() => {
  const now = Date.now();
  
  for (const [ip, blockedUntil] of blockedIps.entries()) {
    if (blockedUntil < now) {
      blockedIps.delete(ip);
      console.log(`✅ IP ${ip} unblocked automatically`);
    }
  }
  
  for (const [ip, data] of ipRequest.entries()) {
    if (now - data.startTime > WINDOW_MS * 2) {
      ipRequest.delete(ip);
    }
  }
  
  for (const [ip, data] of blockAttempts.entries()) {
    if (now - data.lastBlockTime > 24 * 60 * 60 * 1000) {
      blockAttempts.delete(ip);
    }
  }
}, 60 * 60 * 1000);

// ================================
// 🔧 دالة حظر IP
// ================================
const blockIp = (ip, duration = BLOCK_DURATION, reason = "Too many requests") => {
  const blockedUntil = Date.now() + duration;
  blockedIps.set(ip, blockedUntil);
  
  const attempts = blockAttempts.get(ip) || { count: 0, lastBlockTime: Date.now() };
  attempts.count++;
  attempts.lastBlockTime = Date.now();
  blockAttempts.set(ip, attempts);
  
  console.log(`🚫 IP ${ip} blocked for ${duration / 1000}s. Reason: ${reason}. Attempts: ${attempts.count}`);
  
  if (attempts.count >= MAX_BLOCK_ATTEMPTS) {
    const extendedDuration = 30 * 60 * 1000;
    blockedIps.set(ip, Date.now() + extendedDuration);
    console.log(`⚠️ IP ${ip} extended block to ${extendedDuration / 1000}s`);
  }
  
  return blockedUntil;
};

// ================================
// 🔧 دالة التحقق من IP محظور
// ================================
const isIpBlocked = (ip) => {
  const blockedUntil = blockedIps.get(ip);
  if (!blockedUntil) return false;
  if (blockedUntil < Date.now()) {
    blockedIps.delete(ip);
    return false;
  }
  return true;
};

// ================================
// 🔧 دالة الحصول على وقت الـ reset
// ================================
const getResetTime = (startTime) => {
  return new Date(startTime + WINDOW_MS).toISOString();
};

// ================================
// 🚦 RATE LIMITER الرئيسي
// ================================
export const customRateLimiter = async (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const currentTime = Date.now();

  // ❌ IP محظور
  if (isIpBlocked(ip)) {
    const blockedUntil = blockedIps.get(ip);
    const remainingSeconds = Math.ceil((blockedUntil - currentTime) / 1000);
    return res.status(429).json({
      success: false,
      message: `Too many requests. You are blocked for ${remainingSeconds} seconds.`,
      error: "RATE_LIMIT_BLOCKED",
      retryAfter: remainingSeconds,
      blockedUntil: new Date(blockedUntil).toISOString(),
    });
  }

  // 📍 جلب البيانات
  let requestData;
  try {
    const redisKey = `rate_limit:${ip}`;
    const redisData = await get(redisKey); // ✅ استدعاء صحيح (key string)
    if (redisData) {
      requestData = JSON.parse(redisData);
    } else {
      requestData = ipRequest.get(ip);
    }
  } catch (err) {
    requestData = ipRequest.get(ip);
  }

  // 🆕 أول طلب
  if (!requestData) {
    const newData = { count: 1, startTime: currentTime };
    ipRequest.set(ip, newData);
    try {
      const redisKey = `rate_limit:${ip}`;
      await set(redisKey, JSON.stringify(newData), WINDOW_MS / 1000); // ✅ set(key, value, ttl)
    } catch (err) {}
    return next();
  }

  const timeElapsed = currentTime - requestData.startTime;

  // 🔄 نافذة زمنية جديدة
  if (timeElapsed >= WINDOW_MS) {
    const newData = { count: 1, startTime: currentTime };
    ipRequest.set(ip, newData);
    try {
      const redisKey = `rate_limit:${ip}`;
      await set(redisKey, JSON.stringify(newData), WINDOW_MS / 1000);
    } catch (err) {}
    return next();
  }

  // 📈 زيادة العدد
  requestData.count++;
  ipRequest.set(ip, requestData);
  try {
    const redisKey = `rate_limit:${ip}`;
    await set(redisKey, JSON.stringify(requestData), WINDOW_MS / 1000);
  } catch (err) {}

  // 🚨 تجاوز الحد
  if (requestData.count > RATE_LIMIT) {
    blockIp(ip, BLOCK_DURATION, `Exceeded rate limit (${requestData.count}/${RATE_LIMIT})`);
    const resetTime = getResetTime(requestData.startTime);
    return res.status(429).json({
      success: false,
      message: `Too many requests. Limit: ${RATE_LIMIT} requests per ${WINDOW_MS / 1000} seconds.`,
      error: "RATE_LIMIT_EXCEEDED",
      limit: RATE_LIMIT,
      remaining: 0,
      reset: resetTime,
      retryAfter: Math.ceil((requestData.startTime + WINDOW_MS - currentTime) / 1000),
    });
  }

  // ✅ طلب مسموح
  const remaining = RATE_LIMIT - requestData.count;
  const resetTime = getResetTime(requestData.startTime);
  
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', new Date(requestData.startTime + WINDOW_MS).toISOString());
  
  next();
};

// ================================
// 🛡️ MIDDLEWARE للـ Admin فقط
// ================================
export const adminRateLimiter = async (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ADMIN_RATE_LIMIT = 200;
  const ADMIN_WINDOW_MS = 60 * 1000;
  
  let requestData = ipRequest.get(ip);
  const currentTime = Date.now();
  
  if (!requestData || currentTime - requestData.startTime >= ADMIN_WINDOW_MS) {
    ipRequest.set(ip, { count: 1, startTime: currentTime });
    return next();
  }
  
  requestData.count++;
  ipRequest.set(ip, requestData);
  
  if (requestData.count > ADMIN_RATE_LIMIT) {
    const blockedUntil = blockIp(ip, BLOCK_DURATION / 2, "Admin rate limit exceeded");
    const remainingSeconds = Math.ceil((blockedUntil - currentTime) / 1000);
    return res.status(429).json({
      success: false,
      message: `Admin rate limit exceeded. Limit: ${ADMIN_RATE_LIMIT} requests per minute. Blocked for ${remainingSeconds}s.`,
      error: "ADMIN_RATE_LIMIT_EXCEEDED",
      limit: ADMIN_RATE_LIMIT,
      retryAfter: remainingSeconds,
    });
  }
  
  next();
};

// ================================
// 🧪 HELPER FUNCTIONS
// ================================
export const getIpStatus = (ip) => {
  const isBlocked = isIpBlocked(ip);
  const requestData = ipRequest.get(ip);
  const blockAttempt = blockAttempts.get(ip);
  return {
    ip,
    isBlocked,
    blockedUntil: isBlocked ? blockedIps.get(ip) : null,
    currentRequests: requestData?.count || 0,
    windowStart: requestData?.startTime || null,
    blockAttempts: blockAttempt?.count || 0,
  };
};

export const unblockIp = (ip) => {
  if (blockedIps.has(ip)) {
    blockedIps.delete(ip);
    console.log(`🔓 IP ${ip} manually unblocked`);
    return true;
  }
  return false;
};

export const getRateLimitStats = () => {
  return {
    activeIps: ipRequest.size,
    blockedIps: blockedIps.size,
    rateLimit: RATE_LIMIT,
    windowMs: WINDOW_MS,
    blockDuration: BLOCK_DURATION,
    maxBlockAttempts: MAX_BLOCK_ATTEMPTS,
    adminRateLimit: 200,
  };
};

export const clearRateLimitData = () => {
  ipRequest.clear();
  blockedIps.clear();
  blockAttempts.clear();
  console.log("🧹 Rate limit data cleared");
  return true;
};