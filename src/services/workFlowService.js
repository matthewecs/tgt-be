const _ = require('lodash');
const workStepService = require('./workStepService');
const workFlowAccessor = require('../accessors/workFlowAccessor');

const getAllWorkflows = async (keyword, page = 1, take = 10) => {
    return workFlowAccessor.getAllWorkFlowsForListPage(keyword, page, take);
};

const getWorkflowById = async (id) => {
    const workflow = await workFlowAccessor.getWorkFlowById(id);
    
    if (!workflow) {
        return null;
    }

    // Convert to plain object if it's a Mongoose document
    const workflowObj = workflow.toObject ? workflow.toObject() : { ...workflow };
    
    // If workflow has a projectId, fetch project details with customer
    if (workflowObj.projectId) {
        const projectService = require('./projectService');
        const project = await projectService.getProjectById(workflowObj.projectId);
        
        if (project) {
            workflowObj.project = project;
        }
    }
    
    return workflowObj;
};

const createWorkflow = async (data) => {
    // Transform input data to match the required schema
    const transformedData = {
        projectName: data.projectName || "AMDK Sample", // Default project name if not provided
        projectId: data.projectId || null, // Optional project ID reference
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
    // Soft delete: update status to 'deleted' instead of removing the record
    const updateData = {
        status: 'deleted',
        updatedAt: new Date()
    };
    return workFlowAccessor.updateWorkFlow(id, updateData);
};

const getNextAvailableStep = async (currentStep, value, selectedOption, categoryId) => {
    // Placeholder: Logic to get the next available step
    const workStep = await workStepService.getByName(currentStep, categoryId);

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
