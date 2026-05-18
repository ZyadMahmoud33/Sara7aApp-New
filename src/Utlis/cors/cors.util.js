export function corsOptions() {
    const corsOptions = {
        origin: function(origin, callback) {
            // السماح لـ localhost (للتطوير المحلي)
            if (!origin || origin === 'null' || origin.match(/^http:\/\/localhost:\d+$/)) {
                console.log(`✅ CORS allowed (localhost): ${origin}`);
                return callback(null, true);
            }
            
            // السماح لـ vercel domains (للـ frontend المستضاف على Vercel)
            if (origin?.match(/^https:\/\/.*\.vercel\.app$/)) {
                console.log(`✅ CORS allowed (vercel): ${origin}`);
                return callback(null, true);
            }
            
            // السماح لـ railway domains (للتطوير)
            if (origin?.match(/^https:\/\/.*\.up\.railway\.app$/)) {
                console.log(`✅ CORS allowed (railway): ${origin}`);
                return callback(null, true);
            }
            
            // السماح لأي origin في حالة عدم التطابق (مؤقتاً)
            console.log(`⚠️ CORS allowed (fallback): ${origin || 'no origin'}`);
            return callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        exposedHeaders: ["Authorization"],
        optionsSuccessStatus: 200,
        preflightContinue: false,
        maxAge: 86400, // 24 ساعة - تقليل عدد طلبات preflight
    };
    
    return corsOptions;
}

// ✅ FIX: middleware لإصلاح مشكلة Cross-Origin-Opener-Policy
// بيسمح لـ Google OAuth popup يتواصل مع الصفحة بدل ما يتبلوك
// استخدمه في app.js قبل أي middleware تاني:
//   import { corsOptions, coopMiddleware } from "./utils/cors.util.js";
//   app.use(coopMiddleware);
//   app.use(cors(corsOptions()));
export function coopMiddleware(req, res, next) {
    // same-origin-allow-popups → بيسمح للـ popup بتاع Google يتواصل مع الصفحة
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    // unsafe-none → بيمنع أي تعارض مع الـ COEP
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
    next();
}