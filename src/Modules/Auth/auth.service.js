import { create } from "node:domain";
import UserModel from "../../DB/models/user.model.js";
import { ConflictException, NotFoundException } from "../../Utlis/response/error.response.js";
import { successResponse } from "../../Utlis/response/succes.response.js";


export const signup = async (req , res) => {

    const { firstName, lastName, email, password, DOB, phone, gender, role, provider, confirmEmail, profilePic } = req.body;
    
    //check if user already exists
    if (await findOne({ model: UserModel, filter: { email } }))
        throw ConflictException({message :  "User already exists"  });

    const user = await create({
         model: UserModel,
          data: [{ firstName, lastName, email, password, DOB, phone, gender, role, provider, confirmEmail, profilePic }],
         });

    return successResponse ({res, statusCode: 201, message: "User created successfully", data: user})     
};


export const login = async (req , res) => {
    const { email, password } = req.body;
    const user = !(await findOne({ model: UserModel, filter: { email, password } }))
     if (user)
        throw NotFoundException({message :  "User Not Found" });

     return successResponse ({
        res, 
        statusCode: 200, 
        message: "User logged in successfully", 
        data: {user},
    });
};

