import { WHITE_LIST } from "../../../config/config.service.js";
import { BadRequestException } from "../response/error.response.js";

export function corsOptions() {
    const corsOptions = {
        // origin: '*' يعني مسموح لأي حد يكلم الباك إيند، وده بيحل مشكلة الـ CORS فوراً
        origin: function(origin, callback) {
            callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"], // ضفنا OPTIONS عشان الـ Preflight
        allowedHeaders: ["Content-Type", "Authorization", "token"], // تأكد إن الـ token مسموح به لو بتستخدمه
    };
    return corsOptions;
}