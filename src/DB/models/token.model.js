import mongoose from "mongoose";
import { Schema } from "mongoose";


const tokenSchema = new mongoose.Schema({
    jti : {
        type : String,
        required : true,
        unique : true,
    },
    userId : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    expiresIn : {
        type : Date,
        required : true,
    },

},
{
    timestamps : true,
});

tokenSchema.index("expiresIn", { expireAfterSeconds: 0 });

export const TokenModel = 
mongoose.models.Token || mongoose.model("Token", tokenSchema);

export default TokenModel;
