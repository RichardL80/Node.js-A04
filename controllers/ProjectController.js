const upload = require('../middleware/multer-config');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');

const ProjectOps = require('../data/ProjectOps');
const _projectOps = new ProjectOps();

exports.Index = async function (request, response) {
  let projects = await _projectOps.getAllProjects();
  if (projects) {
    if (request.query.format === 'json') {
      response.json(projects);
      return;
    }
    
    // Truncate descriptions before passing to the view
    // projects = projects.map(project => ({
    //   ...project,
    //   description: truncateDescription(project.description || ''),
    // }));
    
    response.render('projects', {
      ...request.app.locals.viewData, 
      projects: projects, 
      query: '', 
      pageTitle: 'My Projects'
    });
  } else {
    response.render('projects', {
      ...request.app.locals.viewData, 
      projects: [],
      query: '', 
      pageTitle: 'My Projects'
    });
  }
};
    
exports.Detail = async function (request, response) {
  const id = request.params.id;
  let project = await _projectOps.getProjectById(id);
  let projects = await _projectOps.getAllProjects();
  if (project) {
    if (request.query.format === 'json') {
      response.json(project);
      return;
    }
    response.render('detail', {
      ...request.app.locals.viewData, 
      project: project, 
      id: id, 
      pageTitle: project.title,
    });
  } else {
    response.render('projects', {
      ...request.app.locals.viewData, 
      projects: [], 
      id: Number(id), 
      pageTitle: 'Project Not Found',
    });
  }
};

exports.Search = async function (request, response) {
  const lowercaseQuery = request.query.query.toLowerCase();
  let projects = await _projectOps.getAllProjects();
  const searchResults = projects.filter((project) =>
      project.title.toLowerCase().includes(lowercaseQuery) ||
      project.summary.toLowerCase().includes(lowercaseQuery) ||
      project.description.toLowerCase().includes(lowercaseQuery) ||
      project.tech.join('').toLowerCase().includes(lowercaseQuery)
  );
  if (searchResults) {
    if (request.query.format === 'json') {
      response.json(searchResults);
      return;
    }
    response.render('projects', {
      ...request.app.locals.viewData, 
      projects: searchResults, 
      query: lowercaseQuery, 
      pageTitle: 'My Projects'
    });
  } else {
    response.render('projects', {
      ...request.app.locals.viewData, 
      projects: [],
      query: '', 
      pageTitle: 'My Projects'
    });
  }
};

// Handle create project form GET request
exports.Create = async function (request, response) {
  response.render('project-create', {
    ...request.app.locals.viewData, 
    pageTitle: 'Create Project',
    errorMessage: '',
    project: {},
    previousPage: request.get('Referer') || '/projects',
  });
};

// Handle create project form POST request
exports.CreateProject = [
  upload.single('screenshot'), // Use Multer to handle the file upload
  async function (req, res) {
    console.log('File uploaded:', req.file); // Log the uploaded file details

    const { title, summary, description, tech } = req.body;
    const screenshot = req.file ? `/uploads/${req.file.filename}` : ''; // Save the file path

    const tempProjectObj = new Project({
      title: title,
      summary: summary,
      description: description || '',
      tech: Array.isArray(tech) ? tech : [tech],
      screenshot: screenshot,
    });

    const responseObj = await _projectOps.createProject(tempProjectObj);

    if (responseObj.errorMsg === '') {
      res.redirect('/projects');
    } else {
      res.render('project-create', {
        ...req.app.locals.viewData,
        pageTitle: 'Create Project',
        project: req.body,
        errorMessage: responseObj.errorMsg,
      });
    }
  },
];

// Handle delete project form POST request
// exports.DeleteProject = async function (request, response) {
//   try {
//     const id = request.params.id;
//     await Project.findByIdAndDelete(id);
//     response.status(200).json({ message: 'Project deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting project:', error);
//     response.status(500).send('Internal Server Error');
//   }
// };
exports.DeleteProject = async function (request, response) {
  try {
    const id = request.params.id;
    const deletedProject = await Project.findByIdAndDelete(id);

    if (deletedProject) {
      // Optionally delete the associated screenshot file
      if (deletedProject.screenshot && deletedProject.screenshot !== '/images/placeholder.png') {
        const filePath = path.join(process.cwd(), deletedProject.screenshot);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${filePath}`, err);
          } else {
            console.log(`Successfully deleted file: ${filePath}`);
          }
        });
      }

      response.status(302).set('Location', '/projects').end();
    } else {
      response.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    response.status(500).send('Internal Server Error');
  }
};

// Handle edit project form GET request
exports.EditProject = async function (request, response) {
  const id = request.params.id;
  const project = await _projectOps.getProjectById(id);
  response.render('project-create', {
    ...request.app.locals.viewData,
    pageTitle: 'Edit Project',
    project: project,
    errorMessage: '',
    previousPage: request.get('Referer') || '/projects',
  });
};

// Handle edit project form GET request
exports.UpdateProject = [
  upload.single('screenshot'), // Use Multer to handle the file upload
  async function (req, res) {
    try {
      const id = req.params.id;
      const { title, summary, description, tech } = req.body;

      const newScreenshot = req.file ? `/uploads/${req.file.filename}` : req.body.existingScreenshot;

      // If a new file is uploaded, delete the old file
      if (req.file && req.body.existingScreenshot && req.body.existingScreenshot !== '/images/placeholder.png') {
        const oldFilePath = `/uploads/${req.body.existingScreenshot}`;
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${oldFilePath}`, err);
          } else {
            console.log(`Successfully deleted file: ${oldFilePath}`);
          }
        });
      }

      const updatedProject = {
        title: title,
        summary: summary,
        description: description || '',
        tech: Array.isArray(tech) ? tech : [tech],
        screenshot: newScreenshot,
      };

      const responseObj = await _projectOps.updateProjectById(id, updatedProject);

      if (responseObj.errorMsg === '') {
        res.redirect('/projects');
      } else {
        const project = await _projectOps.getProjectById(id); // Fetch the original project data
        res.render('project-create', {
          ...req.app.locals.viewData,
          pageTitle: 'Edit Project',
          project: { ...project, ...req.body, screenshot }, // Merge original and updated data
          errorMessage: responseObj.errorMsg,
          previousPage: req.get('Referer') || '/projects',
        });
      }
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).send('Internal Server Error');
    }
  },
];

// exports.UpdateProject = async function (request, response) {
//   try {
//     const id = request.params.id;
//     const title = request.body.title;
//     const summary = request.body.summary;
//     const description = request.body.description || '';
//     const selectedTech = request.body.tech || [];
//     const screenshot = request.body.screenshot || '/images/placeholder.png';
  
//     const updatedProject = {
//       title: title,
//       summary: summary,
//       description: description,
//       tech: Array.isArray(selectedTech) ? selectedTech : [selectedTech],
//       screenshot: screenshot,
//     };

//     await Project.findByIdAndUpdate(id, updatedProject);
//     response.redirect('/projects'); // Redirect to the projects list after updating
//   } catch (error) {
//     console.error('Error updating project:', error);
//     response.status(500).send('Internal Server Error');
//   }
// };
