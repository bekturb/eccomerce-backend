const fs = require("fs");
const {
    cloudinaryUploadImg,
    cloudinaryDeleteImg,
} = require("../utils/cloudinary");

class PhotoController {
    async create(req, res) {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const {path} = file;
            const newpath = await uploader(path);
            urls.push(newpath);
            fs.unlinkSync(path);
        }
        const images = urls.map((file) => {
            return file;
        });
        res.status(200).send(images)
    }

    async deleteImages(req, res) {
        const {id} = req.params;
        const deleted = cloudinaryDeleteImg(id, "images");
        res.status(200).send({message: "Deleted"});
    }

    async uploadSingleImage(req, res) {
        const uploader = (path) => cloudinaryUploadImg(path, "image");
        const file = req.file;
        const {path} = file;
        const newPath = await uploader(path);
        fs.unlinkSync(path);
        res.status(200).send(newPath)
    }

    async deleteImage(req, res) {
        const {id} = req.params;
        const deleted = cloudinaryDeleteImg(id, "image");
        res.status(200).send({message: "Deleted"});
    }
}

module.exports = new PhotoController()