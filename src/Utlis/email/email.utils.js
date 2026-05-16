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
// 

import nodemailer from "nodemailer";
import { USER_EMAIL, USER_PASSWORD } from "../../../config/config.service.js";
import * as Brevo from '@getbrevo/brevo';

// ============================================================
// 🚀 ADVANCED EMAIL SYSTEM FOR RAILWAY WITH BREVO FALLBACK
// ============================================================

// تهيئة Brevo API كـ Fallback
let brevoApiInstance = null;
try {
    const { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } = Brevo;
    brevoApiInstance = new TransactionalEmailsApi();
    brevoApiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
    console.log("✅ Brevo API initialized as fallback");
} catch (error) {
    console.warn("⚠️ Brevo not configured, using Gmail only");
}

// محاولات متعددة مع fallback
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// تأخير بين المحاولات
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// دالة إرسال عبر Brevo API
async function sendViaBrevo(mailOptions, attempt = 1) {
    try {
        const { SendSmtpEmail } = Brevo;
        const sendSmtpEmail = new SendSmtpEmail();
        sendSmtpEmail.to = [{ email: mailOptions.to }];
        sendSmtpEmail.sender = { email: USER_EMAIL, name: "Sara7a Team" };
        sendSmtpEmail.subject = mailOptions.subject;
        sendSmtpEmail.htmlContent = mailOptions.html || mailOptions.text;
        
        const response = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);
        return { success: true, info: response, method: "brevo" };
    } catch (error) {
        console.error(`❌ Brevo attempt ${attempt} failed:`, error.message);
        
        if (attempt < MAX_RETRIES) {
            console.log(`🔄 Brevo retrying in ${RETRY_DELAY}ms...`);
            await sleep(RETRY_DELAY);
            return sendViaBrevo(mailOptions, attempt + 1);
        }
        
        return { success: false, error };
    }
}

// دالة إرسال عبر Gmail SMTP
async function sendViaGmail(mailOptions, attempt = 1) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: USER_EMAIL, pass: USER_PASSWORD },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
        });

        const info = await transporter.sendMail(mailOptions);
        return { success: true, info, method: "gmail" };
    } catch (error) {
        console.error(`❌ Gmail attempt ${attempt} failed:`, error.message);
        
        if (attempt < MAX_RETRIES) {
            console.log(`🔄 Gmail retrying in ${RETRY_DELAY}ms...`);
            await sleep(RETRY_DELAY);
            return sendViaGmail(mailOptions, attempt + 1);
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

    const mailOptions = {
        from: `"Sara7a" <${USER_EMAIL}>`,
        to,
        subject,
        text,
        html: html || text,
        cc,
        bcc,
        attachments,
    };

    console.log(`📧 Sending email to: ${to}`);
    
    let result = { success: false };
    
    // 1. حاول أولاً عبر Gmail
    result = await sendViaGmail(mailOptions);
    
    // 2. لو فشل Gmail وجرب عبر Brevo
    if (!result.success && brevoApiInstance) {
        console.log("🔄 Gmail failed, trying Brevo API...");
        result = await sendViaBrevo(mailOptions);
    }
    
    // 3. لو فشل الاتنين
    if (!result.success) {
        console.error(`❌ Failed to send email after all attempts`);
        
        // Emergency log - show OTP in logs
        const otpMatch = (html || text)?.match(/\d{6}/);
        const otp = otpMatch ? otpMatch[0] : 'N/A';
        console.log(`\n🔐 ========== EMERGENCY OTP ==========`);
        console.log(`📧 To: ${to}`);
        console.log(`🔑 OTP: ${otp}`);
        console.log(`=====================================\n`);
        
        throw result.error;
    }
    
    console.log(`✅ Email sent successfully via ${result.method}: ${result.info.messageId}`);
    return result.info;
}

export const emailSubject = {
    confirmEmail: "Confirm your email",
    resendOtp: "Resend OTP",
    resetPassword: "Reset your password",
    welcome: "Welcome to Sara7a",
    contactUs: "Contact us",
};