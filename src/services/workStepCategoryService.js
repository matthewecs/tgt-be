const workStepCategoryAccessor = require('../accessors/workStepCategoryAccessor');

const getAllWorkStepCategories = async (keyword, page = 1, take = 10) => {
    return workStepCategoryAccessor.getAllWorkStepCategoriesForListPage(keyword, page, take);
};

const getWorkStepCategoryById = async (id) => {
    return workStepCategoryAccessor.getWorkStepCategoryById(id);
};

const createWorkStepCategory = async (data) => {
    // Add validation or business logic here if needed
    return workStepCategoryAccessor.createWorkStepCategory(data);
};

const updateWorkStepCategory = async (id, data) => {
    // Add validation or business logic here if needed
    return workStepCategoryAccessor.updateWorkStepCategory(id, data);
};

const deleteWorkStepCategory = async (id) => {
    const result = await workStepCategoryAccessor.deleteWorkStepCategory(id);
    return result.deletedCount > 0 ? result : null;
};

module.exports = {
    getAllWorkStepCategories,
    getWorkStepCategoryById,
    createWorkStepCategory,
    updateWorkStepCategory,
    deleteWorkStepCategory
};
