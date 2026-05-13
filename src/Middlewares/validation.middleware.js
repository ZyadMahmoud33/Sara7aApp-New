// import joi from "joi";
// import { BadRequestException } from "../Utlis/response/error.response.js";
// import { Types } from "mongoose";
// import { GenderEnum, RoleEnum, ProviderEnum } from "../Utlis/enumes/user.enumes.js";

// export const generalFilds = {
//      firstName: joi
//           .string()
//           .alphanum()
//           .min(3)
//           .max(25)
//           .messages({
//             "any.required": "First name is required",
//             "string.min": "First name must be at least 3 characters",
//             "string.max": "First name must be at most 25 characters",
//           }),
    
//         lastName: joi
//           .string()
//           .alphanum()
//           .min(3)
//           .max(25)
//           .messages({
//             "any.required": "Last name is required",
//             "string.min": "Last name must be at least 3 characters",
//             "string.max": "Last name must be at most 25 characters",
//           }),
    
//         email: joi
//           .string()
//           .email({
//             tlds: { allow: ["com", "net", "org"] },
//           }),
    
//         age: joi.number().positive().integer(),
    
//         password: joi.string(),
    
//         confirmPassword: joi.ref("password"),
        
//         phone: joi
//           .string()
//           .pattern(/^(\+20|020|0)?1[0125][0-9]{8}$/)
//           .messages({
//             "string.pattern.base": "Invalid Phone Number",
//           }),
//         id: joi.string().custom((value, helpers) => {
//             return Types.ObjectId.isValid(value) || helpers.message("Invalid ID");
//         }),
//         gender: joi.string().valid(...Object.values(GenderEnum)),
//         role: joi.string().valid(...Object.values(RoleEnum)),
//         provider: joi.string().valid(...Object.values(ProviderEnum)),
//         file: {
//           fieldname: joi.string(),
//           originalname: joi.string(),
//           encoding: joi.string(),
//           mimetype: joi.string(),
//           destination: joi.string(),
//           filename: joi.string(),
//           path: joi.string(),
//           size: joi.number().positive(),
//           finalPath: joi.string(),
//         },  
//         otp: joi.string().pattern(/^\d{6}$/),
//         premium: joi.boolean(),
// };

// export const validation = (schema) => {
//     return (req, res, next) => {
//         const validationError = [];
//         for (const key of Object.keys(schema)) {
//     const validationResults = schema[key].validate(req[key], {
//                 abortEarly: false,
//             });
//         if(validationResults.error){
//             validationError.push({key, details: validationResults.error.details});
//         }
//         if(validationError.length){
//             throw BadRequestException({
//                 message: "ValidationError"},
//                 validationError           
//             );
//         }
//         return next();
//     }
//   };
// };

import joi from "joi";
import { BadRequestException } from "../Utlis/response/error.response.js";
import { Types } from "mongoose";
import { GenderEnum, RoleEnum, ProviderEnum } from "../Utlis/enumes/user.enumes.js";


export const generalFilds = {
     firstName: joi
          .string()
          .alphanum()
          .min(3)
          .max(25)
          .messages({
            "any.required": "First name is required",
            "string.min": "First name must be at least 3 characters",
            "string.max": "First name must be at most 25 characters",
          }),
    
        lastName: joi
          .string()
          .alphanum()
          .min(3)
          .max(25)
          .messages({
            "any.required": "Last name is required",
            "string.min": "Last name must be at least 3 characters",
            "string.max": "Last name must be at most 25 characters",
          }),
    
        email: joi
          .string()
          .email({
            tlds: { allow: ["com", "net", "org"] },
          })
          .messages({
            "string.email": "Invalid email format",
            "any.required": "Email is required",
          }),
    
        age: joi.number().positive().integer().min(13).max(120).messages({
            "number.min": "Age must be at least 13",
            "number.max": "Age must be at most 120",
        }),
    
        password: joi.string().min(6).max(100).messages({
            "string.min": "Password must be at least 6 characters",
            "string.max": "Password must be at most 100 characters",
        }),
    
        confirmPassword: joi.ref("password"),
        
        phone: joi
          .string()
          .pattern(/^(\+20|020|0)?1[0125][0-9]{8}$/)
          .messages({
            "string.pattern.base": "Invalid Phone Number",
          }),
          
        id: joi.string().custom((value, helpers) => {
            return Types.ObjectId.isValid(value) || helpers.error("any.invalid");
        }).messages({
            "any.invalid": "Invalid ID format",
        }),
        
        gender: joi.string().valid(...Object.values(GenderEnum)).messages({
            "any.only": "Gender must be male, female, or other",
        }),
        
        role: joi.string().valid(...Object.values(RoleEnum)).messages({
            "any.only": "Invalid role",
        }),
        
        provider: joi.string().valid(...Object.values(ProviderEnum)).messages({
            "any.only": "Invalid provider",
        }),
        
        file: {
          fieldname: joi.string(),
          originalname: joi.string(),
          encoding: joi.string(),
          mimetype: joi.string(),
          destination: joi.string(),
          filename: joi.string(),
          path: joi.string(),
          size: joi.number().positive(),
          finalPath: joi.string().optional(), // ✅ اجعلها اختيارية
        },  
        
        otp: joi.string().pattern(/^\d{6}$/).messages({
            "string.pattern.base": "OTP must be 6 digits",
        }),
        
        premium: joi.boolean(),
        
        // ✅ إضافات جديدة
        username: joi.string().alphanum().min(3).max(30).messages({
            "string.min": "Username must be at least 3 characters",
            "string.max": "Username must be at most 30 characters",
            "string.alphanum": "Username can only contain letters and numbers",
        }),
        
        bio: joi.string().max(500).messages({
            "string.max": "Bio must be at most 500 characters",
        }),
        
        country: joi.string().max(100).messages({
            "string.max": "Country name is too long",
        }),
        
        city: joi.string().max(100).messages({
            "string.max": "City name is too long",
        }),
        
        address: joi.string().max(200).messages({
            "string.max": "Address is too long",
        }),
        
        website: joi.string().uri().messages({
            "string.uri": "Website must be a valid URL",
        }),
        
        DOB: joi.date().iso().max('now').messages({
            "date.max": "Birth date cannot be in the future",
            "date.iso": "Invalid date format",
        }),
        
        plan: joi.string().valid("free", "pro", "premium").messages({
            "any.only": "Plan must be free, pro, or premium",
        }),
        
        coins: joi.number().integer().min(0).messages({
            "number.min": "Coins cannot be negative",
        }),
        
        // ✅ للأدمن
        action: joi.string().valid("freeze", "restore", "delete").messages({
            "any.only": "Invalid action",
        }),
        
        reason: joi.string().max(500).messages({
            "string.max": "Reason is too long",
        }),
        
        // ✅ للمدفوعات
        amount: joi.number().positive().messages({
            "number.positive": "Amount must be positive",
        }),
        
        paymentMethod: joi.string().valid("stripe", "vodafone_cash", "instapay").messages({
            "any.only": "Invalid payment method",
        }),
        
        transactionId: joi.string().min(5).max(100).messages({
            "string.min": "Transaction ID is too short",
        }),
        
        // ✅ للرسائل
        messageId: joi.string().custom((value, helpers) => {
            return Types.ObjectId.isValid(value) || helpers.error("any.invalid");
        }).messages({
            "any.invalid": "Invalid message ID format",
        }),
        
        content: joi.string().min(2).max(500).messages({
            "string.min": "Content must be at least 2 characters",
            "string.max": "Content must be at most 500 characters",
        }),
        
        isAnonymous: joi.boolean(),
        
        // ✅ فلترة وباجينيشن
        page: joi.number().integer().min(1).default(1).messages({
            "number.min": "Page must be at least 1",
        }),
        
        limit: joi.number().integer().min(1).max(100).default(20).messages({
            "number.min": "Limit must be at least 1",
            "number.max": "Limit cannot exceed 100",
        }),
        
        search: joi.string().max(100).allow('', null),
        
        startDate: joi.date().iso(),
        
        endDate: joi.date().iso().min(joi.ref("startDate")).messages({
            "date.min": "End date must be after start date",
        }),
        
        status: joi.string().valid("pending", "approved", "rejected", "all").messages({
            "any.only": "Invalid status",
        }),
        
        format: joi.string().valid("csv", "json", "excel").default("csv"),
};
export const validation = (schema) => {
    return (req, res, next) => {
        const validationError = [];
        for (const key of Object.keys(schema)) {
            // ✅ تحقق من وجود req[key] قبل التحقق
            if (!req[key] && schema[key]?.required) {
                validationError.push({ key, details: [{ message: `${key} is required` }] });
                continue;
            }
            
            const validationResults = schema[key].validate(req[key], {
                abortEarly: false,
            });
            
            if(validationResults.error){
                validationError.push({key, details: validationResults.error.details});
            }
        }
        
        if(validationError.length){
            console.error("Validation errors:", JSON.stringify(validationError, null, 2));
            throw BadRequestException({
                message: "ValidationError",
                details: validationError
            });
        }
        return next();
    };
};