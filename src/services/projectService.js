const projectAccessor = require('../accessors/projectAccessor');
const customerAccessor = require('../accessors/customerAccessor');

const getAllProjects = async (keyword, page = 1, take = 10) => {
    const projects = await projectAccessor.getAllProjectsForListPage(keyword, page, take);

    // Extract customer IDs from projects
    const customerIds = projects.data.map(project => project.customerId).filter(id => id);
    
    // Fetch customer data for the extracted IDs
    const customers = await customerAccessor.getCustomersByIds(customerIds);

    // Set customer data into each project
    projects.data = projects.data.map(project => {
        const customer = customers.find(c => c._id.toString() === project.customerId.toString());
        if (customer) {
            // Convert to plain object and add customer field
            const projectObj = project.toObject ? project.toObject() : { ...project };
            projectObj.customer = customer;
            return projectObj;
        }
        return project.toObject ? project.toObject() : { ...project };
    });

    return projects;
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
