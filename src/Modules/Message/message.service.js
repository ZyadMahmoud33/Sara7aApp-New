import { create, find, findById } from "../../DB/models/database.repository.js";
import UserModel from "../../DB/models/user.model.js";
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "../../Utlis/response/error.response.js";
import MessageModel from "../../DB/models/message.model.js";
import { successResponse } from "../../Utlis/response/succes.response.js";

// =========================
// 📩 SEND MESSAGE (معدل - يمنع الإرسال من غير تسجيل دخول)
// =========================
export const sendMessage = async (req, res) => {
  const { receiverId } = req.params;
  const { content } = req.body;

  // ✅ تأكد من وجود req.user (من middleware authentication)
  if (!req.user || !req.user._id) {
    return res.status(401).json({ 
      success: false, 
      message: "You must be logged in to send messages" 
    });
  }

  const user = await findById({
    model: UserModel,
    id: receiverId,
  });

  if (!user) throw NotFoundException({ message: "User not found" });
  if (!content?.trim())
    throw BadRequestException({ message: "Content required" });

  const message = await create({
    model: MessageModel,
    data: [
      {
        content,
        receiverId,
        senderId: req.user._id, // ✅ من req.user بعد authentication
        isAnonymous: true,
        isRevealed: false,
        ipAddress: req.ip,
        likes: 0,
      },
    ],
  });

  return successResponse({
    res,
    message: "Message sent ✅",
    data: { message },
  });
};

// =========================
// 📥 GET MY MESSAGES (معدل)
// =========================
export const getMessage = async (req, res) => {
  const userId = req.user._id;

  const messages = await find({
    model: MessageModel,
    filter: {
      receiverId: userId,
      isDeleted: { $ne: true },
    },
    populate: [
      {
        path: "senderId",
        select: "firstName lastName username profilePic _id",
      },
      {
        path: "revealedBy",
        select: "firstName lastName username",
      },
    ],
    sort: { createdAt: -1 },
  });

  const safeMessages = messages.map((msg) => {
    const messageObj = {
      _id: msg._id,
      content: msg.content,
      createdAt: msg.createdAt,
      likes: msg.likes || 0,
      isRevealed: msg.isRevealed,
      isAnonymous: msg.isAnonymous,
      revealedAt: msg.revealedAt,
    };

    // ✅ إذا تم الكشف، أظهر بيانات المرسل كاملة
    if (msg.isRevealed && msg.senderId) {
      messageObj.sender = {
        _id: msg.senderId._id,
        firstName: msg.senderId.firstName,
        lastName: msg.senderId.lastName,
        username: msg.senderId.username,
        profilePic: msg.senderId.profilePic,
      };
      messageObj.revealedBy = msg.revealedBy;
    } 
    // ✅ إذا لسه مجهولة
    else {
      messageObj.sender = null;
      messageObj.canReveal = !msg.isRevealed && msg.isAnonymous;
    }

    return messageObj;
  });

  return successResponse({
    res,
    message: "User messages fetched successfully",
    data: { messages: safeMessages },
  });
};

// =========================
// ❤️ LIKE MESSAGE
// =========================
export const likeMessage = async (req, res) => {
  const { messageId } = req.params;

  const message = await findById({
    model: MessageModel,
    id: messageId,
  });

  if (!message)
    throw NotFoundException({ message: "Message not found" });

  message.likes = (message.likes || 0) + 1;
  await message.save();

  return successResponse({
    res,
    message: "Liked ❤️",
    data: { likes: message.likes },
  });
};

// =========================
// 🗑 DELETE MESSAGE
// =========================
export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  const message = await findById({
    model: MessageModel,
    id: messageId,
  });

  if (!message)
    throw NotFoundException({ message: "Message not found" });

  if (message.receiverId.toString() !== req.user._id.toString()) {
    throw ForbiddenException({ message: "Not allowed ❌" });
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  await message.save();

  return successResponse({
    res,
    message: "Moved to trash 🗑",
  });
};

// =========================
// ♻️ RESTORE MESSAGE
// =========================
export const restoreMessage = async (req, res) => {
  const { messageId } = req.params;

  const message = await findById({
    model: MessageModel,
    id: messageId,
  });

  if (!message)
    throw NotFoundException({ message: "Message not found" });

  message.isDeleted = false;
  message.deletedAt = null;
  await message.save();

  return successResponse({
    res,
    message: "Restored ✅",
  });
};

// =========================
// 🔓 REVEAL SENDER (معدل بالكامل)
// =========================
export const revealSender = async (req, res) => {
  try {
    const { messageId } = req.params;
    const user = req.user;

    const freshUser = await UserModel.findById(user._id).select("coins plan");
    
    if (!freshUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const message = await MessageModel.findById(messageId)
      .populate("senderId", "firstName lastName username profilePic _id");
      
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.receiverId.toString() !== freshUser._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    if (message.isRevealed) {
      return res.status(400).json({ success: false, message: "Already revealed" });
    }

    // ✅ منع الكشف إذا كان المرسل غير مسجل
    if (!message.senderId) {
      return res.status(400).json({ 
        success: false, 
        message: "This message was sent before login requirement. Sender identity cannot be revealed.",
        isGuest: true
      });
    }

    const REVEAL_COST = 5;

    if (freshUser.plan === "pro") {
      if (freshUser.coins < REVEAL_COST) {
        return res.status(400).json({ 
          success: false, 
          message: `Not enough coins! Need ${REVEAL_COST}, you have ${freshUser.coins}` 
        });
      }
      
      freshUser.coins -= REVEAL_COST;
      await freshUser.save();
    }

    message.isRevealed = true;
    message.revealedBy = freshUser._id;
    message.revealedAt = new Date();
    await message.save();

    const senderData = {
      _id: message.senderId._id,
      firstName: message.senderId.firstName,
      lastName: message.senderId.lastName,
      username: message.senderId.username,
      profilePic: message.senderId.profilePic,
    };

    return res.status(200).json({
      success: true,
      message: freshUser.plan === "premium" 
        ? "Sender revealed successfully! ✨" 
        : `Sender revealed successfully! -${REVEAL_COST} coins 💰`,
      data: { 
        remainingCoins: freshUser.coins,
        sender: senderData,
        revealedAt: message.revealedAt
      }
    });

  } catch (error) {
    console.error("Reveal error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================
// 🔍 GET SINGLE MESSAGE WITH SENDER
// =========================
export const getMessageById = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await MessageModel.findById(messageId)
      .populate("senderId", "firstName lastName username profilePic _id")
      .populate("receiverId", "firstName lastName username")
      .populate("revealedBy", "firstName lastName username");

    if (!message) {
      throw NotFoundException({ message: "Message not found" });
    }

    const isReceiver = message.receiverId._id.toString() === userId.toString();
    const isSender = message.senderId && message.senderId._id.toString() === userId.toString();

    if (!isReceiver && !isSender) {
      throw ForbiddenException({ message: "Not authorized" });
    }

    const response = {
      _id: message._id,
      content: message.content,
      createdAt: message.createdAt,
      likes: message.likes,
      isAnonymous: message.isAnonymous,
      isRevealed: message.isRevealed,
    };

    if (message.isRevealed && message.senderId) {
      response.sender = {
        _id: message.senderId._id,
        firstName: message.senderId.firstName,
        lastName: message.senderId.lastName,
        username: message.senderId.username,
        profilePic: message.senderId.profilePic,
      };
      response.revealedAt = message.revealedAt;
      response.revealedBy = message.revealedBy;
    } 
    else if (message.isAnonymous && !message.isRevealed) {
      response.sender = null;
      response.canReveal = isReceiver;
    }

    return successResponse({
      res,
      message: "Message fetched successfully",
      data: response,
    });

  } catch (error) {
    console.error("Get message error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// =========================
// 💀 FORCE DELETE
// =========================
export const forceDeleteMessage = async (req, res) => {
  const { messageId } = req.params;

  const message = await findById({
    model: MessageModel,
    id: messageId,
  });

  if (!message)
    throw NotFoundException({ message: "Message not found" });

  await message.deleteOne();

  return successResponse({
    res,
    message: "Deleted forever 💀",
  });
};

// =========================
// 👑 ADMIN
// =========================
export const getAllMessages = async (req, res) => {
  const messages = await find({
    model: MessageModel,
    populate: [
      { path: "receiverId", select: "email firstName lastName" },
      { path: "senderId", select: "email firstName lastName username profilePic" },
      { path: "revealedBy", select: "firstName lastName" },
    ],
  });

  return successResponse({
    res,
    message: "All messages",
    data: { messages },
  });
};

export const getUserMessages = async (req, res) => {
  const { receiverId } = req.params;

  const messages = await find({
    model: MessageModel,
    filter: { receiverId },
    populate: [
      { path: "senderId", select: "firstName lastName username profilePic" },
    ],
    sort: { createdAt: -1 },
  });

  return successResponse({
    res,
    message: "User messages fetched successfully",
    data: { messages },
  });
};