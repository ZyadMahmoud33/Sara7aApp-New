import Joi from "joi";
import { generalFilds } from "../../Middlewares/validation.middleware.js";

export const sendMessageValidation = ({
    params: Joi.object({
        receiverId: generalFilds.id.required(),
    }),
    body: Joi.object({
        content: Joi.string().min(2).max(500).required().messages({
            "any.required": 'Content is required',
            "string.min": "Message must be at least 2 characters long",
            "string.max": "Message must be at most 500 characters long",
        }),
    }),
});
