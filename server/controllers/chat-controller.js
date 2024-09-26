import { Conversation } from "../models/conversation-model.js";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { Message } from "../models/messages-model.js";
import {User} from '../models/user-model.js';
import mongoose from "mongoose";
import { io } from "../socket/socket.js";
import { cloudinaryUploadGroup } from "../config/cloudinary-upload.js";

configDotenv();

export const createConversation = async (req, res) => {
    const sender = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const { receiver, text } = req.body;

    const senderData = jwt.verify(sender, process.env.JWT_SECRET_KEY);

    const participants = [senderData.id, receiver];
    try {

        if (participants.length < 2) return res.status(400).json({ message: 'Please select at least two participants' });
        // check if conversation exists
        const conversation = await Conversation.findOne({
            $and: [{ participants: { $all: participants } },{isGroupChat:false}]
        });
        if (conversation) return res.status(200).json(conversation);

        // create new conversation
        const savedConversation = await Conversation.create({ participants: participants });

        if (savedConversation) {
            const message = await Message.create({ conversationId: savedConversation._id, sender: senderData.id, content: text });

            // get sender if it is not a group
            if (!savedConversation.isGroupChat) {
                const getSender = await User.findById(senderData.id);
                const getReceiver = await User.findById(receiver);
                if(!getSender || !getReceiver) return res.status(404).json({ message: 'User not found' });
                // send receiver message
                io.emit('newConversation', {
                    message: message,
                    updatedAt: savedConversation.updatedAt,
                    participants: savedConversation.participants,
                    receiver: {
                        _id:getReceiver._id,
                        fullname:getReceiver.fullname,
                        username:getReceiver.username,
                        avatar:getReceiver.avatar,
                        lastMessage: message.content
                    },
                    sender: {
                        _id:getSender._id,
                        fullname:getSender.fullname,
                        username:getSender.username,
                        avatar:getSender.avatar,
                        lastMessage: message.content
                    },
                });
            }
            if (message) return res.status(200).json({ data: savedConversation, message: 'Conversation created successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
} 

// get get-chats
export const getChatList = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await Conversation.aggregate([
            {
                // Match the conversation by its _id
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                // Lookup the messages by matching conversationId with conversation _id
                $lookup: {
                    from: 'messages', // Name of the messages collection
                    localField: '_id', // _id of the conversation
                    foreignField: 'conversationId', // conversationId in messages
                    as: 'messages' // Output array field for messages
                }
            },
            {
                // Unwind the messages array to handle each message separately
                $unwind: {
                    path: "$messages",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                // Lookup sender information from the users collection
                $lookup: {
                    from: 'users', // Name of the users collection
                    localField: 'messages.sender', // 'sender' field in messages
                    foreignField: '_id', // _id in users collection
                    as: 'senderDetails' // Output array field for sender information
                }
            },
            {
                // Extract the first sender details from the senderDetails array
                $addFields: {
                    "messages.senderDetails": { $arrayElemAt: ["$senderDetails", 0] }
                }
            },
            {
                // Project the full message details based on the Message schema
                $project: {
                    "messages._id": 1, // Include message ID
                    "messages.content": 1, // Include the message content
                    "messages.media": 1, // Include media (if any)
                    "messages.readBy": 1, // Include users who have read the message
                    "messages.isEdited": 1, // If the message was edited
                    "messages.isDeleted": 1, // If the message was deleted
                    "messages.createdAt": 1, // Include the message creation time
                    "messages.updatedAt": 1, // Include the message update time
                    "messages.senderDetails.username": 1,
                    "messages.senderDetails.fullname": 1,
                    "messages.sender":1,
                    "messages.senderDetails._id": 1,
                    "messages.senderDetails.avatar": 1,
                    "_id": 1 // Keep the conversation _id
                }
            },
            {
                // Re-group the messages back into an array after the lookup
                $group: {
                    _id: "$_id",
                    messages: { $push: "$messages" }
                }
            }
        ]);

        const filterData = data.find(chat => chat._id.toString() === id);
        return res.status(200).json({ data: filterData });
    } catch (error) {
        return res.status(500).json({ error: "Error fetching chat" });
    }
};

// create group conversation
export const createGroup = async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { groupName, participants } = req.body;

    try {
        if(!groupName) return res.status(400).json({ message: "Group name is required" });
        const conversation = await Conversation.create({
            participants: [tokenData.id, ...participants],
            isGroupChat: true,
            groupName: groupName,
            groupAdmins: [tokenData.id],
        });
        return res.status(200).json({ data: conversation });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Error creating group" });
    }
}

// add new members in group
export const addNewMembers = async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const { conversationId, newMembersId } = req.body;

    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // check if conversation exists
        const conversation = await Conversation.findById(conversationId);
        if (!conversation||!conversation.isGroupChat) {
            return res.status(404).json({ message: "Conversation not found" });
        };
        // check if user is admin
        if (!conversation.groupAdmins.includes(tokenData.id)) {
            return res.status(403).json({ message: "you are not admin" });
        };

        // add new members
        conversation.participants.push(...newMembersId);
        await conversation.save();
        const returnData = conversation?.participants.map((c) =>c._id);
        console.log(returnData)
        return res.status(200).json({ data: returnData });
    } catch (error) {
        return res.status(500).json({ error: "Error adding new members" });
    }
}

// get-conversation-members
export const getConversationMembers = async (req, res) => {
    const {conversationId} = req.params;

    try {
        // check if conversation exists
        const conversation = await Conversation.findById(conversationId);
        if (!conversation||!conversation.isGroupChat) {
            return res.status(404).json({ message: "Conversation not found",data:[] });
        };
        // get conversation members
        const getAllMembersProfile = await User.find({ _id: { $in: conversation.participants } });

        if(!getAllMembersProfile) return res.status(404).json({ message: "No members found",data:[] });

        const returnData = getAllMembersProfile.map((member) =>{
            return {
                _id: member._id,
                fullname: member.fullname,
                username: member.username,
                avatar: member.avatar,
                isAdmin: conversation.groupAdmins.includes(member._id)?member._id:null
            }
        });
        return res.status(200).json({ data: returnData });
    } catch (error) {
        return res.status(500).json({ error: "Error getting conversation members" });
    }

}

// remove-members
export const removeMembers = async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const { conversationId, membersId } = req.body;

    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // check if conversation exists
        const conversation = await Conversation.findById(conversationId);
        if (!conversation||!conversation.isGroupChat) {
            return res.status(404).json({ message: "Conversation not found" });
        };
        // check if user is admin
        if (!conversation.groupAdmins.includes(tokenData.id)) {
            return res.status(403).json({ message: "you are not admin" });
        };

        if(conversation.groupAdmins.includes(membersId[0])){
            return res.status(403).json({ message: "you can't remove admin" });
        }

        // remove members
        conversation.participants =conversation.participants.filter((member) => !membersId.includes(member.toString()));
        await conversation.save();
        return res.status(200).json({ message: "Members removed successfully"});
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Error adding new members" });
    }
}

// update group details
export const updateGroupDetails = async (req, res) => {
    const {conversationId} = req.params;
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const groupDetails = req.body;
    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // check if conversation exists
        const conversation = await Conversation.findById(conversationId);
        if (!conversation||!conversation.isGroupChat) {
            return res.status(404).json({ message: "Conversation not found" });
        };
        // check if user is admin
        if (!conversation.groupAdmins.includes(tokenData.id)) {
            return res.status(403).json({ message: "you are not admin" });
        };
        // get image from cloudinary
        if (groupDetails.avatar) {
            const result = await cloudinaryUploadGroup(groupDetails.avatar,conversationId);
            groupDetails.avatar = result.optimizeUrl;
        }
        // update group details
        conversation.groupName = groupDetails.groupName;
        conversation.groupAvatar = groupDetails.avatar;
        await conversation.save();
        return res.status(200).json({ message: "Group details updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Error updating group details" });
    }

}

// delete-or-leave-chat
export const deleteOrLeaveChat = async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const { conversationId } = req.params;
    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // check if conversation exists
        const conversation = await Conversation.findById(conversationId);
        if(conversation.isGroupChat&&conversation.groupAdmins.includes(tokenData.id)){
            await Conversation.findByIdAndDelete(conversationId);
            return res.status(200).json({ message: "Conversation deleted successfully" });
        }
        conversation.participants = conversation.participants.filter((member) => member.toString() !== tokenData.id);
        await conversation.save();
        return res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Error deleting conversation" });
    }
}

// auto cheack conversation
setInterval(async() => {
    try {
        await Conversation.deleteMany({participants: { $size: 0 }});
    } catch (error) {
        throw new Error(error);
    }
}, 24*60*60*1000);