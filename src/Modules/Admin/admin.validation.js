import Joi from "joi";

// ================================
// 📌 COMMON OBJECT ID
// ================================
const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.empty": "ID is required ❌",
    "string.pattern.base": "Invalid ID format ❌",
  });

// ================================
// 👤 USER ID PARAM
// ================================
export const userIdParamSchema = Joi.object({
  userId: objectId.required(),
}).unknown(false);

// ================================
// 💳 PAYMENT ID PARAM
// ================================
export const paymentIdParamSchema = Joi.object({
  paymentId: objectId.required(),
}).unknown(false);

// ================================
// 🔑 CHANGE PASSWORD
// ================================
export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required().messages({
    "any.required": "Old password is required ❌",
    "string.min": "Password must be at least 6 chars ❌",
  }),

  newPassword: Joi.string()
    .min(6)
    .invalid(Joi.ref("oldPassword")) // 🔥 منع نفس الباسورد
    .required()
    .messages({
      "any.required": "New password is required ❌",
      "string.min": "Password must be at least 6 chars ❌",
      "any.invalid": "New password must be different ❌",
    }),

  confirmNewPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match ❌",
      "any.required": "Confirm password is required ❌",
    }),
}).unknown(false);

// ================================
// 👑 CHANGE USER ROLE
// ================================
export const changeUserRoleSchema = Joi.object({
  role: Joi.number().valid(0, 1).required().messages({
    "any.required": "Role is required ❌",
    "any.only": "Role must be 0 (User) or 1 (Admin) ❌",
  }),
}).unknown(false);

// ================================
// 📄 PAGINATION (QUERY)
// ================================
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number ❌",
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number ❌",
    "number.max": "Max limit is 100 ❌",
  }),
}).unknown(false);

// ================================
// 🧠 OPTIONAL: APPROVE/REJECT PARAM (FUTURE SAFE)
// ================================
export const approveRejectSchema = Joi.object({
  paymentId: objectId.required(),
}).unknown(false);