import { WHITE_LIST } from "../../../config/config.service.js";
import { BadRequestException } from "../response/error.response.js";

export function corsOptions() {
    const whiteListString = WHITE_LIST || "http://localhost:5173,https://sara7a-frontend.vercel.app";
    const whiteList = whiteListString.split(",").map(origin => origin.trim()); // ✅ Trim المسافات
    
    console.log("🛡️ CORS Whitelist:", whiteList);
    
    const corsOptions = {
        origin: function(origin, callback) {
            // السماح لـ Postman وغيرها
            if (!origin) {
                return callback(null, true);
            }
            
            // ✅ مقارنة بالضبط
            if (whiteList.indexOf(origin) !== -1) {
                return callback(null, true);
            }
            
            // ✅ لو لسه مش شغال، جرب تقارن بدون trailing slash
            const originNormalized = origin.replace(/\/$/, '');
            if (whiteList.indexOf(originNormalized) !== -1) {
                return callback(null, true);
            }
            
            console.log(`❌ CORS blocked: ${origin}`);
            return callback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        exposedHeaders: ["Authorization"],
        optionsSuccessStatus: 200,
    };
    return corsOptions;
}