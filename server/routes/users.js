import express from "express";
import {
  getMyProfile,
  getPeoples,
  getChatUser,
  getReceiverProfile,
  getChatUserListForCreateGroup,
  getUser,
  getConversationProfile,
  getNewConversationMembers,
  updateProfile
} from "../controllers/users-controller.js";

const router = express.Router();

router.get("/my-profile", getMyProfile);
router.get("/peoples", getPeoples);
router.get("/get-chat-user/", getChatUser);
router.get("/receiver-profile/:id", getReceiverProfile);
router.get("/get-users-for-create-group", getChatUserListForCreateGroup);
router.get("/get-user/:id", getUser);
router.get("/get-conversation-profile/:id/:conversationId", getConversationProfile);
router.get("/get-new-conversation-members/:conversationId", getNewConversationMembers);
router.post("/update-profile", updateProfile);

export default router;
