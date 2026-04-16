import joi from "joi";
import { generalFilds } from "../../Middlewares/validation.middleware.js";

export const signupSchema = {
  body: joi.object({
    firstName: generalFilds.firstName.required(),
    lastName: generalFilds.lastName.required(),
    email: generalFilds.email.required(),
    age: generalFilds.age,
    password: generalFilds.password.required(),
    confirmPassword: generalFilds.confirmPassword,
    phone: generalFilds.phone,
  }),
};

export const loginSchema = {
   body: joi.object({
    email: generalFilds.email.required(),
  password: generalFilds.password.required(),
  }),
};
