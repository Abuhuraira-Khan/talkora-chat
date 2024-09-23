import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  isGroupChat: { type: Boolean, default: false },
  groupName: { type: String },
  groupAvatar: { type: String },
  groupDescription: { type: String },
  groupAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'message' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'message' },
  unreadMessages: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, 
    count: { type: Number, default: 0 } 
  }],
  isTyping: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  pinned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Export the model
export const Conversation = mongoose.model('Conversation', conversationSchema);
