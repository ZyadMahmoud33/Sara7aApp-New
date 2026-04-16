import express  from "express";
import bootstrap from "./src/app.controller.js";
import { PORT } from "./config/config.service.js";

const app = express();
await bootstrap(app,express);
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
app.use("/uploads", express.static("uploads"));



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