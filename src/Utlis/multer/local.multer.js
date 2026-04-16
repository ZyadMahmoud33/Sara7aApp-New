import multer from "multer";
import path from "node:path";
import fs from "node:fs";


export const fileValidation = {
    images: ["image/jpeg", "image/png", "image/gif", "image/webp","image/jpg"],
    videos: ["video/mp4", "video/webm", "video/ogg","video/mov","video/avi","video/wmv","video/flv","video/mkv"],
    audios: ["audio/mpeg", "audio/wav", "audio/ogg","audio/mp3","audio/aac","audio/flac","audio/wma","audio/m4a"],
    documents: ["application/pdf","application/x-pdf","application/octet-stream","application/msword"],
};

export const localFileUpload = ({ 
    customPath = "general", 
    validation = [], 
}) => {
    const basePath = `uploads/${customPath}`;

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            let userBasePath = basePath;
            if (req.user?._id) userBasePath += `/${req.user._id}`;
            const fullPath = path.resolve(`./src/${userBasePath}`);
            if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
            cb(null, path.resolve(fullPath));
        },
        filename: (req, file, cb) => {
            const uniqueFileName =
                Date.now() +
                "_" +
                Math.round(Math.random() * 1e9) +
                "_" +
                file.originalname;
            file.finalPath = `${basePath}/${req.user._id}/${uniqueFileName}`;
            cb(null, uniqueFileName);
        },
    });

    const fileFilter = (req, file, cb) => {
        if (validation.includes(file.mimetype)) {
            cb(null, true);
        } else {
           return cb(new Error("Invalid file type"), false);
        }
    }

    return multer({ fileFilter, storage }); 
};
