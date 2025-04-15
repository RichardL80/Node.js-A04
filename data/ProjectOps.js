const mongoose = require('mongoose');
const Project = require('../models/Project.js');

class ProjectOps {
  ProjectOps() {}

  // DB methods
  async getAllProjects() {
    let projects = await Project.find({});
    return projects;
  }

  async getProjectById(id) {
    if (!id) {
      return null;
    }

    try {
      let project = await Project.findById(id);
      return project;
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      return null;
    }
  }

  async createProject(projectObj) {
    try {
      const error = await projectObj.validateSync();
      if (error) {
        const response = {
          obj: projectObj,
          errorMsg: 'Validation error',
        };
        return response; // Exit if the model is invalid
      }

      // Model is valid, so save it
      const result = await projectObj.save();
      const response = {
        obj: result,
        errorMsg: "",
      };
      return response;
    } catch (error) {
      const response = {
        obj: projectObj,
        errorMsg: error.message,
      };
      return response;
    }
  }

  async updateProjectById(id, updatedProject) {
    try {
      const result = await Project.findByIdAndUpdate(id, updatedProject, { new: true }); // `new: true` returns the updated document
      if (result) {
        return { errorMsg: '', project: result };
      } else {
        return { errorMsg: 'Project not found', project: null };
      }
    } catch (error) {
      console.error('Error updating project:', error);
      return { errorMsg: 'An error occurred while updating the project', project: null };
    }
  }
}

module.exports = ProjectOps;
