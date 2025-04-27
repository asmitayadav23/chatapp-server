import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { getBase64, getSockets } from "../lib/helper.js";
import streamifier from "streamifier"; // ✅ for streaming file buffer uploads

// ========================== Cookie Options ==========================
const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

// ========================== Connect Database ==========================
const connectDB = (uri) => {
  mongoose
    .connect(uri, { dbName: "Chattu" })
    .then((data) => console.log(`Connected to DB: ${data.connection.host}`))
    .catch((err) => {
      console.error("MongoDB connection failed:", err);
      process.exit(1);
    });
};

// ========================== Send Token ==========================
const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  return res
    .status(code)
    .cookie("chattu-token", token, cookieOptions)
    .json({
      success: true,
      user,
      message,
    });
};

// ========================== Emit Event (Socket.IO) ==========================
const emitEvent = (req, event, users, data) => {
  const io = req.app.get("io");
  const usersSocket = getSockets(users);
  io.to(usersSocket).emit(event, data);
};

// ========================== Upload Files to Cloudinary ==========================
const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" }, // ✅ auto-detect type: image/pdf/video
        (error, result) => {
          if (error) return reject(error);

          resolve({
            public_id: result.public_id,
            url: result.secure_url, // ✅ always use secure_url
            resource_type: result.resource_type, // image, video, raw etc.
          });
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results; // ✅ array of { public_id, url, resource_type }
  } catch (err) {
    throw new Error("Error uploading files to cloudinary");
  }
};

// ========================== Delete Files from Cloudinary ==========================
const deletFilesFromCloudinary = async (public_ids = []) => {
  const deletePromises = public_ids.map((public_id) =>
    cloudinary.uploader.destroy(public_id, { resource_type: "auto" })
  );

  try {
    await Promise.all(deletePromises);
    console.log("Deleted files from Cloudinary successfully.");
  } catch (err) {
    console.error("Error deleting files from Cloudinary:", err);
  }
};

// ========================== Exports ==========================
export {
  connectDB,
  sendToken,
  cookieOptions,
  emitEvent,
  deletFilesFromCloudinary,
  uploadFilesToCloudinary,
};
