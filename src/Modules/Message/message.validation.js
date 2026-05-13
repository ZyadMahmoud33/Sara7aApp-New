import Joi from "joi";
import { generalFilds } from "../../Middlewares/validation.middleware.js";

// ================================
// 📩 SEND MESSAGE VALIDATION
// ================================
export const sendMessageValidation = {
    params: Joi.object({
        receiverId: generalFilds.id.required(),
    }),
    body: Joi.object({
        content: Joi.string().min(2).max(500).required().messages({
            "any.required": "Content is required ❌",
            "string.empty": "Content cannot be empty ❌",
            "string.min": "Message must be at least 2 characters long 📝",
            "string.max": "Message must be at most 500 characters long 📝",
        }),
    }),
};

// ================================
// 📥 GET MY MESSAGES VALIDATION (optional params)
// ================================
export const getMyMessagesValidation = {
    query: Joi.object({
        page: Joi.number().min(1).optional().default(1),
        limit: Joi.number().min(1).max(100).optional().default(20),
        filter: Joi.string().valid("all", "revealed", "hidden").optional(),
    }),
};

// ================================
// ❤️ LIKE MESSAGE VALIDATION
// ================================
export const likeMessageValidation = {
    params: Joi.object({
        messageId: generalFilds.id.required(),
    }),
};

// ================================
// 🔓 REVEAL SENDER VALIDATION
// ================================
export const revealSenderValidation = {
    params: Joi.object({
        messageId: generalFilds.id.required(),
    }),
};

// ================================
// 🔍 GET SINGLE MESSAGE BY ID
// ================================
export const getMessageByIdValidation = {
    params: Joi.object({
        messageId: generalFilds.id.required(),
    }),
};

// ================================
// 🗑 SOFT DELETE MESSAGE
// ================================
export const deleteMessageValidation = {
    params: Joi.object({
        messageId: generalFilds.id.required(),
    }),
};

// ================================
// ♻️ RESTORE MESSAGE
// ================================
export const restoreMessageValidation = {
    params: Joi.object({
        messageId: generalFilds.id.required(),
    }),
};

// ================================
// 💀 FORCE DELETE MESSAGE (PERMANENT)
// ================================
export const forceDeleteMessageValidation = {
    params: Joi.object({
        messageId: generalFilds.id.required(),
    }),
};

// ================================
// 👑 ADMIN: GET ALL MESSAGES
// ================================
export const getAllMessagesValidation = {
    query: Joi.object({
        page: Joi.number().min(1).optional().default(1),
        limit: Joi.number().min(1).max(100).optional().default(20),
        status: Joi.string().valid("all", "revealed", "hidden", "deleted").optional(),
        startDate: Joi.date().iso().optional(),
        endDate: Joi.date().iso().optional().min(Joi.ref("startDate")),
        search: Joi.string().max(100).optional(),
    }),
};

// ================================
// 👑 ADMIN: GET USER MESSAGES
// ================================
export const getUserMessagesValidation = {
    params: Joi.object({
        receiverId: generalFilds.id.required(),
    }),
    query: Joi.object({
        page: Joi.number().min(1).optional().default(1),
        limit: Joi.number().min(1).max(100).optional().default(20),
        status: Joi.string().valid("all", "revealed", "hidden").optional(),
    }),
};

// ================================
// 📊 ADMIN: GET MESSAGE STATS
// ================================
export const getMessageStatsValidation = {
    query: Joi.object({
        startDate: Joi.date().iso().optional(),
        endDate: Joi.date().iso().optional().min(Joi.ref("startDate")),
    }),
};

// ================================
// 🗑 ADMIN: BULK DELETE MESSAGES
// ================================
export const bulkDeleteMessagesValidation = {
    body: Joi.object({
        messageIds: Joi.array().items(generalFilds.id.required()).min(1).max(100).required(),
        permanent: Joi.boolean().optional().default(false),
    }),
};

// ================================
// 📤 ADMIN: EXPORT MESSAGES
// ================================
export const exportMessagesValidation = {
    query: Joi.object({
        format: Joi.string().valid("csv", "json", "excel").optional().default("csv"),
        startDate: Joi.date().iso().optional(),
        endDate: Joi.date().iso().optional().min(Joi.ref("startDate")),
        status: Joi.string().valid("all", "revealed", "hidden").optional(),
    }),
};

// ================================
// 🧹 ADMIN: DELETE OLD MESSAGES
// ================================
export const deleteOldMessagesValidation = {
    query: Joi.object({
        days: Joi.number().min(1).max(365).optional().default(30),
        permanent: Joi.boolean().optional().default(false),
    }),
};

// ================================
// 🔄 CHECK IF USER CAN REVEAL
// ================================
export const checkRevealStatusValidation = {
    params: Joi.object({
        messageId: generalFilds.id.required(),
    }),
};

// ================================
// 📝 UPDATE MESSAGE CONTENT (ADMIN ONLY)
// ================================
export const updateMessageValidation = {
    params: Joi.object({
        messageId: generalFilds.id.required(),
    }),
    body: Joi.object({
        content: Joi.string().min(2).max(500).required(),
    }),
};

// ================================
// 🔁 FORWARD MESSAGE
// ================================
export const forwardMessageValidation = {
    params: Joi.object({
        messageId: generalFilds.id.required(),
    }),
    body: Joi.object({
        targetUserId: generalFilds.id.required(),
    }),
};

// ================================
// 📌 REPORT MESSAGE
// ================================
export const reportMessageValidation = {
    params: Joi.object({
        messageId: generalFilds.id.required(),
    }),
    body: Joi.object({
        reason: Joi.string().min(5).max(500).required(),
        type: Joi.string().valid("spam", "harassment", "inappropriate", "other").default("other"),
    }),
};

// ================================
// 💬 REPLY TO MESSAGE
// ================================
export const replyToMessageValidation = {
    params: Joi.object({
        messageId: generalFilds.id.required(),
    }),
    body: Joi.object({
        content: Joi.string().min(2).max(500).required(),
        isAnonymous: Joi.boolean().optional().default(true),
    }),
};