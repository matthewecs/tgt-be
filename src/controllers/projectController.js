const projectService = require('../services/projectService');

// GET /project
const getAll = async (req, res) => {
    try {
        const { keyword, page = 1, take = 10 } = req.query;
        const result = await projectService.getAllProjects(keyword, page, take);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /project/getAllForDropdownOption
const getAllForDropdownOption = async (req, res) => {
    try {
        const result = await projectService.getAllProjectsForDropdownOption();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /project/:id
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await projectService.getProjectById(id);
        if (!result) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /project
const create = async (req, res) => {
    try {
        const data = req.body;
        const result = await projectService.createProject(data);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /project/:id
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const result = await projectService.updateProject(id, data);
        if (!result) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /project/:id
const deleteEntity = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await projectService.deleteProject(id);
        if (!result) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAll,
    getAllForDropdownOption,
    getById,
    create,
    update,
    deleteEntity
};
