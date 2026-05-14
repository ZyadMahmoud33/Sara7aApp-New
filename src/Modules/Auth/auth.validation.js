import joi from "joi";
import { generalFilds } from "../../Middlewares/validation.middleware.js";

export const signupSchema = {
  body: joi.object({
    firstName: generalFilds.firstName.required(),
    lastName: generalFilds.lastName.required(),
    email: generalFilds.email.required(),
    age: generalFilds.age.required(),
    password: generalFilds.password.required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required().messages({
      "any.only": "Passwords do not match",
      "any.required": "Confirm password is required",
    }),
    phone: generalFilds.phone.required(),
    gender: generalFilds.gender.optional(),
    DOB: generalFilds.DOB.optional(),
    country: generalFilds.country.optional(),
    address: generalFilds.address.optional(),
    bio: generalFilds.bio.optional(),
  }),
};

export const loginSchema = {
   body: joi.object({
    email: generalFilds.email.required(),
  password: generalFilds.password.required(),
  }),
};

export const confirmEmailSchema = {
   body: joi.object({
    email: generalFilds.email.required(),
    otp: generalFilds.otp.required(),
  }),
};

export const resendOtpSchema = {
  body: joi.object({
    email: generalFilds.email.required(),
  }),
};


export const forgetPasswordSchema = {
   body: joi.object({
    email: generalFilds.email.required(),
  }),
};

export const resetPasswordSchema = {
   body: joi.object({
    email: generalFilds.email.required(),
    otp: generalFilds.otp.required(),
    newPassword: generalFilds.password.required(),
    confirmNewPassword: joi.ref("newPassword"),
  }),
};
