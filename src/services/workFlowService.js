const _ = require('lodash');
const workStepService = require('./workStepService');

const getAllWorkflows = async () => {
    // Placeholder: Fetch all workflows from database
    return [];
};

const getWorkflowById = async (id) => {
    // Placeholder: Fetch workflow by id from database
    return { id };
};

const createWorkflow = async (data) => {
    // Placeholder: Create a new workflow
    return { ...data };
};

const updateWorkflow = async (id, data) => {
    // Placeholder: Update workflow by id
    return { id, ...data };
};

const deleteWorkflow = async (id) => {
    // Placeholder: Delete workflow by id
    return { id };
};

const getNextAvailableStep = async (currentStep, value) => {
    // Placeholder: Logic to get the next available step
    const workStep = await workStepService.getByName(currentStep);

    if (!workStep) {
        throw new Error(`Work step with name ${currentStep} not found`);
    }

    const nexUniqueKeys = _.chain(workStep)
        .get('nextActions')
        .map('nextUniqueKey')
        .value();

    const nextWorkSteps = await workStepService.findsByUniqueKeys(nexUniqueKeys);

    if (!nextWorkSteps || nextWorkSteps.length === 0) {
        return [];
    }

    const result = []
    for (const nextWorkStep of nextWorkSteps) {
        result.push({
            _id: nextWorkStep._id,
            name: nextWorkStep.name,
            uniqueKey: nextWorkStep.uniqueKey,
            description: nextWorkStep.description,
            options: nextWorkStep.options.map(opt => {
                const eligible = true;
                const conversionRate = Math.ceil(value / opt.quantity);
                const quantity = conversionRate * opt.quantity;

                return {
                    ...opt.toObject(),
                    eligible,
                    originalQuantity: opt.quantity,
                    quantity,
                    conversionRate 
                }
            })
        });
    }

    return result;
};

module.exports = {
    getAllWorkflows,
    getWorkflowById,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    getNextAvailableStep
};
