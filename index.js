import express from "express";
import bootstrap from "./src/app.controller.js";
import chalk from "chalk";

const app = express();

// ✅ Static files الأول
app.use("/uploads", express.static("uploads"));

// ✅ بعد كده الـ bootstrap اللي فيه الـ routes
await bootstrap(app, express);

// ✅ PORT من environment أو 3000 لو local
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(chalk.bgGreen(`Server running on port ${PORT}!`)));


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