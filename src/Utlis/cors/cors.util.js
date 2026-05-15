import cors from "cors";

export function corsOptions() {
    console.log("🛡️ CORS: Allowing all origins (temporary fix)");
    
    const corsOptions = {
        origin: true,  // السماح لأي origin
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