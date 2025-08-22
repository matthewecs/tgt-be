const _ = require('lodash');
const workStepService = require('./workStepService');
const workFlowAccessor = require('../accessors/workFlowAccessor');

const getAllWorkflows = async () => {
    return workFlowAccessor.getAllWorkFlows();
};

const getWorkflowById = async (id) => {
    return workFlowAccessor.getWorkFlowById(id);
};

const createWorkflow = async (data) => {
    // Transform input data to match the required schema
    const transformedData = {
        projectName: data.projectName || "AMDK Sample", // Default project name if not provided
        targetProductionCapacity: data.targetProductionCapacity,
        selectedSteps: data.selectedSteps.map(step => ({
            step: step.step,
            selectedOption: step.selectedOption
        })),
        totalSteps: data.totalSteps,
        employeeName: data.employeeName || "Andi", // Default employee name if not provided
        createdAt: data.createdAt || new Date(),
        updatedAt: new Date()
    };
    
    return workFlowAccessor.createWorkFlow(transformedData);
};

const updateWorkflow = async (id, data) => {
    return workFlowAccessor.updateWorkFlow(id, data);
};

const deleteWorkflow = async (id) => {
    return workFlowAccessor.deleteWorkFlow(id);
};

const getNextAvailableStep = async (currentStep, value, selectedOption) => {
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
                const base = selectedOption ? selectedOption.option.metricValue * selectedOption.option.quantity : value;
                const conversionRate = Math.ceil(base / opt.preReqValue);
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
