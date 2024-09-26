import { User } from "../models/user-model.js";
import { Conversation } from "../models/conversation-model.js";
import { Message } from "../models/messages-model.js";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import mongoose from "mongoose"; // Import mongoose
import { cloudinaryUploadProfile } from "../config/cloudinary-upload.js";

configDotenv();

export const getMyProfile = async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  try {
    // Verify token and extract user ID
    const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = tokenData.id; // No need to convert to ObjectId since it's stored as a string

    // Fetch user profile along with conversations and stories
    const data = await User.aggregate([
      {
        // Match the user by their _id
        $match: { _id: new mongoose.Types.ObjectId(userId) }, // Convert to ObjectId for matching users
      },
      {
        // Lookup conversations where the user's _id is in the participants array
        $lookup: {
          from: "conversations",
          let: { userId: new mongoose.Types.ObjectId(userId) }, // Use ObjectId for conversation matching
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$$userId", "$participants"] },
              },
            },
            {
              $project: {
                _id: 1,
                participants: 1,
                isGroupChat: 1,
                lastMessage: 1,
              },
            },
          ],
          as: "chatList", // Output field for conversations
        },
      },
      {
        // Lookup stories by the user's `userId` which is a string
        $lookup: {
          from: "stories", // Collection name for stories
          let: { userId: userId }, // Use string userId for matching in stories
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$userId", "$userId"] }, // Match userId as string
              },
            },
            {
              $project: {
                _id: 1,
                storyContent: 1,
                storyType: 1,
                createAt: 1,
                expiryTimestamp: 1,
                views: 1,
                likes: 1,
                comments: 1,
              },
            },
          ],
          as: "stories", // Output field for stories
        },
      },
    ]);

    // Check if data is found and return it
    if (data.length > 0) {
      const user = data[0];
      delete user.password; // Set password to null before sending response
      return res.status(200).json({
        data: {
          ...user,
          avatar: user.avatar || "../public/images/unknow user.jpg",
        },
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, data: [] });
  }
};

// update profile
export const updateProfile = async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  const profile = req.body;

  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if(tokenData.id != profile._id) return res.status(401).json({ message: "Unauthorized" })
    const avatarUrl = await cloudinaryUploadProfile(profile.avatar, profile.username);
    profile.avatar = avatarUrl;
    const user = await User.findByIdAndUpdate(tokenData.id, profile, {
      new: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" })
    return res.status(200).json({ data: user });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message:'Something went wrong', data: {} });
  }
};

// receiver-profile
export const getReceiverProfile = async (req, res) => {
  const { id } = req.params;

  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  const tokentData = jwt.verify(token, process.env.JWT_SECRET_KEY);

  try {
    const user = await User.findById(id);
    if (!user) {
      const conversation = await Conversation.findById(id);
      if (!conversation) {
        return res
          .status(404)
          .json({ message: "User or Conversation not found", data: {} });
      }
      const participants = conversation?.participants;
      if (participants?.length === 1) {
        const returnReceiver = {
          _id: conversation?._id,
          fullname: conversation?.groupName,
          username: conversation?.groupName,
          avatar: conversation?.groupAvatar,
        };
        return res.status(200).json({ data: returnReceiver });
      }

      const receiverId = participants?.find(
        (participant) => participant != tokentData.id
      );
      if (!receiverId) {
        return res.status(404).json({ message: "User not found", data: {} });
      }
      const receiver = await User.findById(receiverId);

      if (!receiver) {
        return res.status(404).json({ message: "User not found", data: {} });
      }

      const returnReceiver = {
        _id: conversation?.isGroupChat ? conversation?._id : receiver?._id,
        fullname: conversation?.isGroupChat
          ? conversation?.groupName
          : receiver?.fullname,
        username: conversation?.isGroupChat
          ? conversation?.groupName
          : receiver?.username,
        avatar: conversation?.isGroupChat
          ? conversation?.groupAvatar
          : receiver?.avatar,
      };

      return res.status(200).json({ data: returnReceiver });
    }

    const receiver = {
      _id: user?._id,
      fullname: user?.fullname,
      username: user?.username,
      avatar: user?.avatar,
    };

    return res.status(200).json({ data: receiver });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", data: {} });
  }
};

// get peoples
export const getPeoples = async (req, res) => {
  const query = req.query.s;
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  const tokentData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  try {
    if (!query) {
      return res
        .status(404)
        .json({ message: "No search query provided", data: [] });
    }

    // Use regex to perform a case-insensitive search across multiple fields
    const regexQuery = new RegExp(query, "i"); // 'i' for case-insensitive

    const data = await User.find({
      $or: [
        { fullname: { $regex: regexQuery } },
        { username: { $regex: regexQuery } },
        { country: { $regex: regexQuery } },
        { gender: { $regex: regexQuery } },
      ],
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "No users found", data: [] });
    }

    const filterData = data.filter(
      (item) => item._id.toString() !== tokentData.id.toString()
    );
    const DataWithNullPassword = filterData.map((item) => {
      item.password = null;
      const returnData = {
        _id: item._id,
        fullname: item.fullname,
        username: item.username,
        avatar: item.avatar,
        isOnline: item.isOnline,
      };
      return returnData;
    });
    return res.status(200).json({ data: DataWithNullPassword });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred while fetching users", data: [] });
  }
};

// get chat user
export const getChatUser = async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);

  try {
    // Step 1: Find all conversations where the user is a participant
    const getConversations = await Conversation.find({
      participants: { $all: [tokenData.id] },
    });

    if (!getConversations || getConversations.length === 0) {
      return res.status(404).json({
        message: "Conversation not found",
        data: [],
      });
    }
    // Step 2: Get the other participants (excluding the current user)
    const getOtherParticipants = getConversations.map((conversation) =>
      conversation.participants.filter(
        (participant) => participant.toString() !== tokenData.id
      )
    );

    // Step 3: Retrieve user information for each participant
    const usersData = await Promise.all(
      getOtherParticipants.map(async (id) => await User.findById(id))
    );

    // Step 4: Fetch last message for each conversation (sorted by date or _id)
    const getLastMessages = await Promise.all(
      getConversations.map(async (conversation) => {
        return await Message.findOne({
          conversationId: conversation._id,
        })
          .sort({ createdAt: -1 }) // Sort by creation time in descending order to get the last message
          .limit(1); // Only retrieve the last message
      })
    );

    // Step 5: Prepare the response with user and last message details
    const returnData = usersData.map((user, index) => {
      const lastMessage = getLastMessages[index];

      return {
        fullname: getConversations[index]?.isGroupChat
          ? getConversations[index].groupName
          : user?.fullname,
        username: getConversations[index]?.isGroupChat ? "" : user?.fullname,
        avatar: getConversations[index]?.isGroupChat
          ? getConversations[index].groupAvatar
          : user?.avatar,
        conversationId: getConversations[index]?._id,
        isGroupChat: getConversations[index]?.isGroupChat,
        updateAt: getConversations[index].updatedAt,
        participants: getConversations[index].participants,
        lastMessage: lastMessage ? lastMessage.content : "No messages yet",
        senderId: lastMessage ? lastMessage.sender : null,
        lastMessageTime: lastMessage ? lastMessage.createdAt : new Date(),
      };
    });
    const sortedData = returnData.sort(
      (a, b) => new Date(b.updateAt) - new Date(a.updateAt)
    );
    return res.status(200).json({ data: sortedData });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      data: [],
    });
  }
};

// get chat user list for create group
export const getChatUserListForCreateGroup = async (req, res) => {
  const query = req.query.s;
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);

  try {
    if (!query) {
      // get conversation
      const getConversations = await Conversation.find({
        $and: [
          { isGroupChat: false },
          { participants: { $all: [tokenData.id] } },
        ],
      });
      if (!getConversations || getConversations.length === 0) {
        return res.status(404).json({
          message: "Conversation not found",
          data: [],
        });
      }

      // Step 2: Get the other participants (excluding the current user)
      const getOtherParticipants = getConversations.map((conversation) =>
        conversation.participants.filter(
          (participant) => participant.toString() !== tokenData.id
        )
      );

      // get user
      const usersData = await Promise.all(
        getOtherParticipants.map(async (id) => {
          const user = await User.findById(id);
          return {
            _id: user?._id,
            fullname: user?.fullname,
            username: user?.username,
            avatar: user?.avatar,
          };
        })
      );

      return res.status(200).json({ data: usersData });
    }

    // get user by query
    const regexQuery = new RegExp(query, "i"); // 'i' for case-insensitive

    const data = await User.find({
      $or: [
        { fullname: { $regex: regexQuery } },
        { username: { $regex: regexQuery } },
        { country: { $regex: regexQuery } },
        { gender: { $regex: regexQuery } },
      ],
    });
    if (data.length === 0) {
      return res.status(404).json({ message: "No users found", data: [] });
    }

    // cheack data
    if (data.length === 0) {
      return res.status(404).json({ message: "No users found", data: [] });
    }

    // remove current user
    const filterData = data.filter(
      (item) => item._id.toString() !== tokenData.id.toString()
    );

    // return data
    const returnData = filterData.map((item) => {
      const returnData = {
        _id: item?._id,
        fullname: item?.fullname,
        username: item?.username,
        avatar: item?.avatar,
      };
      return returnData;
    });
    return res.status(200).json({ data: returnData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      data: [],
    });
  }
};

// get user
export const getUser = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // check if user is private
    if (user.profileVisibility === "private") {
      if (tokenData.id !== user._id.toString()) {
        return res
          .status(200)
          .json({
            data: {
              message: "account is private",
              description: "you can not see this profile",
            },
          });
      }
    }
    // cheack if profile is locked
    if (user.profileVisibility === "locked") {
      const conversation = await Conversation.find({
        participants: { $all: [user._id, tokenData.id] },
      });
      if (!conversation || conversation.length === 0) {
        return res
          .status(200)
          .json({
            data: { message: "account is locked", description: "only c" },
          });
      }
    }

    const returnData = {
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      avatar: user.avatar,
      country: user.country,
      bio: user.bio,
      gender: user.gender,
      createdAt: user.createAt,
      highlights: user.highlights,
    };
    return res.status(200).json({ data: returnData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// get-conversation-profile
export const getConversationProfile = async (req, res) => {
  const { id, conversationId } = req.params;
  try {
    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation?.isGroupChat) {
      const conversation = await Conversation.findById(conversationId);
      const user = await User.findById(id);
      if (!user || !conversation.participants.includes(id))
        return res.status(404).json({ message: "User not found", data: {} });
      const returnData = {
        _id: user?._id,
        fullname: user?.fullname,
        username: user?.username,
        avatar: user?.avatar,
        country: user?.country,
        bio: user?.bio,
        gender: user?.gender,
        createdAt: user?.createAt,
        highlights: user?.highlights,
      };
      return res.status(200).json({ data: returnData });
    }
    // get group profile
    const returnData = {
      _id: conversation?._id || "",
      isGroupChat: conversation?.isGroupChat || "",
      groupName: conversation?.groupName || "",
      groupAdmins: conversation?.groupAdmins || "",
      grouDescription: conversation?.groupDescription || "",
      avatar: conversation?.groupAvatar || "",
      createdAt: conversation?.createdAt || "",
    };
    return res.status(200).json({ data: returnData });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// get-new-conversation-members
export const getNewConversationMembers = async (req, res) => {
  const { conversationId } = req.params;
  const query = req.query.s;
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // get group conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroupChat)
      return res
        .status(404)
        .json({ message: "Conversation not found", data: [] });
    if (!conversation.groupAdmins.includes(tokenData.id)) {
      return res.status(200).json({ message: "you are not admin", data: [] });
    }
    if (!query) {
      return res.status(200).json({ message: "No users found", data: [] });
    }
    // get users not in conversation
    const userList = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { fullname: { $regex: query, $options: "i" } },
        { gender: { $regex: query, $options: "i" } },
        { country: { $regex: query, $options: "i" } },
      ],
    });
    if (!userList || userList.length === 0)
      return res.status(200).json({ message: "No users found", data: [] });

    // filter users not in conversation
    const getUserNotInConversation = userList.filter((user) => {
      return !conversation.participants.includes(user._id.toString());
    });

    const filteredUserList = getUserNotInConversation.map((user) => {
      return {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        avatar: user.avatar,
      };
    });

    return res.status(200).json({ data: filteredUserList });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
