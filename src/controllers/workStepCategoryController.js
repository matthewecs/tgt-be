const workStepCategoryService = require('../services/workStepCategoryService');

// GET /workstep-category
const getAll = async (req, res) => {
    try {
        const { keyword, page = 1, take = 10 } = req.query;
        const result = await workStepCategoryService.getAllWorkStepCategories(keyword, page, take);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /workstep-category/:id
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await workStepCategoryService.getWorkStepCategoryById(id);
        if (!result) {
            return res.status(404).json({ error: 'WorkStep Category not found' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /workstep-category
const create = async (req, res) => {
    try {
        const data = req.body;
        const result = await workStepCategoryService.createWorkStepCategory(data);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /workstep-category/:id
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const result = await workStepCategoryService.updateWorkStepCategory(id, data);
        if (!result) {
            return res.status(404).json({ error: 'WorkStep Category not found' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /workstep-category/:id
const deleteEntity = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await workStepCategoryService.deleteWorkStepCategory(id);
        if (!result) {
            return res.status(404).json({ error: 'WorkStep Category not found' });
        }
        res.json({ message: 'WorkStep Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteEntity
};
