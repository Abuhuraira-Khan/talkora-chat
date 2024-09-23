import express from "express";
import {
  createConversation,
  getChatList,
  createGroup,
  addNewMembers,
  getConversationMembers,
  removeMembers,
  updateGroupDetails,
  deleteOrLeaveChat
} from "../controllers/chat-controller.js";

const router = express.Router();

router.post("/create-chat", createConversation);
router.get("/get-chat/:id", getChatList);
router.post("/create-group", createGroup);
router.post("/add-new-members", addNewMembers);
router.get("/get-conversation-members/:conversationId", getConversationMembers);
router.post("/remove-members", removeMembers);
router.post("/update-group-details/:conversationId", updateGroupDetails);
router.post("/delete-or-leave-chat/:conversationId", deleteOrLeaveChat);

export default router;
