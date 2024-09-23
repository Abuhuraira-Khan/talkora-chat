// Define the interface for the story object
export interface Story {
    storyUrl: string; // URL of the story (image/video)
    timestamp?: Date; // When the story was added
    isViewed?: boolean; // If the story has been viewed by others
  }
  
  // Define the interface for settings
  export interface Settings {
    showOnlineStatus: boolean; // Whether to show online status
    showLastSeen: boolean; // Whether to show last seen time
    profileVisibility: 'everyone' | 'contacts' | 'nobody'; // Profile visibility setting
    notifications: {
      enableMessageNotifications: boolean; // Enable message notifications
      enableEmailNotifications: boolean; // Enable email notifications
    };
  }
  
  // Define the interface for chatList (assuming it contains chat IDs or objects)
  export interface Chat {
    _id:String,
    participants:String[]
  }
  
  // Define the interface for the user
  export interface User {
    _id: string; // User ID
    fullname: string; // User's full name
    username: string; // User's unique username
    email: string; // User's email address
    password: string | null; // User's hashed password or null
    verificationCode: number | null; // Verification code for email verification or null
    isEmailVerified: boolean; // Status of email verification
    avatar: string; // URL of the user's avatar image
    stories: Story[]; // Array of stories
    settings: Settings; // User's settings
    isOnline: boolean; // Whether the user is currently online
    lastSeen: string; // Last time the user was seen (ISO string)
    chatList: Chat[]; // Array of chat objects or IDs
    blockList: string[]; // Array of blocked user IDs
    gender: 'male' | 'female' | 'other'; // User's gender
    country: string; // User's country
    bio: string; // User's biography
    highlights: string; // User's highlights
    updatedAt: string; // Last update time (ISO string)
    __v: number; // Document version key
  }
  
  // Define the context value interface
  export interface MyProfileContextType {
    myProfile: User; // Profile data
  }


    // message ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    export interface Message {
      conversationId: string;
      sender:  string;
      content: string;
      media?: string | null; // Optional, as it defaults to null
      readBy:string[];
      isEdited: boolean;
      isDeleted: boolean;
      createdAt: Date;
      updatedAt: Date;
    }
  

  // conversation ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  export interface Conversation {
    _id: string;  // MongoDB ObjectId as string
  
    isGroupChat: boolean;  // Indicates if the conversation is a group chat
  
    groupName?: string;  // Optional, only relevant if it's a group chat
  
    groupAvatar?: string;  // Optional URL for the group avatar image
  
    participants: string[];  // Array of participant user IDs (MongoDB ObjectId as strings)
  
    messages:Message[];  // Array of message IDs (MongoDB ObjectId as strings)
  
    lastMessage?: string;  // Optional reference to the most recent message ID
  
    unreadMessages: Array<{
      userId: string;  // User ID (MongoDB ObjectId as string)
      count: number;  // Count of unread messages for this user
    }>;
  
    isTyping: string[];  // Array of user IDs (MongoDB ObjectId as strings) who are currently typing
  
    pinned: string[];  // Array of user IDs who pinned the conversation
  
    archivedBy: string[];  // Array of user IDs who archived the conversation
  
    deletedBy: string[];  // Array of user IDs who soft-deleted the conversation
  
    createdAt: Date;  // Date the conversation was created
  
    updatedAt: Date;  // Date the conversation was last updated
  }
  

