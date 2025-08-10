const workStepService = require("../services/workStepService");

// GET /work-step
const getAll = async (req, res) => {
    const { keyword, page, take} = req.query;

    res.json(await workStepService.getAllWorkStepsForListPage(keyword, page, take));
}

const getAllWorkStepsForNextStep = async (req, res) => {
    res.json(await workStepService.getAllWorkStepsForNextStep(req.query.currentStep))
}

// GET /work-step/:id
const getById = async (req, res) => {
    const { id } = req.params;
    // Placeholder: Fetch work step by id from database
    res.json({ message: `Details of work step with id ${id}` });
}

// POST /work-step
const create = async (req, res) => {
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

    await workStepService.deleteEntity(id);

    res.json({ message: `Work step with id ${id} deleted` });
}


module.exports = { 
    getAll,
    getById,
    create,
    update,
    deleteEntity,
    getAllWorkStepsForNextStep
};