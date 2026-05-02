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
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: 2,
      maxlength: 25,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.System;
      },
    },

    otpCode: String,
    otpExpires: Date,

    isVerified: {
      type: Boolean,
      default: false,
    },

    isRevealed: {
      type: Boolean,
      default: false,
    },
    country: {
  type: String,
  trim: true,
  default: "",
  },
    address: {
    type: String,
     trim: true,
     default: "",
    },
    bio: {
     type: String,
     maxlength: 500,
     trim: true,
     default: "",
    },
    website: {
     type: String,
     trim: true,
     default: "",
    },

    // ===============================
    // 💎 PLAN SYSTEM
    // ===============================
    plan: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },

    premiumExpiresAt: {
      type: Date,
      default: null,
    },

    coins: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ===============================
    // 👤 PERSONAL
    // ===============================
    DOB: Date,
    age: Number,
    phone: String,

    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.Male,
    },

    // ===============================
    // 🔐 ROLE SYSTEM
    // ===============================
    role: {
      type: Number,
      enum: Object.values(RoleEnum),
      default: RoleEnum.User,
    },

    adminLevel: {
      type: Number,
      enum: [0, 1], // 0 = super admin
      default: 1,
    },

    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ===============================
    // 🔗 PROVIDER
    // ===============================
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.System,
    },

    // ===============================
    // 🔐 AUTH
    // ===============================
    confirmEmailOtp: String,
    resendOtp: String,
    confirmEmail: String,
    forgetPasswordOTP: String,

    changeCredentialsTime: Date,

    // ===============================
    // 🖼 MEDIA
    // ===============================
    profilePic: String,
    coverImages: [String],

    // ===============================
    // ⚙️ STATUS
    // ===============================
    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: Date,

    freezedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    freezedAt: Date,

    restoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    restoredAt: Date,
    dailyAdWatched: {
     type: Number,
     default: 0,
    },
    lastAdWatchDate: {
     type: String,
     default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===============================
// 🔥 Virtual Username
// ===============================
userSchema
  .virtual("username")
  .set(function (value) {
    if (!value) return;

    const parts = value.trim().split(" ");

    this.firstName = parts[0];
    this.lastName = parts[1] || "";
  })
  .get(function () {
    return `${this.firstName || ""} ${this.lastName || ""}`.trim();
  });

// ===============================
// 💎 Virtual isPremium
// ===============================
userSchema.virtual("isPremium").get(function () {
  if (this.plan === "free") return false;

  if (!this.premiumExpiresAt) return false;

  return this.premiumExpiresAt > new Date();
});

// ===============================
// 🔥 HELPER: CHECK PREMIUM VALID
// ===============================
userSchema.methods.isPremiumActive = function () {
  return (
    this.plan !== "free" &&
    this.premiumExpiresAt &&
    this.premiumExpiresAt > new Date()
  );
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;