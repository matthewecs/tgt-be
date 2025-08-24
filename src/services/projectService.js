const projectAccessor = require('../accessors/projectAccessor');

const getAllProjects = async (keyword, page = 1, take = 10) => {
    return projectAccessor.getAllProjectsForListPage(keyword, page, take);
};

const getProjectById = async (id) => {
    return projectAccessor.getProjectById(id);
};

const createProject = async (data) => {
    // Add validation or business logic here if needed
    return projectAccessor.createProject(data);
};

const updateProject = async (id, data) => {
    // Add validation or business logic here if needed
    return projectAccessor.updateProject(id, data);
};

const deleteProject = async (id) => {
    const result = await projectAccessor.deleteProject(id);
    return result.deletedCount > 0 ? result : null;
};

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};
