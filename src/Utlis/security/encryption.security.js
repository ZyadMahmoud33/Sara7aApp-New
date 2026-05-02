import crypto from "node:crypto";
import { ENCRYPTION_SECRET } from "../../../config/config.service.js";

const IV_LENGTH = 16; // For AES, this is always 16 bytes
const ENCRYPTION_SECRET_KEY = ENCRYPTION_SECRET; // 32 bytes for AES-256
//symmetric encryption Zyad
//secret key

export const encrypt = async (text) => {
    const iv = crypto.randomBytes(IV_LENGTH); // 16
    const cipher = crypto.createCipheriv(
        "aes-256-cbc", 
        ENCRYPTION_SECRET_KEY, 
        iv,
    );
    let encryptedData = cipher.update(text, "utf-8", "hex");    
    encryptedData += cipher.final("hex");
    return `${iv.toString("hex")}:${encryptedData}`;
};

export const decrypt = async (encryptedData) => {
    const [iv, encryptedText] = encryptedData.split(":");

    const binaryLike = Buffer.from(iv, "hex");

    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        ENCRYPTION_SECRET_KEY,
        binaryLike,
    );
    console.log({decipher});

    let decryptedData = decipher.update(
        encryptedText, 
        "hex", 
        "utf-8"
    );

    decryptedData += decipher.final("utf-8");
    
    return decryptedData;
};
