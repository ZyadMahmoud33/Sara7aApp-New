import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 500,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isAnonymous: { 
      type: Boolean, 
      default: true 
    },
    isRevealed: { 
      type: Boolean, 
      default: false 
    },
    likes: { 
      type: Number, 
      default: 0 
    },           // ✅ عدد اللايكات
    likedBy: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }], // ✅ اللي عملوا لايك
    isDeleted: {
       type: Boolean, 
       default: false 
    },
    revealedBy: {
       type: mongoose.Types.ObjectId,
       ref: "User" 
    },
    deletedAt: Date,
    ipAddress: String,
    revealRequestedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null 
    },
    revealRequestedAt: { 
      type: Date, 
      default: null 
    },
    revealedAt: {
       type: Date, 
       default: null 
    },
    revealCode: { 
      type: String, 
      default: null 
    },
    isRevealApproved: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);


const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;