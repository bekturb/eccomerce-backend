class ProjectsController {

    async create(req,res) {
        res.status(200).send("Hello World")
    }
}

module.exports = new ProjectsController()