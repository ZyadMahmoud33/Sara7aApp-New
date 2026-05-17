import express from "express";
import bootstrap from "./src/app.controller.js";
import { PORT } from "./config/config.service.js";
import path from "path";
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
await bootstrap(app, express);
app.listen(PORT, () => console.log(chalk.bgGreen.black(`🚀 Server running on port ${PORT}!`)));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));