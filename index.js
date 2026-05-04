import express from "express";
import bootstrap from "./src/app.controller.js";
import chalk from "chalk";

console.log("🚀 Script started");

const app = express();

console.log("📁 Setting up static files...");
app.use("/uploads", express.static("uploads"));

const startServer = async () => {
    try {
        console.log("🔄 Calling bootstrap...");
        await bootstrap(app, express);
        console.log("✅ Bootstrap returned successfully");
        
        const PORT = process.env.PORT || 3000;
        console.log(`🔌 Attempting to listen on port ${PORT}...`);
        console.log("PORT from env:", process.env.PORT);
        
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(chalk.bgGreen(`✅ Server running on port ${PORT}!`));
        });
        
        server.on('error', (err) => {
            console.error(chalk.bgRed("❌ Server error:"), err);
            process.exit(1);
        });
        
    } catch (error) {
        console.error(chalk.bgRed("❌ FATAL ERROR:"), error);
        console.error(chalk.red("Stack trace:"), error.stack);
        process.exit(1);
    }
};

console.log("🏁 Calling startServer...");
startServer();


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