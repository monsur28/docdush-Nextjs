import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper function to upload a file to Cloudinary
export const uploadToCloudinary = (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      cloudinary.uploader
        .upload_stream(
          {
            folder: "support-tickets",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(new Error(`Failed to upload ${file.name}`));
            } else {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
                resourceType: result.resource_type,
                format: result.format,
                bytes: result.bytes,
                originalFilename: file.name,
              });
            }
          }
        )
        .end(buffer);
    } catch (error) {
      console.error("Error processing file:", error);
      reject(error);
    }
  });
};

export default cloudinary;
