import { cloudinaryUpload } from "../config/cloudinary-upload.js";
import fs from "fs";
import path from "path";
import { Conversation } from "../models/conversation-model.js";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { Message } from "../models/messages-model.js";
import { User } from "../models/user-model.js";
import {Story} from '../models/story-model.js';
import mongoose from "mongoose";

configDotenv();

// add stories
export const addStories = async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  const storyData = req.body;
  const tokentData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const file = storyData?.media;
  const storyType = storyData?.media.split(',')[0].split('/')[0].split(':')[1];

  try {
    const user = await User.findOne({ _id: tokentData.id,email:tokentData.email });
    if(!user) return res.status(404).json({ message: "User not found" });

    const fileUrl = await cloudinaryUpload(file, user.username, storyType);
    if(!fileUrl) return res.status(404).json({ message: "File not found" });
    const story = {
      userId: user._id,
      username: user.username,
      storyType: storyType,
      storyContent:{...storyData,media:fileUrl?.optimizeUrl}
    }
    if(!story) return res.status(404).json({ message: "Story not found" });
    const storyRes = await Story.create({...story});
    if(!storyRes) return res.status(404).json({ message: "Story not found" });
    return res.status(200).json({ message: "Story added successfully", data: storyRes });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// get stories by conversations
export const getStories = async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    const user = await User.findOne({ _id: tokenData.id, email: tokenData.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const conversations = await Conversation.find({ participants: { $in: [user._id] } });
    if (!conversations) return res.status(404).json({ message: "Connections not found" });

    // Fetch stories of all participants except the current user
    const getConnections = await Promise.all(conversations.map(async (connection) => {
      // Get the other participant's ID
      const otherParticipants = connection.participants.filter((id) => id.toString() !== user._id.toString());

      // Fetch the stories of each other participant
      const stories = await Promise.all(otherParticipants.map(async (id) => {
        const story = await Story.findOne({ userId: id });
        if (!story) return null;
        return story.userId;
      }));

      return stories.filter((story) => story !== null); // Filter out null stories
    }));

    // get user who shared the story
    const users = await User.find({ _id: { $in: getConnections.flat() } });
    if (!users) return res.status(404).json({ message: "Users not found" });
    const filterData = users.map((user) => {
      return {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        avatar: user.avatar,
        highlights: user.highlights
      };
    });
    return res.status(200).json({ data: filterData });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// get story
export const getStory = async (req, res) => {
  const { username } = req.params;
  try {
    // fetch stories
    const stories = await Story.findOne({username:username});
    if (!stories) return res.status(404).json({ message: "Stories not found" });

    // fetch more stories
    const getMoreStories = await Story.find({username:username});
    const filterMoreStories = getMoreStories.map((story) =>story._id);
    if (!filterMoreStories) return res.status(404).json({ message: "Stories not found" });

    // get user who shared the story
    const user = await User.findOne({ _id: stories.userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ data:{stories:stories, user:{storiesuserFullname:user.fullname,userAvatar:user.avatar},more:filterMoreStories}});
  } catch (error) {
    
  }
}

// get-story-by-id
export const getStoryById = async (req, res) => {
  const { id } = req.params;
  try {
    // fetch stories
    const stories = await Story.findOne({_id:id});
    if (!stories) return res.status(404).json({ message: "Stories not found" });

    // fetch more stories
    const getMoreStories = await Story.find({username:stories.username});
    const filterMoreStories = getMoreStories.map((story) =>story._id);
    if (!filterMoreStories) return res.status(404).json({ message: "Stories not found" });
    // get user who shared the story
    const user = await User.findOne({ _id: stories.userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ data:{stories:stories, user:{storiesuserFullname:user.fullname,userAvatar:user.avatar},more:filterMoreStories}});
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

