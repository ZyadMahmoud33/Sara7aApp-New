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
          }),
    
        age: joi.number().positive().integer(),
    
        password: joi.string().required(),
    
        confirmPassword: joi
          .any()
          .valid(joi.ref("password"))
          .messages({
            "any.only": "Passwords must match",
          }),
    
        phone: joi
          .string()
          .pattern(/^01[0125][0-9]{8}$/)
          .messages({
            "string.pattern.base": "Invalid Phone Number",
          }),
        id: joi.string().custom((value, helpers) => {
            return Types.ObjectId.isValid(value) || helpers.message("Invalid ID");
        }),
        gender: joi.string().valid(...Object.values(GenderEnum)),
        role: joi.string().valid(...Object.values(RoleEnum)),
        provider: joi.string().valid(...Object.values(ProviderEnum)),
        file: {
          fieldname: joi.string(),
          originalname: joi.string(),
          encoding: joi.string(),
          mimetype: joi.string(),
          destination: joi.string(),
          filename: joi.string(),
          path: joi.string(),
          size: joi.number().positive(),
          finalPath: joi.string(),
        },   
};

export const validation = (schema) => {
    return (req, res, next) => {
        const validationError = [];
        for (const key of Object.keys(schema)) {
              const validationResults = schema[key].validate(req[key], {
                abortEarly: false,
            });
        if(validationResults.error){
            validationError.push({key, details: validationResults.error.details});
        }
        if(validationError.length)
            throw BadRequestException({
                message: "ValidationError"},
                validationError           
            );
        return next();
    }
  };
};