const workStepService = require("../services/workStepService");

// GET /work-step
const getAll = async (req, res) => {
    const { keyword, page, take, categoryId } = req.query;

    res.json(await workStepService.getAllWorkStepsForListPage(keyword, page, take, categoryId));
}

const getAllWorkStepsForNextStep = async (req, res) => {
    res.json(await workStepService.getAllWorkStepsForNextStep(req.query.categoryId, req.query.currentStep))
}

// GET /work-step/category/:categoryId
const getByCategoryId = async (req, res) => {
    const { categoryId } = req.params;
    
    res.json(await workStepService.getWorkStepsByCategoryId(categoryId));
}

// GET /work-step/:id
const getById = async (req, res) => {
    const { id } = req.params;
    // Placeholder: Fetch work step by id from database
    res.json(await workStepService.getById(id));
}

// POST /work-step
const create = async (req, res) => {
    workStepService.saveWorkStep(req.body);

    res.status(201).json({ message: 'Work step created' });
}

// PUT /work-step/:id
const update = async (req, res) => {
    const { id } = req.params;

    // Placeholder: Logic to update work step by id
    // This should call the service to perform the update
    const result = await workStepService.saveWorkStep({ ...req.body, id });

    // Placeholder: Update work step by id
    res.json({ result, message: `Work step with id ${id} updated` });
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
    getAllWorkStepsForNextStep,
    getByCategoryId
};