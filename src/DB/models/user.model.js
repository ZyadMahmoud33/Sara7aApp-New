import mongoose from "mongoose";
import {
    GenderEnum,
    ProviderEnum,
    RoleEnum,
} from "../../Utlis/enumes/user.enumes.js";


const userSchema = new mongoose.Schema(

    { 
        firstName: {
            type: String,
            required: [true, "First name is required"],
            minlength: 2,
            maxlength: 25,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            minlength: 2,
            maxlength: 25,
        },
        email: {
            type: String,
            required: true, 
            unique: true,
        },
        password: {
            type: String,
            required: function() {
                return this.provider == ProviderEnum.System;
            },
        },

        otpCode: String,
        otpExpires: Date,
        isVerified: {
            type: Boolean,
            default: false
        },

        DOB: Date,
        age: Number,
        phone: String,
        gender: {
            type: Number,
            enum: Object.values(GenderEnum),
            default: GenderEnum.Male,
        },
        role: {
            type: Number,
            enum: Object.values(RoleEnum),
            default: RoleEnum.User,
        },
        provider: {
            type: Number,
            enum: Object.values(ProviderEnum),
            default: ProviderEnum.System,
        },
        confirmEmail:Date,
        profilePic:String, 
        coverImages:[String],
        isActive:Boolean,
        changeCredentialsTime:Date,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

 userSchema
 .virtual("username")
 .set(function(value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({firstName, lastName});
})
.get(function() {
    return `${this.firstName} ${this.lastName}`;
});

const UserModel = mongoose.model("User", userSchema);


export default UserModel;

