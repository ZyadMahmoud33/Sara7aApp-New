import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // لو الاتصال موجود، رجّعه على طول
    if (cached.conn) {
        return cached.conn;
    }

    // لو في promise شغال، استنى عليه
    if (!cached.promise) {
        cached.promise = mongoose.connect(DB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
            retryWrites: true,
            family: 4,
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log("✅ MongoDB connected");
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error("❌ MongoDB error:", error.message);
        throw error;
    }
};

export default connectDB;