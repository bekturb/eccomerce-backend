const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/ProjectsController');

router.get("/", ProjectController.create);

module.exports = router;