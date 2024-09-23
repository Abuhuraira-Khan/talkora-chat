import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'conversation', 
    required: true 
  },

  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  },

  content: {
    type: String,
    required: true
  },

  // To track if the message contains media (images, videos, files)
  media: {
    type: String,  // URL of the media file
    default: null
  },

  // List of users who have read this message
  readBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user' 
  }],

  // If the message was edited
  isEdited: { 
    type: Boolean, 
    default: false 
  },

  // If the message was deleted (soft deletion)
  isDeleted: { 
    type: Boolean, 
    default: false 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  },

  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Export the model
export const Message = mongoose.model('message', messageSchema);
