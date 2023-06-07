const fs = require("fs")
const { cloudinary } = require("../middlewares/cloudinary");
class PhotoController {
    async create(req, res) {

        if (req.method === "POST"){
            const urls = []

            const files = req.files

            for (const file of files){
                const { path } = file

                const newPath = await cloudinary.uploader.upload(path)

                urls.push(newPath)

                fs.unlinkSync(path)
            }
            res.status(200).send({
                message: "Images Uploaded Successfully",
                data: urls
            })
        }else{
            res.status(405).send({
                err: "Images not uploaded successfully"
            })
        }
    }

    async uploadSingleImage(req, res) {
        if (req.method === "POST") {
            const file = req.file
            const { path } = file
            const newPath = await cloudinary.uploader.upload(path)
            res.status(200).send({
                message: "Images Uploaded Successfully",
                data: newPath.url
            })
        }else {
            res.status(405).send({
                err: "Images not uploaded successfully"
            })
        }
    }
}

module.exports = new PhotoController()