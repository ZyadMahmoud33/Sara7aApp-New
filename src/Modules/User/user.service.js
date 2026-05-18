import { decrypt } from "../../Utlis/security/encryption.security.js";
import { successResponse } from "../../Utlis/response/succes.response.js";
import UserModel from "../../DB/models/user.model.js";
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "../../Utlis/response/error.response.js";

import {
  findOneAndUpdate,
  updateOne,
  findById,
} from "../../DB/models/database.repository.js";

import {
  compareHash,
  generateHash,
} from "../../Utlis/security/hash.security.js";

import { HashEnum } from "../../Utlis/enumes/security.enum.js";
import { RoleEnum } from "../../Utlis/enumes/user.enumes.js";

import Stripe from "stripe";
import ManualPaymentModel from "../../DB/models/manualPayment.model.js";
import { v2 as cloudinary } from 'cloudinary';


// ======================================
// 👤 GET PROFILE (SAFE)
// ======================================
export const getprofile = async (req, res) => {
  const user = { ...req.user._doc };

  if (user.phone) {
    try {
      user.phone = await decrypt(user.phone);
    } catch {
      user.phone = null;
    }
  }

  return successResponse({
    res,
    message: "Done",
    data: user,
  });
};

// ======================================
// 🔍 GET USER BY USERNAME
// ======================================
export const getUserByUsername = async (req, res) => {
  const { username } = req.params;

  const user = await UserModel.findOne({
    username,
    freezedAt: { $exists: false },
  }).select("_id username profilePic");

  if (!user) {
    throw NotFoundException({ message: "User not found" });
  }

  return successResponse({
    res,
    data: user,
  });
};

// ======================================
// 🔍 GET USER BY ID
// ======================================
export const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await findById({
    model: UserModel,
    id,
  });

  if (!user) {
    throw NotFoundException({ message: "User not found" });
  }

  return successResponse({
    res,
    data: { user },
  });
};


cloudinary.config({
  cloud_name: 'djcz9btpd',
  api_key: '829692148814921',
  api_secret: 'b1TZxGW4l5WQ4jeny1u_LnIS53M',
});

// ======================================
// 📸 UPLOAD PROFILE PIC
// ======================================
export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      throw new BadRequestException("Image required ❌");
    }
    
    console.log("📁 Original file path:", req.file.path);
    
    // ✅ رفع الصورة لـ Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `Users/${req.user._id}`,
      transformation: [{ width: 500, height: 500, crop: "fill" }]
    });
    
    console.log("✅ Cloudinary upload success:", result.secure_url);
    
    const user = await findOneAndUpdate({
      model: UserModel,
      filter: { _id: req.user._id },
      update: { profilePic: result.secure_url },
      options: { new: true },
    });
    
    return successResponse({
      res,
      message: "Profile updated ✅",
      data: { profilePic: user.profilePic },
    });
    
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// 🖼 UPLOAD COVER
// ======================================
export const uploadCoverPic = async (req, res) => {
  const user = await findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    update: {
      coverImages: req.files?.map((file) => file.finalPath) || [],
    },
  });

  return successResponse({
    res,
    message: "Cover updated ✅",
    data: user,
  });
};

// ======================================
// 🔐 UPDATE PASSWORD
// ======================================
export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  const user = await findById({
    model: UserModel,
    id: req.user._id,
  });

  const isValid = await compareHash({
    plaintext: oldPassword,
    ciphertext: user.password,
    algo: HashEnum.Argon,
  });

  if (!isValid) {
    throw BadRequestException("Wrong password ❌");
  }

  if (newPassword !== confirmNewPassword) {
    throw BadRequestException("Passwords do not match ❌");
  }

  if (oldPassword === newPassword) {
    throw BadRequestException("New password must be different ❌");
  }

  const hash = await generateHash({
    plaintext: newPassword,
    algo: HashEnum.Argon,
  });

  await updateOne({
    model: UserModel,
    filter: { _id: req.user._id },
    update: { password: hash },
  });

  return successResponse({
    res,
    message: "Password updated 🔥",
  });
};
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_dummy_12345') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log("✅ Stripe initialized");
} else {
  console.warn("⚠️ Stripe not configured - payment features disabled");
}
// ======================================
// 🚫 DISABLED (SECURITY)
// ======================================
// ❌ متستخدمش دي في production
export const upgradePlan = async (req, res) => {
  // ✅ التحقق من Stripe
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: "Payment service is temporarily unavailable"
    });
  }

  const { plan } = req.body;
  const prices = { pro: 200, premium: 500 };
  
  if (!plan || !prices[plan]) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan. Use 'pro' or 'premium'",
    });
  }
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: `${plan.toUpperCase()} Plan` },
        unit_amount: prices[plan],
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/payment-success`,
    cancel_url: `${process.env.CLIENT_URL}/premium`,
    metadata: { userId: req.user._id.toString(), plan },
  });
  
  return res.status(200).json({ success: true, url: session.url });
};
// ======================================
// 💳 STRIPE
// ======================================
// ✅ اجعل Stripe اختيارياً



// ======================================
// 💳 CREATE CHECKOUT
// ======================================
export const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;

    const prices = {
      pro: 200,
      premium: 500,
    };

    if (!prices[plan]) {
      throw BadRequestException("Invalid plan ❌");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.toUpperCase()} Plan`,
            },
            unit_amount: prices[plan],
          },
          quantity: 1,
        },
      ],

      mode: "payment",

      // ⚠️ مهم: دي UI بس مش تأكيد
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/premium`,

      metadata: {
        userId: req.user._id.toString(),
        plan,
      },
    });

    return res.status(200).json({
      url: session.url,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// ======================================
// 💵 MANUAL PAYMENT
// ======================================
export const createManualPayment = async (req, res) => {
  try {
    const { plan, method } = req.body;

    const allowedMethods = ["vodafone_cash", "instapay"];

    if (!plan || !method) {
      throw BadRequestException("Plan & method required ❌");
    }

    if (!allowedMethods.includes(method)) {
      throw BadRequestException("Invalid payment method ❌");
    }

    if (!req.file) {
      throw BadRequestException("Screenshot required ❌");
    }

    // 🔥 منع التكرار
    const existing = await ManualPaymentModel.findOne({
      userId: req.user._id,
      status: "pending",
    });

    if (existing) {
      throw BadRequestException(
        "You already submitted a request ⏳"
      );
    }

    const payment = await ManualPaymentModel.create({
      userId: req.user._id,
      plan,
      method,
      screenshot: req.file.finalPath,
      status: "pending",
    });

    return successResponse({
      res,
      message: "Payment submitted ⏳",
      data: payment,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const watchAd = async (req, res) => {
  const freshUser = await UserModel.findById(req.user._id).select("coins dailyAdWatched lastAdWatchDate");
  
  if (!freshUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const today = new Date().toDateString();
  const lastWatch = freshUser.lastAdWatchDate 
    ? new Date(freshUser.lastAdWatchDate).toDateString() 
    : null;

  // ✅ Reset لو يوم جديد
  if (lastWatch !== today) {
    freshUser.dailyAdWatched = 0;
    freshUser.lastAdWatchDate = today;
  }

  // ✅ تحقق من الليميت بعد الـ reset
  if (freshUser.dailyAdWatched >= 5) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return res.status(400).json({
      success: false,
      message: `Daily ad limit reached (5/5). Come back tomorrow!`,
      data: {
        dailyAdWatched: freshUser.dailyAdWatched,
        remainingAds: 0,
        canWatch: false,
        nextReset: tomorrow,
      }
    });
  }

  // ✅ أضف الكوين
  freshUser.coins += 5;
  freshUser.dailyAdWatched += 1;
  await freshUser.save();

  const remainingAds = 5 - freshUser.dailyAdWatched;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return successResponse({
    res,
    message: "You earned 5 coins! 🎉",
    data: { 
      coins: freshUser.coins, 
      dailyAdWatched: freshUser.dailyAdWatched,
      remainingAds,
      canWatch: remainingAds > 0,
      nextReset: tomorrow,
    },
  });
};

// backend/src/modules/user/user.service.js

// ✏️ UPDATE PROFILE INFO
export const updateProfile = async (req, res) => {
  try {
    console.log("=== UPDATE PROFILE DEBUG ===");
    console.log("1 - req.user._id:", req.user._id);
    console.log("2 - req.body:", req.body);
    
    const { firstName, lastName, phone, bio, country, address, website, DOB, gender } = req.body;
    
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (country !== undefined) updateData.country = country;
    if (address !== undefined) updateData.address = address;
    if (website !== undefined) updateData.website = website;
    if (DOB !== undefined) updateData.DOB = new Date(DOB);
    if (gender !== undefined) updateData.gender = gender;
    
    console.log("3 - updateData:", updateData);
    
    if (Object.keys(updateData).length === 0) {
      console.log("4 - No data to update");
      return successResponse({
        res,
        message: "No changes to update",
        data: req.user,
      });
    }
    
    const user = await findOneAndUpdate({
      model: UserModel,
      filter: { _id: req.user._id },
      update: updateData,
      options: { new: true },
    });
    
    console.log("5 - User updated:", user?._id);
    
    return successResponse({
      res,
      message: "Profile updated successfully ✅",
      data: user,
    });
    
  } catch (err) {
    console.error("=== UPDATE PROFILE ERROR ===");
    console.error("Error:", err);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update profile",
    });
  }
};

// 👤 UPDATE PERSONAL INFO (اسم + صورة)
export const updatePersonalInfo = async (req, res) => {
  const { firstName, lastName } = req.body;
  
  const user = await findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    update: { firstName, lastName },
  });

  return successResponse({
    res,
    message: "Personal info updated ✅",
    data: user,
  });
};