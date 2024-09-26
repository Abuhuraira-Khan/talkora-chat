import { Message } from "../models/messages-model.js";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import {Conversation} from "../models/conversation-model.js";
import { User } from "../models/user-model.js";
import { io } from "../socket/socket.js";

configDotenv();


export const createMessage = async (req, res) => {

    const sender = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const { conversationId, content } = req.body;

    const senderData = jwt.verify(sender, process.env.JWT_SECRET_KEY);

    const findConversation = await Conversation.findById(conversationId);

    const participants = findConversation?.participants;
    const receiverId = participants.find((participant) => participant != senderData.id);

    if (!findConversation) {
        return res.status(404).json({ message: 'Conversation not found', data: [] });
    }
    const message = await Message.create({ conversationId, sender: senderData.id, content });

    // socket fundtion will go here
        // io.to().emit() used to send event to specific user
        if(!message) return res.status(500).json({message:'Something went wrong'});
        await Conversation.updateOne({ _id: conversationId }, {updatedAt: Date.now()});
        const getUpdatedConversation = await Conversation.findById(conversationId);
        const getSender = await User.findById(message.sender);
        io.emit('newMessage', {
            message:message,
            updatedAt:getUpdatedConversation.updatedAt,
            participants:getUpdatedConversation.participants,
            sender:{
                _id:getSender._id,
                fullname:getSender.fullname,
                username:getSender.username,
                avatar:getSender.avatar,
                lastMessage:message.content
            }
        });

    if (message) return res.status(200).json({ data: message, message: 'Message created successfully' });
}

// get messages
export const getMessages = async (req, res) => {

    const conversationId = req.params.id;

    const messages = await Message.find({ conversationId });
    if (messages) return res.status(200).json({ data: messages, message: 'Messages fetched successfully' });
}

// delete message
export const deleteMessage = async (req, res) => {
    const messageId = req.body.messageId;
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });
        if (message.sender.toString() !== tokenData.id) {
            return res.status(401).json({ message: 'only sender can delete the message' });
        }
        await Message.findByIdAndDelete(messageId);
        return res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });        
    }
}