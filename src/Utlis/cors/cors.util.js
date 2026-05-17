export function corsOptions() {
    const corsOptions = {
        origin: function(origin, callback) {
            // السماح لـ localhost
            if (!origin || origin.match(/^http:\/\/localhost:\d+$/)) {
                return callback(null, true);
            }
            // السماح لـ vercel domains
            if (origin?.match(/^https:\/\/.*\.vercel\.app$/)) {
                return callback(null, true);
            }
            // السماح لـ railway domains
            if (origin?.match(/^https:\/\/.*\.up\.railway\.app$/)) {
                return callback(null, true);
            }
            return callback(null, true); // مؤقتاً السماح للكل
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        exposedHeaders: ["Authorization"],
        optionsSuccessStatus: 200,
    };
    return corsOptions;
}