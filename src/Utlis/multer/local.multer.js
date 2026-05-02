// import multer from "multer";
// import path from "node:path";
// import fs from "node:fs";

// export const fileValidation = {
//   images: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"],
//   videos: ["video/mp4", "video/webm", "video/ogg"],
//   audios: ["audio/mpeg", "audio/wav", "audio/ogg"],
//   documents: ["application/pdf", "application/msword"],
// };

// export const localFileUpload = ({
//   customPath = "general",
//   validation = [],
// }) => {
//   const basePath = `uploads/${customPath}`;

//   const storage = multer.diskStorage({

//     // =========================
//     // 📂 DESTINATION
//     // =========================
//     destination: (req, file, cb) => {
//       const userId = req.user?._id;

//       if (!userId) {
//         return cb(new Error("User not authenticated ❌"));
//       }

//       const fullPath = path.resolve(`${basePath}/${userId}`);

//       // create folder if not exists
//       if (!fs.existsSync(fullPath)) {
//         fs.mkdirSync(fullPath, { recursive: true });
//       }

//       cb(null, fullPath);
//     },

//     // =========================
//     // 📝 FILENAME
//     // =========================
//     filename: (req, file, cb) => {
//       const uniqueFileName =
//         Date.now() +
//         "_" +
//         Math.round(Math.random() * 1e9) +
//         "_" +
//         file.originalname;

//       const userId = req.user?._id;

//       file.finalPath = `${basePath}/${userId}/${uniqueFileName}`;

//       cb(null, uniqueFileName);
//     },
//   });

//   // =========================
//   // 🔍 FILTER
//   // =========================
//   const fileFilter = (req, file, cb) => {
//       console.log("🔍 File filter - mimetype:", file.mimetype);
//       console.log("🔍 File filter - validation array:", validation);
//     if (validation.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error(`Invalid file type: ${file.mimetype}`), false);
//     }
//   };

//   return multer({ storage, fileFilter });
// };

import multer from "multer";
import path from "node:path";
import fs from "node:fs";

export const fileValidation = {
  images: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"],
  videos: ["video/mp4", "video/webm", "video/ogg"],
  audios: ["audio/mpeg", "audio/wav", "audio/ogg"],
  documents: ["application/pdf", "application/msword"],
};

export const localFileUpload = ({
  customPath = "general",
  validation = [],
}) => {
  const basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({

    // =========================
    // 📂 DESTINATION
    // =========================
    destination: (req, file, cb) => {
      // ✅ استخدام userId من req.user (اللي جا من الـ auth middleware)
      const userId = req.user?._id;

      if (!userId) {
        console.error("❌ No userId in destination!");
        return cb(new Error("User not authenticated ❌"));
      }

      const fullPath = path.resolve(`${basePath}/${userId}`);

      // create folder if not exists
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      console.log("📂 Destination path:", fullPath);
      cb(null, fullPath);
    },

    // =========================
    // 📝 FILENAME
    // =========================
    filename: (req, file, cb) => {
      // ✅ استخدام userId من req.user
      const userId = req.user?._id;

      if (!userId) {
        console.error("❌ No userId in filename!");
        return cb(new Error("User not authenticated ❌"));
      }

      const uniqueFileName =
        Date.now() +
        "_" +
        Math.round(Math.random() * 1e9) +
        "_" +
        file.originalname;

      // ✅ تخزين المسار النهائي في file.finalPath
      file.finalPath = `${basePath}/${userId}/${uniqueFileName}`;
      file.userId = userId; // تخزين userId في file للاستخدام لاحقاً

      console.log("📝 Filename:", uniqueFileName);
      console.log("🔗 Final path:", file.finalPath);
        file.finalPath = `uploads/${customPath}/${userId}/${uniqueFileName}`;
  
      console.log("Final path saved:", file.finalPath);
      cb(null, uniqueFileName);
    },
  });

  // =========================
  // 🔍 FILTER
  // =========================
  const fileFilter = (req, file, cb) => {
    console.log("🔍 File filter - mimetype:", file.mimetype);
    console.log("🔍 File filter - validation array:", validation);
    
    if (validation.length === 0) {
      console.log("⚠️ No validation specified, accepting all files");
      cb(null, true);
      return;
    }
    
    if (validation.includes(file.mimetype)) {
      console.log("✅ File type accepted");
      cb(null, true);
    } else {
      console.log("❌ File type rejected");
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  };

  return multer({ 
    storage, 
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });
};