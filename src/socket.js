import { Server } from "socket.io";

let io;

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: ["https://sara7a-frontend.vercel.app", "http://localhost:5173"],
            credentials: true,
            methods: ["GET", "POST"]
        },
        allowEIO3: true
    });

    const otpStore = new Map();

    io.on("connection", (socket) => {
        console.log("🟢 New client connected:", socket.id);

        socket.on("request-otp", (email) => {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });
            socket.emit("receive-otp", { email, otp });
            console.log(`📡 OTP sent to ${email}: ${otp}`);
        });

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