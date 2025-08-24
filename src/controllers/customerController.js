const customerService = require('../services/customerService');

// GET /customer
const getAll = async (req, res) => {
    try {
        const { keyword, page = 1, take = 10 } = req.query;
        const result = await customerService.getAllCustomers(keyword, page, take);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /customer/getAllForDropdownOption - Get all customers for dropdown options
const getAllForDropdownOption = async (req, res) => {
    try {
        const result = await customerService.getAllCustomersForDropdownOption();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /customer/:id
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await customerService.getCustomerById(id);
        if (!result) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /customer
const create = async (req, res) => {
    try {
        const data = req.body;
        const result = await customerService.createCustomer(data);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /customer/:id
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const result = await customerService.updateCustomer(id, data);
        if (!result) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /customer/:id
const deleteEntity = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await customerService.deleteCustomer(id);
        if (!result) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAll,
    getAllForDropdownOption,
    getById,
    create,
    update,
    deleteEntity
};
