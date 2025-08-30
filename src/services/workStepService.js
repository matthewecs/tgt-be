const _ = require('lodash'); // Import lodash
const workStepAccessor = require("../accessors/workStepAccessor");

const saveWorkStep = async (data) => {
    return workStepAccessor.upsertWorkStep(data);
}

const getAllWorkStepsForNextStep = async (categoryId, currentStep) => {
    const data = await workStepAccessor.getAllWorkStepsWithProjection(categoryId);

    _.filter(data, datum => datum.uniqueKey !== currentStep);

    return data;
}

const getAllWorkStepsForListPage = async (keyword, page, take) => {
    return workStepAccessor.getAllWorkStepsForListPage(keyword, page, take);
}

const deleteEntity = async (id) => {
    // Placeholder: Logic to delete a work step by id
    // This should call the accessor to perform the deletion
    return workStepAccessor.deleteEntity(id);
} 

const getById = async (id) => {
    // Placeholder: Logic to get a work step by id
    // This should call the accessor to perform the retrieval
    return workStepAccessor.getById(id);
}

const getByName = async (name, categoryId) => {
    // Logic to get a work step by name
    // If name starts with categoryId, remove the categoryId prefix
    let processedName = name;
    if (categoryId && name.startsWith(categoryId)) {
        processedName = name.substring(categoryId.length).replace(/^-+/, ''); // Remove categoryId and leading dashes
    }
    
    return workStepAccessor.getByName(processedName, categoryId);
}
const findsByUniqueKeys = async (uniqueKeys) => {
    // Logic to get work steps by an array of unique keys
    return workStepAccessor.findsByUniqueKeys(uniqueKeys);
}

module.exports = {
  saveWorkStep,
  getAllWorkStepsForNextStep,
  getAllWorkStepsForListPage,
  deleteEntity,
  getById,
  getByName,
  findsByUniqueKeys
};
