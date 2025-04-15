const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    title: {type: String, required: true},
    summary: {type: String, required: true},
    description: {type: String},
    tech: {type: Array},
    screenshot: {type: String},
  },
  { collection: "project" }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
