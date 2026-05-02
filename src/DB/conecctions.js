import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

const connectDB = async () => {
    try {
        console.log("DB_URI =", DB_URI); // 🔥 أهم سطر

        await mongoose.connect(DB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log("MongoDB connected successfully");

    } catch (error) {
        console.log("Error connecting Database", error);
    }
}

export default connectDB;