import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { CHATTU_TOKEN } from "../constants/config.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";
import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { getSockets } from "../lib/helper.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 15 * 24 * 60 * 60 * 1000,
};

// 📦 Connect Database
const connectDB = (uri) => {
  mongoose
    .connect(uri, { dbName: "Chattu" })
    .then((data) => console.log(`Connected to DB: ${data.connection.host}`))
    .catch((err) => {
      throw err;
    });
};

// 🎯 Send Token for Auth
const sendToken = (res, user, statusCode, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  res
    .status(statusCode)
    .cookie(CHATTU_TOKEN, token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    })
    .json({
      success: true,
      message,
      user,
    });
};

// 📢 Emit Socket Event
const emitEvent = (req, event, users, data) => {
  const io = req.app.get("io");
  const usersSocket = getSockets(users);
  io.to(usersSocket).emit(event, data);
};

// ☁️ Upload Files to Cloudinary
const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    const fileType = file.mimetype.split("/")[0]; // "image", "video", "audio", "application"
    
    let resourceType = "raw"; // default
    if (fileType === "image" || fileType === "video" || fileType === "audio") {
      resourceType = fileType;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          public_id: uuid(),
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
  } catch (err) {
    throw new Error("Error uploading files to Cloudinary");
  }
};

// 🗑️ Delete Files from Cloudinary (optional future use)
const deletFilesFromCloudinary = async (public_ids) => {
  // Later if needed: add cloudinary destroy code here
};

export {
  connectDB,
  sendToken,
  cookieOptions,
  emitEvent,
  deletFilesFromCloudinary,
  uploadFilesToCloudinary,
};
