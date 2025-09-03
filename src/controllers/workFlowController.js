
const workFlowService = require('../services/workFlowService');

// GET /workflow
const getAll = async (req, res) => {
    try {
        const { keyword, page = 1, take = 10 } = req.query;
        const result = await workFlowService.getAllWorkflows(keyword, page, take);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /workflow/:id
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await workFlowService.getWorkflowById(id);
        if (!result) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /workflow
const create = async (req, res) => {
    try {
        const data = req.body;
        const result = await workFlowService.createWorkflow(data);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /workflow/:id
const update = async (req, res) => {
    const { id } = req.params;
    // Placeholder: Update workflow by id
    res.json({ message: `Workflow with id ${id} updated` });
};

// DELETE /workflow/:id
const deleteEntity = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await workFlowService.deleteWorkflow(id);
        if (!result) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        res.json({ message: 'Workflow deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /get-next-available-step
const getNextAvailableStep = async (req, res) => {
    const { currentStep, value, selectedOption, categoryId } = req.body;

    workFlowService.getNextAvailableStep(currentStep, value, selectedOption, categoryId)
        .then(nextSteps => {
            res.json({ nextSteps });
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });    
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteEntity,
    getNextAvailableStep
};
