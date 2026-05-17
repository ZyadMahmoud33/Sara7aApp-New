// import {resolve} from "node:path";
// import dotenv from "dotenv";
// import Stripe from "stripe";


// const envPath = {
//      development: `.env.dev`, 
//      production:  `.env.prod`,
// };

// dotenv.config({
//   path: resolve("config", envPath.development),
// });

// export const PORT = process.env.PORT || 5000;
// export const DB_URI = process.env.DB_URL;
// export const SALT = parseInt(process.env.SALT);
// export const ENCRYPTION_SECRET = process.env.ENCRYPTION_KEY;

// //USER
// export const TOKEN_USER_ACCESS_KEY = process.env.TOKEN_ACCESS_USER_SECRET_KEY;
// export const REFRESH_USER_SECRET_KEY = process.env.TOKEN_REFRESH_USER_SECRET_KEY;
// //ADMIN
// export const TOKEN_ADMIN_ACCESS_KEY = process.env.TOKEN_ACCESS_ADMIN_SECRET_KEY;
// export const REFRESH_ADMIN_SECRET_KEY = process.env.TOKEN_REFRESH_ADMIN_SECRET_KEY;

// export const ACCESS_EXPIRES = Number(process.env.ACCESS_EXPIRES);
// export const REFRESH_EXPIRES = Number(process.env.REFRESH_EXPIRES);

// // Social Login
// export const CLIENT_ID = process.env.CLIENT_ID;
// export const REDIS_URL = process.env.REDIS_URL;


// // Sending Emails
// export const USER_EMAIL = process.env.USER_EMAIL;
// export const USER_PASSWORD = process.env.USER_PASSWORD;

// // CORS
// export const WHITE_LIST = process.env.WHITE_LIST;

// // Stripe
// export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
// export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
// export const CLIENT_URL = process.env.CLIENT_URL;

import { resolve } from "node:path";
import dotenv from "dotenv";
import Stripe from "stripe";

// ✅ تحديد البيئة الحالية
const NODE_ENV = process.env.NODE_ENV || 'development';

// ✅ مسار الملف على حسب البيئة
const envFile = NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
const envPath = resolve(process.cwd(), "config", envFile);

// ✅ Load env file if exists (على Vercel مش محتاج)
if (NODE_ENV !== 'production') {
  dotenv.config({ path: envPath });
}

// ✅ في Vercel، استخدم process.env مباشرة
export const PORT = process.env.PORT || 5000;
export const DB_URI = process.env.MONGODB_URI || process.env.DB_URL || process.env.DB_URI;
export const SALT = parseInt(process.env.SALT) || 12;
export const ENCRYPTION_SECRET = process.env.ENCRYPTION_KEY;

// USER
export const TOKEN_USER_ACCESS_KEY = process.env.TOKEN_ACCESS_USER_SECRET_KEY;
export const REFRESH_USER_SECRET_KEY = process.env.TOKEN_REFRESH_USER_SECRET_KEY;

// ADMIN
export const TOKEN_ADMIN_ACCESS_KEY = process.env.TOKEN_ACCESS_ADMIN_SECRET_KEY;
export const REFRESH_ADMIN_SECRET_KEY = process.env.TOKEN_REFRESH_ADMIN_SECRET_KEY;

export const ACCESS_EXPIRES = Number(process.env.ACCESS_EXPIRES) || 3600;
export const REFRESH_EXPIRES = Number(process.env.REFRESH_EXPIRES) || 86400;

// Social Login
export const CLIENT_ID = process.env.CLIENT_ID;
export const REDIS_URL = process.env.REDIS_URL;

// Google OAuth
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Facebook OAuth
export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
export const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

// GitHub OAuth
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Apple OAuth
export const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
export const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
export const APPLE_KEY_ID = process.env.APPLE_KEY_ID;
export const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY;

// Twitter (X) OAuth
export const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
export const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
export const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// Sending Emails
export const USER_EMAIL = process.env.USER_EMAIL;
export const USER_PASSWORD = process.env.USER_PASSWORD;
export const BREVO_API_KEY = process.env.BREVO_API_KEY;

// CORS
export const WHITE_LIST = process.env.WHITE_LIST || "http://localhost:5173,https://sara7a-frontend.vercel.app";
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
export const CLIENT_URL = process.env.CLIENT_URL;

console.log("🔍 process.env.WHITE_LIST =", process.env.WHITE_LIST);
console.log("🔍 process.env.NODE_ENV =", process.env.NODE_ENV);
console.log("DB_URI:", DB_URI);