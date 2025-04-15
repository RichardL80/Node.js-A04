"use strict";

const ProjectController = require('../controllers/ProjectController');

const express = require('express');
const projectsRouter = express.Router();

const upload = require('../middleware/multer-config');

projectsRouter.get('/', ProjectController.Index);
projectsRouter.delete('/', ProjectController.Index);

projectsRouter.get('/create', ProjectController.Create);
projectsRouter.post('/create', ProjectController.CreateProject);

projectsRouter.get("/search", ProjectController.Search);

projectsRouter.get('/:id/edit', ProjectController.EditProject);
projectsRouter.post('/:id/edit', ProjectController.UpdateProject);

projectsRouter.get('/:id', ProjectController.Detail);
projectsRouter.delete('/:id', ProjectController.DeleteProject);

module.exports = projectsRouter;
