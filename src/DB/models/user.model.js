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
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function(v) {
                    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
                },
                message: "Please enter a valid email"
            }
        },
        password: {
            type: String,
            required: function() {
                return this.provider == ProviderEnum.System;
            },
        },
        DOB:Date,
        phone:String,
        gender: {
            type: String,
            enum: Object.values(GenderEnum),
            default: GenderEnum.Male,
        },
        role: {
            type: String,
            enum: Object.values(RoleEnum),
            default: RoleEnum.User,
        },
        provider: {
            type: String,
            enum: Object.values(ProviderEnum),
            default: ProviderEnum.System,
        },
        confirmEmail:Date,
        profilePic:String, 
    },
    {
        timestamp: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

 userSchema.virtual("username").set(function(value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({firstName, lastName})
}).get(function() {
    return `${this.firstName} ${this.lastName}`;
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;

