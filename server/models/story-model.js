import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  storyContent: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  storyType: {
    type: String,
    enum: ['image', 'video', 'text'],
    required: true
  },
  createAt: { 
    type: Date, 
    default: Date.now 
  },
  expiryTimestamp: {
    type: Date
  },
  views: [{
    userId: {
      type: String,
      required: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    userId: {
      type: String,
      required: true
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    commentId: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    commentText: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
});

// Create TTL index on `createAt` field
storySchema.index({ createAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 }); // 24 hours

export const Story = mongoose.model('stories', storySchema);
