// import Joi from "joi";
// import { generalFilds } from "../../Middlewares/validation.middleware.js";
// import { fileValidation } from "../../Utlis/multer/local.multer.js";


// export const updateProfilePicSchema = {
//     file: Joi
//     .object({
//         filename : generalFilds.file.filename.valid("attachments").required(),
//         originalname : generalFilds.file.originalname.required(),
//         mimetype : generalFilds.file.mimetype
//         .valid(...fileValidation.images)
//         .required(),
//         size : generalFilds.file.size
//         .max(5 * 1024 * 1024)
//         .required(), // 5MB
//         path : generalFilds.file.path.required(),
//         destination : generalFilds.file.destination.required(),
//         fieldname : generalFilds.file.fieldname.required(),
//         encoding : generalFilds.file.encoding.required(),
//         finalPath : generalFilds.file.finalPath.required(),
//     }).required()
// };

// export const coverImagesValidation = {
//     files: Joi
//     .object({
//         filename : generalFilds.file.filename.valid("attachments").required(),
//         originalname : generalFilds.file.originalname.required(),
//         mimetype : generalFilds.file.mimetype
//         .valid(...fileValidation.images)
//         .required(),
//         size : generalFilds.file.size
//         .max(5 * 1024 * 1024)
//         .required(), // 5MB
//         path : generalFilds.file.path.required(),
//         destination : generalFilds.file.destination.required(),
//         fieldname : generalFilds.file.fieldname.required(),
//         encoding : generalFilds.file.encoding.required(),
//         finalPath : generalFilds.file.finalPath.required(),
//     }).required(),
// };

// export const updatePasswordSchema = {
//  body: Joi.object({
//     oldPassword: generalFilds.password.required(),
//     newPassword: generalFilds.password.required(),
//     confirmNewPassword: Joi.ref("newPassword")
//  })
// };

// export const freezeAccountSchema = {
//     params: Joi.object({
//         userId: generalFilds.id,
//     }),
// };

// export const restoreAccountSchema = {
//     params: Joi.object({
//         userId: generalFilds.id,
//     }),
// };

// export const hardDeleteAccountSchema = {
//     params: Joi.object({
//         userId: generalFilds.id,
//     }),
// };


// export const getPremiumStatusSchema = {
//   params: Joi.object({
//     userId: generalFilds.id.required(),
//   }),
// };


// export const manualPaymentSchema = {
//     body: Joi.object({
//         amount: Joi.number().required(),
//         description: Joi.string().required(),
//     }),
// };

// // backend/src/modules/user/user.validation.js

// export const updateProfileSchema = {
//   body: Joi.object({
//     firstName: Joi.string().min(2).max(25).optional(),
//     lastName: Joi.string().min(2).max(25).optional(),
//     phone: Joi.string().optional(),
//     bio: Joi.string().max(500).optional(),
//     country: Joi.string().optional(),
//     address: Joi.string().optional(),
//     website: Joi.string().uri().optional(),
//     DOB: Joi.date().optional(),
//     gender: Joi.string().valid("male", "female", "other").optional(),
//   }),
// };
// export const updatePersonalInfoSchema = {
//   body: Joi.object({
//     firstName: Joi.string().min(2).max(25),
//     lastName: Joi.string().min(2).max(25),
//   }),
// };
import Joi from "joi";
import { generalFilds } from "../../Middlewares/validation.middleware.js";
import { fileValidation } from "../../Utlis/multer/local.multer.js";

export const updateProfilePicSchema = {
    file: Joi.object({
        fieldname: Joi.string().valid("attachments").required(),
        originalname: Joi.string().required(),
        encoding: Joi.string().required(),
        mimetype: Joi.string().valid(...fileValidation.images).required(),
        size: Joi.number().max(5 * 1024 * 1024).required(),
        destination: Joi.string().required(),
        filename: Joi.string().required(),
        path: Joi.string().required(),
        // ✅ اجعل finalPath اختياري تماماً
        finalPath: Joi.any().optional(),
    }).unknown(true) // ✅ السماح بحقول إضافية
};

export const coverImagesValidation = {
    files: Joi.array().items(
        Joi.object({
            fieldname: Joi.string().valid("attachments").required(),
            originalname: Joi.string().required(),
            encoding: Joi.string().required(),
            mimetype: Joi.string().valid(...fileValidation.images).required(),
            size: Joi.number().max(5 * 1024 * 1024).required(),
            destination: Joi.string().required(),
            filename: Joi.string().required(),
            path: Joi.string().required(),
            finalPath: Joi.string().optional(),
        })
    ).min(1).max(5).required()
};

export const updatePasswordSchema = {
 body: Joi.object({
    oldPassword: generalFilds.password.required(),
    newPassword: generalFilds.password.required(),
    confirmNewPassword: Joi.ref("newPassword")
 })
};

export const freezeAccountSchema = {
    params: Joi.object({
        userId: generalFilds.id,
    }),
};

export const restoreAccountSchema = {
    params: Joi.object({
        userId: generalFilds.id,
    }),
};

export const hardDeleteAccountSchema = {
    params: Joi.object({
        userId: generalFilds.id,
    }),
};

export const getPremiumStatusSchema = {
  params: Joi.object({
    userId: generalFilds.id.required(),
  }),
};

export const manualPaymentSchema = {
    body: Joi.object({
        amount: Joi.number().required(),
        description: Joi.string().required(),
    }),
};

export const updateProfileSchema = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(25).optional(),
    lastName: Joi.string().min(2).max(25).optional(),
    phone: Joi.string().optional(),
    bio: Joi.string().max(500).optional(),
    country: Joi.string().optional(),
    address: Joi.string().optional(),
    website: Joi.string().uri().optional(),
    DOB: Joi.date().optional(),
    gender: Joi.string().valid("male", "female", "other").optional(),
  }),
};

export const updatePersonalInfoSchema = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(25),
    lastName: Joi.string().min(2).max(25),
  }),
};