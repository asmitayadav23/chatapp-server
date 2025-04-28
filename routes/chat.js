// /routes/chat.js

import express from "express";
import {
  addMembers,
  deleteChat,
  getChatDetails,
  getMessages,
  getMyChats,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMember,
  renameGroup,
  sendAttachments,
} from "../controllers/chat.js";

import {
  addMemberValidator,
  chatIdValidator,
  newGroupValidator,
  removeMemberValidator,
  renameValidator,
  sendAttachmentsValidator,
  validateHandler,
} from "../lib/validators.js";

import { isAuthenticated } from "../middlewares/auth.js";
import { attachmentsMulter } from "../middlewares/multer.js";

const router = express.Router();

// 🆕 Create a new Group Chat
router.post(
  "/new",
  isAuthenticated,
  newGroupValidator(),
  validateHandler,
  newGroupChat
);

// 🧑‍🤝‍🧑 Get all my chats
router.get("/my", isAuthenticated, getMyChats);

// 🧑‍🤝‍🧑 Get all my groups
router.get("/my/groups", isAuthenticated, getMyGroups);

// ➕ Add members to a group
router.put(
  "/addmembers",
  isAuthenticated,
  addMemberValidator(),
  validateHandler,
  addMembers
);

// ➖ Remove a member from group
router.put(
  "/removemember",
  isAuthenticated,
  removeMemberValidator(),
  validateHandler,
  removeMember
);

// 🚪 Leave a group
router.delete(
  "/leave/:id",
  isAuthenticated,
  chatIdValidator(),
  validateHandler,
  leaveGroup
);

// 📎 Send attachments (files/images/videos)
router.post(
  "/send-attachments",
  isAuthenticated,
  attachmentsMulter,
  sendAttachments
);

// 📨 Get all messages from a chat
router.get(
  "/message/:id",
  isAuthenticated,
  chatIdValidator(),
  validateHandler,
  getMessages
);

// ⚙️ Get, Rename, or Delete a Chat
router
  .route("/:id")
  .get(
    isAuthenticated,
    chatIdValidator(),
    validateHandler,
    getChatDetails
  )
  .put(
    isAuthenticated,
    renameValidator(),
    validateHandler,
    renameGroup
  )
  .delete(
    isAuthenticated,
    chatIdValidator(),
    validateHandler,
    deleteChat
  );

export default router;
