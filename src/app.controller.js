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
import compression from "compression";

const bootstrap = async (app, express) => {
    console.log("🚀 Starting bootstrap...");
    
    // 1. Health Check & Root Route (للتأكد إن السيرفر شغال)
    app.get("/", (req, res) => {
        res.json({ message: "Backend is working 🚀" });
    });
    
    app.get("/api/health", (req, res) => {
        res.json({
            success: true,
            message: "Server is running",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });

    // 2. Webhook (يجب أن يكون قبل express.json)
    app.post(
        "/api/user/webhook",
        express.raw({ type: "application/json" }),
        (req, res, next) => {
            next();
        }
    );
   app.use(compression());

    // 3. Middlewares الأساسية
app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false,
    }));
    
    // ⚠️ تنبيه: لو الـ Rate Limiter بيعتمد على Redis والـ Redis مش شغال، ممكن يوقف التسجيل.
    // يفضل استخدامه فقط لو متأكد من اتصال Redis.
    // app.use(customRateLimiter);
    
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // 4. Database Connections
    try {
        console.log("🔄 Connecting to MongoDB...");
        await connectDB(); //
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        // في الـ Serverless، لو الداتا بيز مفصلت وبدأنا نبعت Requests هيدي 500
    }

    try {
        console.log("🔄 Connecting to Redis...");
        await connectRedis();
        console.log("✅ Redis connected successfully");
    } catch (error) {
        console.error("❌ Redis connection failed:", error.message);
        console.warn("⚠️ Continuing without Redis (This might affect Rate Limiting)...");
    }

    // 5. Routes
    if (attachRouterWithLogger) {
        attachRouterWithLogger(app, "/api/auth", authRouter, "access.log");
    }

    app.use("/uploads", express.static(path.resolve("./src/uploads")));
    
    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
    app.use("/api/message", messageRouter);
    app.use("/api/admin", adminRateLimiter, adminRouter);

    // 6. 404 Handler (التصحيح النهائي)
    app.all("/*dummy", (req, res, next) => {
        next(NotFoundException({ message: `Route ${req.originalUrl} not found on this server` }));
    });

    // 7. Global Error Handler
    app.use(globalErorrHandler);
    
    console.log("✅ Bootstrap completed successfully");
};

export default bootstrap;