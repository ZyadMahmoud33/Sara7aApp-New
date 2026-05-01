import express  from "express";
import bootstrap from "./src/app.controller.js";
import { PORT } from "./config/config.service.js";
import chalk from "chalk";

const app = express();
app.use(express.json());
await bootstrap(app,express);
app.use("/uploads", express.static("uploads"));
app.listen(PORT, () => console.log(chalk.bgGreen.black(`Example app listening on port ${PORT}!`)));




/**
 * $2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa
 |  |  |                     |
 |  |  |                     hash-value = K0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa
 |  |  |
 |  |  salt = nOUIs5kJ7naTuTFkBy1veu
 |  |
 |  cost-factor => 10 = 2^10 rounds
 |
 hash-algorithm identifier => 2b = BCrypt
 */