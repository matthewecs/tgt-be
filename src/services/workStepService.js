const _ = require('lodash'); // Import lodash
const workStepAccessor = require("../accessors/workStepAccessor");

const saveWorkStep = async (data) => {
    return workStepAccessor.upsertWorkStep(data);
}

const getAllWorkStepsForNextStep = async (currentStep) => {
    const data = await workStepAccessor.getAllWorkStepsWithProjection();

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

module.exports = {
  saveWorkStep,
  getAllWorkStepsForNextStep,
  getAllWorkStepsForListPage,
  deleteEntity,
  getById
};
