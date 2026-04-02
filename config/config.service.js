import {resolve} from "node:path";
import dotenv from "dotenv";

const envPath = {
     development: `.env.dev`,
     production:  `.env.prod`,
};

dotenv.config({
  path: resolve("config", envPath.development),
});

export const PORT = process.env.PORT || 5000;
export const DB_URI = process.env.DB_URL;
