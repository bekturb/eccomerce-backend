const multer = require('multer');
const fs = require("fs")

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if (!fs.existsSync("uploads/")) {
            fs.mkdirSync("uploads/")
        }
        callback(null, 'uploads');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + "-" + file.originalname);
    }
});

const types = ["image/png", "image/jpeg", "image/jpg"]

const fileFilter = (req, file, callback) => {
    if (types.includes(file.mimetype)) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

module.exports = multer({
        storage,
        fileFilter
    }
);