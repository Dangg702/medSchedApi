const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// Hàm upload ảnh
const uploadImage = (filePath) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, { folder: 'uploads' }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result.secure_url);
            }
            // Xóa file ảnh sau khi upload
            fs.unlinkSync(filePath);
        });
    });
};

module.exports = { uploadImage };
