import { EventEmitter } from "events";
import { sendEmail, emailSubject } from "../email/email.utils.js";
import { template, templatey } from "../email/generateHtml.js";

export const emailEvent = new EventEmitter();


emailEvent.on("confirmEmail", async (data) => {
    await sendEmail({
    to: data.to,
    subject: emailSubject.confirmEmail,
    html: template(data.otp, data.firstName, emailSubject.confirmEmail),
  }).catch((err) => {
    console.log("Error sending email:", err);
 });
});

export const emailEventy = new EventEmitter();


emailEventy.on("resendOtp", async (data) => {
    await sendEmail({
      to: data.to,
      subject: emailSubject.resendOtp, 
      html: templatey(
        data.otp,
        data.firstName 
      ),
    }).catch((err) => {
      console.log("Error sending email:", err);
    });
});

emailEvent.on("forgetPassword", async (data) => {
    await sendEmail({
    to: data.to,
    subject: emailSubject.resetPassword,
    html: template(data.otp, data.firstName, emailSubject.resetPassword),
  }).catch((err) => {
    console.log("Error Reset Password :", err);
 });
});



