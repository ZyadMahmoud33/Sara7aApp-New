import { decrypt } from "../../Utlis/security/encryption.security.js";
import { successResponse } from "../../Utlis/response/succes.response.js";
import UserModel from "../../DB/models/user.model.js";
import { ErrorClass } from "../../Utlis/response/error.response.js";
import { findOneAndUpdate } from "../../DB/models/database.repository.js";

export const getprofile = async (req, res) => {
    req.user.phone = await decrypt(req.user.phone)
    return successResponse ({
        res, 
        message: "Done", 
        statusCode: 200,
        data: req.user,
    });
    
};

export const uploadProfilePic = async (req, res) => {
    const user = await findOneAndUpdate ({
        model: UserModel,
        id: req.user._id,
        update: { profilePic: req.file.finalPath },
    })
    return successResponse ({
        res, 
        message: "Done", 
        statusCode: 200,
        data: user,
    });
    
};


export const uploadCoverPic = async (req, res) => {
    const user = await findOneAndUpdate ({
        model: UserModel,
        id: req.user._id,
        update: { coverImages: req.files?.map((file) => file.finalPath)},
    })
    return successResponse ({
        res, 
        message: "Done", 
        statusCode: 200,
        data: user,
    });
    
};

