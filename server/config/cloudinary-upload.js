import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

export const cloudinaryUpload = async (file, username, type) => {
  const uniqueId = uuidv4();
  const folderName = "Talkora/stories";

  // Get the current UTC date and time
const currentUtcDate = new Date(Date.now());

// Add one day (in milliseconds)
const oneDayLater = new Date(currentUtcDate.getTime()+ 26 * 60 * 60 * 1000);

// Extract components
const year = oneDayLater.getUTCFullYear();
const month = String(oneDayLater.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
const day = String(oneDayLater.getUTCDate()).padStart(2, '0');
const hour = String(oneDayLater.getUTCHours()).padStart(2, '0');
const dayName = oneDayLater.toUTCString().split(' ')[0].replace(',', ''); // Get the day name (Mon, Tue, etc.)

// Format the output
const expirationTime = `${year}-${month}-${day} ${dayName} ${hour}:00 UTC`;

  // Configuration
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    let uploadResult;
    if (type === 'video') {
      uploadResult = await cloudinary.uploader.upload(file, {
        folder: folderName,
        public_id: `${username}-${uniqueId}`,
        resource_type: 'video', // Indicates that this is a video
        transformation: [
          { crop: 'fill', aspect_ratio: '9:16', gravity: 'center' }, // Crop to 9:16 aspect ratio for images
          {duration: 30}
        ],
        tags: [expirationTime] // Store expiration time as metadata
      });
    } else {
      // Default to image upload if not video
      uploadResult = await cloudinary.uploader.upload(file, {
        folder: folderName,
        public_id: `${username}-${uniqueId}`,
        transformation: [
          { crop: 'fill', aspect_ratio: '9:16', gravity: 'center' } // Crop to 9:16 aspect ratio for images
        ],
        tags: [expirationTime],
      });
    }

    const optimizeUrl = cloudinary.url(uploadResult.public_id, {
      folder: folderName,
      fetch_format: 'auto',
      quality: 'auto'
    });
    if(uploadResult.resource_type === 'video'){
      return {optimizeUrl: uploadResult.secure_url };
    }
    return { optimizeUrl };

  } catch (error) {
    throw error;
  }
};

export const cloudinaryUploadGroup = async(file,conversationId)=>{
  const folderName = "Talkora/group";

    // Configuration
    cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
      if (typeof file === 'string' && file.startsWith('https://')) {
        return {optimizeUrl: file}; // Return the existing URL
      }

      const uploadResult = await cloudinary.uploader.upload(file, {
        folder: folderName,
        public_id: `${conversationId}`,
      })

      const optimizeUrl = cloudinary.url(uploadResult.public_id, {
        folder: folderName,
        fetch_format: 'auto',
        quality: 'auto'
      });
      
      return { optimizeUrl };
      
    } catch (error) {
      throw error;
    }

}

export const cloudinaryUploadProfile = async (file, username) => {
  const folderName = "Talkora/profile";

  // Configuration
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  if (typeof file === 'string' && file.startsWith('https://')) {
    return file; // Return the existing URL
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: folderName,
      public_id: `${username}`,
    });

    const optimizeUrl = cloudinary.url(uploadResult.public_id, {
      folder: folderName,
      fetch_format: 'auto',
      quality: 'auto'
    });

    return optimizeUrl;

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};


setInterval(() => {
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Get the current UTC date and time
  const currentUtcDate = new Date(Date.now());

  // Add one day (in milliseconds)
  const oneDayLater = new Date(currentUtcDate.getTime());
  
  // Extract components
  const year = oneDayLater.getUTCFullYear();
  const month = String(oneDayLater.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(oneDayLater.getUTCDate()).padStart(2, '0');
  const hour = String(oneDayLater.getUTCHours()).padStart(2, '0');
  const dayName = oneDayLater.toUTCString().split(' ')[0].replace(',', ''); // Get the day name (Mon, Tue, etc.)
  // Format the output
  const expirationTime = `${year}-${month}-${day} ${dayName} ${hour}:00 UTC`;

  try {
    cloudinary.api
    .delete_resources_by_tag(expirationTime)
  } catch (error) {
    console.log(error)
  }
}, 60*30*1000);