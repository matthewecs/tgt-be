const workStepAccessor = require("../accessors/workStepAccessor");

const saveWorkStep = async (data) => {
    return workStepAccessor.upsertWorkStep(data);
}

module.exports = {
  saveWorkStep
};
