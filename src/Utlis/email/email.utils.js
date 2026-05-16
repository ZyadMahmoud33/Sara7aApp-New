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

export async function sendEmail({ to="", subject="", text="", html="", cc="", bcc="", attachments=[] }) {
    // 🚀 Logging mode - بيظهر OTP في الـ logs
    const otpMatch = html.match(/\d{6}/);
    const otp = otpMatch ? otpMatch[0] : 'N/A';
    
    console.log(`\n📧 ========== EMAIL (LOG MODE) ==========`);
    console.log(`📧 To: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log(`=========================================\n`);
    
    // 💡 لو حابب تجرب الإيميل الحقيقي، علّق السطرين دول
    /*
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: USER_EMAIL, pass: USER_PASSWORD },
    });
    const info = await transporter.sendMail({
        from: `"Sara7a Team" <${USER_EMAIL}>`,
        to, subject, text, html, attachments, cc, bcc,
    });
    console.log("Message sent: %s", info.messageId);
    */
    
    return { messageId: `log-mode-${Date.now()}` };
}

export const emailSubject = {
    confirmEmail: "Confirm your email",
    resendOtp: "Resend OTP",
    resetPassword: "Reset your password",
    welcome: "Welcome to Sara7a",
    contactUs: "Contact us",
};