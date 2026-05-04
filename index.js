import express from "express";
import bootstrap from "./src/app.controller.js";
import chalk from "chalk";

const app = express();

// ✅ Static files
app.use("/uploads", express.static("uploads"));

const startServer = async () => {
    try {
        console.log(chalk.blue("🚀 Starting server bootstrap..."));
        
        await bootstrap(app, express);
        
        console.log(chalk.green("✅ Bootstrap completed successfully"));
        
        const PORT = process.env.PORT || 3000;
        
        const server = app.listen(PORT, () => {
            console.log(chalk.bgGreen(`✅ Server running on port ${PORT}!`));
        });
        
        // Handle server errors
        server.on('error', (err) => {
            console.error(chalk.bgRed("❌ Server error:"), err);
            process.exit(1);
        });
        
    } catch (error) {
        console.error(chalk.bgRed("❌ Failed to start server:"), error);
        console.error(chalk.red("Error details:"), error.stack);
        process.exit(1);
    }
};

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