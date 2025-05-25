import { v2 as cloudinary } from 'cloudinary';

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не було завантажено' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "avatars",
          resource_type: "auto"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ avatarUrl: result.secure_url });
  } catch (error) {
    console.error('Помилка завантаження аватара:', error);
    res.status(500).json({ message: 'Помилка завантаження аватара' });
  }
}; 

export const uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ message: "No files uploaded" });
        }
  
        // Create URLs for uploaded files
        const imageUrls = req.files.map(
          (file) => file.path
        );
  
        res.json({ imageUrls });
      } catch (error) {
        console.error("Error uploading files:", error);
        res.status(500).json({ message: "Failed to upload files" });
      }
}