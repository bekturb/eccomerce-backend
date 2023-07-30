const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");


const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const uploadDir = path.join(__dirname, "../public/images");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        callback(null, uploadDir);
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + "-" + file.originalname);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb({ message: "Unsupported file format" }, false);
    }
};

const uploadPhoto = multer({
    storage: storage,
    fileFilter: multerFilter,
    limits: { fileSize: 1000000 },
});

const productImgResize = async (req, res, next) => {
    if (!req.files) return next();
    await Promise.all(
        req.files.map(async (file) => {
            const outputPath = path.join(__dirname, "../public/images/", "temp-" + file.filename);
            await sharp(file.path)
                .resize(300, 300)
                .toFormat("jpeg")
                .jpeg({ quality: 90 })
                .toFile(outputPath);
            fs.unlinkSync(file.path);
            fs.renameSync(outputPath, file.path);
        })
    );
    next();
};

const blogImgResize = async (req, res, next) => {
    if (!req.files) return next();
    await Promise.all(
        req.files.map(async (file) => {
            const outputPath = path.join(__dirname, "../public/images/", "temp-" + file.filename);
            await sharp(file.path)
                .resize(300, 300)
                .toFormat("jpeg")
                .jpeg({ quality: 90 })
                .toFile(outputPath);
            fs.unlinkSync(file.path);
            fs.renameSync(outputPath, file.path);
        })
    );
    next();
};

module.exports = { uploadPhoto, productImgResize, blogImgResize };
