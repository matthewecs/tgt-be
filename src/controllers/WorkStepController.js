const workStepService = require("../services/workStepService");

// GET /work-step
const getAll = async (req, res) => {
    // Placeholder: Fetch all work steps from database
    res.json({ message: 'List of all work steps' });
}

// GET /work-step/:id
const getById = async (req, res) => {
    const { id } = req.params;
    // Placeholder: Fetch work step by id from database
    res.json({ message: `Details of work step with id ${id}` });
}

// POST /work-step
const create = async (req, res) => {
    console.log(req.body)
    // Placeholder: Create a new work step

    workStepService.saveWorkStep(req.body);

    res.status(201).json({ message: 'Work step created' });
}

// PUT /work-step/:id
const update = async (req, res) => {
    const { id } = req.params;
    // Placeholder: Update work step by id
    res.json({ message: `Work step with id ${id} updated` });
}

// DELETE /work-step/:id
const deleteEntity = async (req, res) => {
    const { id } = req.params;
    // Placeholder: Delete work step by id
    res.json({ message: `Work step with id ${id} deleted` });
}


module.exports = { 
    getAll,
    getById,
    create,
    update,
    deleteEntity
};