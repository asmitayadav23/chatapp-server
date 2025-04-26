import multer from "multer";

// ✅ Use memoryStorage to get file.buffer in controller
const storage = multer.memoryStorage();

const multerUpload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB per file
  },
});

const singleAvatar = multerUpload.single("avatar");
const attachmentsMulter = multerUpload.array("files", 5);

export { singleAvatar, attachmentsMulter };
