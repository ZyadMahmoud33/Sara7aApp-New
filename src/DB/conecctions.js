import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

const connectDB = async () => {
    try {
        console.log("🔄 Connecting to MongoDB Atlas...");
        
        // إخفاء الباسورد من الـ log
        const maskedUri = DB_URI?.replace(/\/\/.*@/, '//***:***@');
        console.log("DB_URI =", maskedUri);

        await mongoose.connect(DB_URI, {
            serverSelectionTimeoutMS: 120000,    // 120 ثانية كمان
            socketTimeoutMS: 180000,             // 3 دقائق
            connectTimeoutMS: 120000,            // 2 دقيقة
            heartbeatFrequencyMS: 30000,
            maxPoolSize: 5,                      // قلل pool size
            minPoolSize: 1,
            retryWrites: true,
            retryReads: true,
            family: 4,                           // استخدم IPv4 بس
        });

        console.log("✅ MongoDB Atlas connected successfully");
        
        mongoose.connection.on('error', (err) => {
            console.error("❌ MongoDB error:", err.message);
        });

    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        console.log("⚠️ Retrying connection in 15 seconds...");
        setTimeout(connectDB, 15000);
    }
};

export default connectDB;