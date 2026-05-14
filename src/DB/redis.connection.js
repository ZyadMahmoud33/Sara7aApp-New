// import { createClient } from "redis";
// import { REDIS_URL } from "../../config/config.service.js";

// export const redisClient = createClient({
//   url: REDIS_URL,
// });

// export const connectRedis = async () => {
//   try {
//     await redisClient.connect();
//     console.log("Redis connected successfully");
//   } catch (error) {
//     console.error("Redis connection error:", error);
//   }
// };
import { createClient } from "redis";
import { REDIS_URL } from "../../config/config.service.js";

export const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    connectTimeout: 10000,      // 10 ثانية timeout للاتصال
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Redis: too many retries, giving up");
        return false; // وقف المحاولات
      }
      const delay = Math.min(retries * 500, 3000);
      console.log(`Redis: reconnecting in ${delay}ms (attempt ${retries})`);
      return delay; // انتظر وحاول تاني
    },
  },
});

// أحداث مهمة
redisClient.on("connect", () => console.log("Redis: connecting..."));
redisClient.on("ready", () => console.log("Redis: ready ✅"));
redisClient.on("error", (err) => console.error("Redis error:", err.message));
redisClient.on("reconnecting", () => console.log("Redis: reconnecting..."));
redisClient.on("end", () => console.log("Redis: connection closed"));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Redis connection error:", error.message);
    // مش بنرمي error عشان الـ app تكمل حتى لو Redis فشل
  }
};

// دالة للتحقق من حالة الاتصال
export const isRedisReady = () => redisClient?.isReady ?? false;
