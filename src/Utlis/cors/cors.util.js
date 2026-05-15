import { WHITE_LIST } from "../../../config/config.service.js";
import { BadRequestException } from "../response/error.response.js";

export function corsOptions() {
    const whiteListString = WHITE_LIST || "http://localhost:5173,https://sara7a-frontend.vercel.app";
    const whiteList = whiteListString.split(",").map(origin => origin.trim().replace(/\/$/, ''));
    
    console.log("🛡️ CORS Whitelist:", whiteList);
    
    const corsOptions = {
        origin: function(origin, callback) {
            // السماح لـ Postman والـ server-side requests
            if (!origin) {
                console.log("✅ No origin (Postman/server) allowed");
                return callback(null, true);
            }
            
            const normalizedOrigin = origin.replace(/\/$/, '');
            
            // السماح لكل localhost ports (للتطوير)
            if (normalizedOrigin.match(/^http:\/\/localhost:\d+$/)) {
                console.log(`✅ CORS allowed (localhost): ${normalizedOrigin}`);
                return callback(null, true);
            }
            
            // السماح لكل الـ vercel domains
            if (normalizedOrigin.match(/^https:\/\/.*\.vercel\.app$/)) {
                console.log(`✅ CORS allowed (vercel): ${normalizedOrigin}`);
                return callback(null, true);
            }
            
            // السماح لكل الـ railway domains (للتطوير)
            if (normalizedOrigin.match(/^https:\/\/.*\.up\.railway\.app$/)) {
                console.log(`✅ CORS allowed (railway): ${normalizedOrigin}`);
                return callback(null, true);
            }
            
            // التحقق من الـ white list
            if (whiteList.includes(normalizedOrigin)) {
                console.log(`✅ CORS allowed (whitelist): ${normalizedOrigin}`);
                return callback(null, true);
            }
            
            console.log(`❌ CORS blocked: ${origin}`);
            return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        exposedHeaders: ["Authorization"],
        optionsSuccessStatus: 200,
        preflightContinue: false,
        maxAge: 86400,
    };
    
    return corsOptions;
}