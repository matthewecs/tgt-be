const customerAccessor = require('../accessors/customerAccessor');

const getAllCustomers = async (keyword, page = 1, take = 10) => {
    return customerAccessor.getAllCustomersForListPage(keyword, page, take);
};

const getCustomerById = async (id) => {
    return customerAccessor.getCustomerById(id);
};

const createCustomer = async (data) => {
    // Add validation or business logic here if needed
    return customerAccessor.createCustomer(data);
};

const updateCustomer = async (id, data) => {
    // Add validation or business logic here if needed
    return customerAccessor.updateCustomer(id, data);
};

const deleteCustomer = async (id) => {
    const result = await customerAccessor.deleteCustomer(id);
    return result.deletedCount > 0 ? result : null;
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
};
