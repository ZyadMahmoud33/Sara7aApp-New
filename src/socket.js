import { Server } from "socket.io";

let io;

export function initSocket(server) {
    io = new Server(server, {
        cors: { origin: "*", credentials: true }
    });

    // تخزين OTP بشكل مؤقت (in-memory)
    const otpStore = new Map();

    io.on("connection", (socket) => {
        console.log("🟢 New client connected:", socket.id);

        // طلب OTP
        socket.on("request-otp", (email) => {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });
            socket.emit("receive-otp", { email, otp });
            console.log(`📡 OTP sent to ${email}: ${otp}`);
        });

        // التحقق من OTP
        socket.on("verify-otp", ({ email, otp }) => {
            const record = otpStore.get(email);
            const isValid = record && record.otp === otp && record.expires > Date.now();
            socket.emit("otp-verified", { success: isValid });
            if (isValid) otpStore.delete(email);
        });

        socket.on("disconnect", () => {
            console.log("🔴 Client disconnected:", socket.id);
        });
    });

    return io;
}

export function getIO() {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
}