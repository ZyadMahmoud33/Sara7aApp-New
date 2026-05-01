// import connectDB from "./DB/conecctions.js";
// import { connectRedis } from "./DB/redis.connection.js";
// import { authRouter , userRouter , messageRouter, adminRouter } from "./Modules/index.js";
// import {
//     globalErorrHandler,
//     NotFoundException,
// } from "./Utlis/response/error.response.js";
// import { successResponse } from "./Utlis/response/succes.response.js";
// import cors from "cors";
// import path from "node:path";
// import { emailSubject, sendEmail } from "./Utlis/email/email.utils.js";
// import { corsOptions } from "./Utlis/cors/cors.util.js";
// import helmet from "helmet";
// import { attachRouterWithLogger } from "./Utlis/loggers/morgan.logger.js";
// import { customRateLimiter } from "./Middlewares/rateLimitter.middleware.js";


// const bootstrap = async (app, express) => {
//   // 🔥 مهم جدًا: webhook لوحده قبل أي حاجة
//   app.post(
//     "/api/user/webhook",
//     express.raw({ type: "application/json" }),
//     (req, res, next) => {
//       next(); // هيكمل للروتر
//     }
//   );
//     app.use(express.json() , cors(corsOptions()), helmet(), customRateLimiter);

//     await connectDB();
//     await connectRedis();

//     attachRouterWithLogger(app, "/api", authRouter, "access.log");
//     app.use("/uploads", express.static(path.resolve("./src/uploads")));
//     app.use("/api/auth", authRouter);
//     app.use("/api/user", userRouter);
//     app.use("/api/message", messageRouter);
//     app.use("/api/admin", adminRouter);

//     app.all("/*dummy", (req, res) => {
//        throw NotFoundException ({message: "not found Handler!!"})
//     });

//     app.use(globalErorrHandler);
// };

// export default bootstrap;

import connectDB from "./DB/conecctions.js";
import { connectRedis } from "./DB/redis.connection.js";
import { authRouter, userRouter, messageRouter, adminRouter } from "./Modules/index.js";
import {
    globalErorrHandler,
    NotFoundException,
} from "./Utlis/response/error.response.js";
import cors from "cors";
import path from "node:path";
import { corsOptions } from "./Utlis/cors/cors.util.js";
import helmet from "helmet";
import { attachRouterWithLogger } from "./Utlis/loggers/morgan.logger.js";
import { customRateLimiter, adminRateLimiter, getRateLimitStats, unblockIp } from "./Middlewares/rateLimitter.middleware.js";

const bootstrap = async (app, express) => {
  // ================================
  // 🔥 WEBHOOK (يحتاج raw body)
  // ================================
  app.post(
    "/api/user/webhook",
    express.raw({ type: "application/json" }),
    (req, res, next) => {
      next();
    }
  );

  // ================================
  // 🛡️ MIDDLEWARES الأساسية
  // ================================
  app.use(cors(corsOptions()));
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }));
  
  // تطبيق rate limit على كل الـ APIs
  app.use(customRateLimiter);
  
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ================================
  // 🗄️ DATABASE CONNECTIONS
  // ================================
  await connectDB();
  await connectRedis();

  // ================================
  // 📝 LOGGING (Morgan)
  // ================================
  attachRouterWithLogger(app, "/api", authRouter, "access.log");

  // ================================
  // 📁 STATIC FILES
  // ================================
  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  // ================================
  // 🛣️ ROUTES
  // ================================
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/message", messageRouter);
  
  // Admin routes with higher rate limit
  app.use("/api/admin", adminRateLimiter, adminRouter);

  // ================================
  // 📊 RATE LIMIT STATUS ROUTE
  // ================================
  app.get("/api/admin/rate-limit/stats", adminRateLimiter, (req, res) => {
    const stats = getRateLimitStats();
    res.json({ success: true, data: stats });
  });

  // ================================
  // 🧹 RATE LIMIT UNBLOCK ROUTE
  // ================================
  app.post("/api/admin/rate-limit/unblock", adminRateLimiter, (req, res) => {
    const { ip } = req.body;
    if (!ip) {
      return res.status(400).json({ success: false, message: "IP is required" });
    }
    const result = unblockIp(ip);
    res.json({ success: result, message: result ? `IP ${ip} unblocked successfully` : `IP ${ip} not found` });
  });

  // ================================
  // 🏠 HEALTH CHECK ROUTE
  // ================================
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "Server is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // ================================
  // ❌ 404 HANDLER (✅ تصحيح المسار)
  // ================================
   app.all("/*dummy", (req, res) => {
       throw NotFoundException ({message: "not found Handler!!"})
   });

  // ================================
  // 🚨 GLOBAL ERROR HANDLER
  // ================================
  app.use(globalErorrHandler);
};

export default bootstrap;