import {resolve} from "node:path";
import dotenv from "dotenv";
import Stripe from "stripe";


const envPath = {
     development: `.env.dev`, 
     production:  `.env.prod`,
};

dotenv.config({
  path: resolve("config", envPath.development),
});

export const PORT = process.env.PORT || 5000;
export const DB_URI = process.env.DB_URL;
export const SALT = parseInt(process.env.SALT);
export const ENCRYPTION_SECRET = process.env.ENCRYPTION_KEY;

//USER
export const TOKEN_USER_ACCESS_KEY = process.env.TOKEN_ACCESS_USER_SECRET_KEY;
export const REFRESH_USER_SECRET_KEY = process.env.TOKEN_REFRESH_USER_SECRET_KEY;
//ADMIN
export const TOKEN_ADMIN_ACCESS_KEY = process.env.TOKEN_ACCESS_ADMIN_SECRET_KEY;
export const REFRESH_ADMIN_SECRET_KEY = process.env.TOKEN_REFRESH_ADMIN_SECRET_KEY;

export const ACCESS_EXPIRES = Number(process.env.ACCESS_EXPIRES);
export const REFRESH_EXPIRES = Number(process.env.REFRESH_EXPIRES);

// Social Login
export const CLIENT_ID = process.env.CLIENT_ID;
export const REDIS_URL = process.env.REDIS_URL;


// Sending Emails
export const USER_EMAIL = process.env.USER_EMAIL;
export const USER_PASSWORD = process.env.USER_PASSWORD;

// CORS
export const WHITE_LIST = process.env.WHITE_LIST;

// Stripe
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
export const CLIENT_URL = process.env.CLIENT_URL;