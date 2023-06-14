const cloudinary = require('cloudinary').v2;
const dotenv = require("dotenv")

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryUploadImg = (fileToUpload) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(fileToUpload, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    url: result.secure_url,
                    asset_id: result.asset_id,
                    public_id: result.public_id,
                    resource_type: "auto",
                });
            }
        });
    });
};

const cloudinaryDeleteImg = async (fileToDelete) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(fileToDelete, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    url: result.secure_url,
                    asset_id: result.asset_id,
                    public_id: result.public_id,
                    resource_type: "auto",
                });
            }
        });
    });
};

module.exports = { cloudinaryUploadImg, cloudinaryDeleteImg };