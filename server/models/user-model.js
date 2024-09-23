import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationCode: { type: Number, required: false }, // Code for email verification
  isEmailVerified: { type: Boolean, default: false }, // Status of email verification

  // New fields for avatar and stories
  avatar: { type: String, default: '' }, // URL for user avatar image
  stories: [
    {
      storyUrl: { type: String, required: true }, // URL of the story (image/video)
      timestamp: { type: Date, default: Date.now }, // When the story was added
      isViewed: { type: Boolean, default: false }, // If the story has been viewed by others
    },
  ],

  // Other settings you might have
  settings: {
    showOnlineStatus: { type: Boolean, default: true },
    showLastSeen: { type: Boolean, default: true },
    profileVisibility: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'contacts' },
    notifications: {
      enableMessageNotifications: { type: Boolean, default: true },
      enableEmailNotifications: { type: Boolean, default: true }
    }
  },

  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  chatList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  blockList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  country: { type: String, default: 'Unknown' },
  bio: { type: String, default: '' },
  highlights:{type:String,default:''},
  createAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', UserSchema);







// import mongoose from 'mongoose';
// import { User } from './models/user-model.js'; // Assuming you export the User model from this path

// Connect to MongoDB
// const runMigration = async () => {
//     try {
//       // Run migration
//       await User.updateMany({}, {
//         $set: {
//             isOnline: false,
//             lastSeen: new Date(),
//             chatList: [],
//             avatar: '', // Default value for avatar
//             stories: [], // Default value for stories
//             blockList: [],
//             gender: 'other',
//             country: 'Unknown',
//             bio: '',
//             highlights: '',
//             settings: {
//               showOnlineStatus: true,
//               showLastSeen: true,
//               profileVisibility: 'contacts',
//               notifications: {
//                 enableMessageNotifications: true,
//                 enableEmailNotifications: true
//               }
//             }
//           }
//       });
  
//       console.log('Migration completed: All users updated with default settings.');
//     } catch (error) {
//       console.error('Error running migration:', error);
//     } finally {
//       mongoose.connection.close(); // Ensure connection is closed
//     }
//   };
  
//   // Connect to the database and run the migration
//   runMigration();
