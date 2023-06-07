const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectsController');

router.get("/", ProjectController.create);

module.exports = router;