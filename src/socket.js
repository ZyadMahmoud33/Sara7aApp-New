// import { Server } from "socket.io";

// let io;

// export function initSocket(server) {
//     io = new Server(server, {
//         cors: {
//             origin: "*",
//             credentials: true,
//             methods: ["GET", "POST"],
//             allowedHeaders: ["Content-Type", "Authorization"]
//         },
//         allowEIO3: true,
//         transports: ['websocket', 'polling'],
//         pingTimeout: 60000,
//         pingInterval: 25000,
//     });

//     const otpStore = new Map();

//     // ✅ تنظيف الـ OTP القديمة كل ساعة
//     setInterval(() => {
//         const now = Date.now();
//         for (const [email, record] of otpStore.entries()) {
//             if (record.expires < now) {
//                 otpStore.delete(email);
//                 console.log(`🧹 Cleaned expired OTP for: ${email}`);
//             }
//         }
//     }, 60 * 60 * 1000);

//     io.on("connection", (socket) => {
//         console.log("🟢 New client connected:", socket.id);
        
//         // ✅ إضافة معلومات الـ origin للـ debugging
//         console.log("📡 Client origin:", socket.handshake.headers.origin);

//         socket.on("request-otp", (email) => {
//             console.log(`📥 OTP requested for: ${email}`);
            
//             const otp = Math.floor(100000 + Math.random() * 900000).toString();
//             const expires = Date.now() + 5 * 60 * 1000; // 5 دقائق
            
//             otpStore.set(email, { otp, expires });
            
//             socket.emit("receive-otp", { email, otp });
//             console.log(`📡 OTP sent to ${email}: ${otp}`);
//         });

//         socket.on("verify-otp", ({ email, otp }) => {
//             console.log(`🔍 Verifying OTP for: ${email}`);
            
//             const record = otpStore.get(email);
            
//             if (!record) {
//                 socket.emit("otp-verified", { 
//                     success: false, 
//                     message: "No OTP request found" 
//                 });
//                 return;
//             }
            
//             const isExpired = record.expires < Date.now();
//             const isValid = !isExpired && record.otp === otp;
            
//             socket.emit("otp-verified", { 
//                 success: isValid, 
//                 message: isValid ? "OTP verified" : (isExpired ? "OTP expired" : "Invalid OTP")
//             });
            
//             if (isValid) {
//                 otpStore.delete(email);
//                 console.log(`✅ OTP verified for: ${email}`);
//             }
//         });

//         socket.on("disconnect", () => {
//             console.log("🔴 Client disconnected:", socket.id);
//         });
        
//         // ✅ معالجة الأخطاء
//         socket.on("error", (error) => {
//             console.error("❌ Socket error:", error);
//         });
//     });

//     return io;
// }

// export function getIO() {
//     if (!io) throw new Error("Socket.io not initialized");
//     return io;
// }