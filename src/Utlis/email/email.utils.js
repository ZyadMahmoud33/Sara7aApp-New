// import nodemailer from "nodemailer";
// import { USER_EMAIL, USER_PASSWORD } from "../../../config/config.service.js";

// export async function sendEmail({ to="", subject="", text="", html="",cc="",bcc="", attachments=[] }) {
//     // Create a transporter using SMTP
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: USER_EMAIL,
//     pass: USER_PASSWORD, // app password with google
//   },
// });
// try {
//   const info = await transporter.sendMail({
//     from: `"Sara7a Team" <${USER_EMAIL}>`, // sender address
//     to, // list of recipients
//     subject, // subject line
//     text, // plain text body
//     html, // HTML body
//     attachments, // attachments
//     cc, // cc
//     bcc, // bcc
//   });

//   console.log("Message sent: %s", info.messageId);
//   // Preview URL is only available when using an Ethereal test account
// //   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// } catch (err) {
//   console.error("Error while sending mail:", err);
// }
// };

// export const emailSubject = {
//     confirmEmail: "Confirm your email",
//     resendOtp: "Resend OTP",
//     resetPassword: "Reset your password",
//     welcome: "Welcome to Sara7a",
//     contactUs: "Contact us",
// }
import nodemailer from "nodemailer";
import { USER_EMAIL, USER_PASSWORD } from "../../../config/config.service.js";

// ============================================================
// 🚀 ADVANCED EMAIL SYSTEM FOR RAILWAY
// ============================================================

// محاولات متعددة مع fallback
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// تأخير بين المحاولات
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// دالة إرسال مع إعادة المحاولة
async function sendWithRetry(transporter, mailOptions, attempt = 1) {
    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, info };
    } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt < MAX_RETRIES) {
            console.log(`🔄 Retrying in ${RETRY_DELAY}ms...`);
            await sleep(RETRY_DELAY);
            return sendWithRetry(transporter, mailOptions, attempt + 1);
        }
        
        return { success: false, error };
    }
}

export async function sendEmail({ to = "", subject = "", text = "", html = "", cc = "", bcc = "", attachments = [] }) {
    // التحقق من صحة الإيميل
    if (!to || !to.includes("@")) {
        console.error("❌ Invalid email address:", to);
        return { success: false, error: "Invalid email" };
    }

    // محاولة استخدام Gmail SMTP
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: USER_EMAIL,
            pass: USER_PASSWORD,
        },
        // إعدادات إضافية للموثوقية
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });

    const mailOptions = {
        from: `"Sara7a" <${USER_EMAIL}>`,
        to,
        subject,
        text,
        html,
        cc,
        bcc,
        attachments,
    };

    console.log(`📧 Sending email to: ${to}`);
    
    const result = await sendWithRetry(transporter, mailOptions);
    
    if (result.success) {
        console.log(`✅ Email sent successfully: ${result.info.messageId}`);
        return result.info;
    } else {
        console.error(`❌ Failed to send email after ${MAX_RETRIES} attempts`);
        
        // Emergency log - show OTP in logs
        const otpMatch = html?.match(/\d{6}/);
        const otp = otpMatch ? otpMatch[0] : 'N/A';
        console.log(`\n🔐 ========== EMERGENCY OTP ==========`);
        console.log(`📧 To: ${to}`);
        console.log(`🔑 OTP: ${otp}`);
        console.log(`=====================================\n`);
        
        throw result.error;
    }
}

export const emailSubject = {
    confirmEmail: "Confirm your email",
    resendOtp: "Resend OTP",
    resetPassword: "Reset your password",
    welcome: "Welcome to Sara7a",
    contactUs: "Contact us",
};