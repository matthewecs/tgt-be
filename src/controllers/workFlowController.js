
const workFlowService = require('../services/workFlowService');

// GET /workflow
const getAll = async (req, res) => {
    // Placeholder: Fetch all workflows from database
    res.json({ message: 'List of all workflows' });
};

// GET /workflow/:id
const getById = async (req, res) => {
    const { id } = req.params;
    // Placeholder: Fetch workflow by id from database
    res.json({ message: `Details of workflow with id ${id}` });
};

// POST /workflow
const create = async (req, res) => {
    // Placeholder: Create a new workflow
    res.status(201).json({ message: 'Workflow created' });
};

// PUT /workflow/:id
const update = async (req, res) => {
    const { id } = req.params;
    // Placeholder: Update workflow by id
    res.json({ message: `Workflow with id ${id} updated` });
};

// DELETE /workflow/:id
const deleteEntity = async (req, res) => {
    const { id } = req.params;
    // Placeholder: Delete workflow by id
    res.json({ message: `Workflow with id ${id} deleted` });
};

// GET /get-next-available-step
const getNextAvailableStep = async (req, res) => {
    const { currentStep, value } = req.body;

    workFlowService.getNextAvailableStep(currentStep, value)
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
