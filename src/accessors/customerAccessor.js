const { connectToMongo, mongoose } = require('./mongoAccessor');
const _ = require('lodash');

const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, default: null },
    email: { type: String, default: null },
    status: { type: String, enum: ['OWNER', 'EMPLOYEE'], required: true }
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    address: { type: String, default: null },
    contacts: { type: [ContactSchema], default: [] },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    joinDate: { type: Date, default: Date.now },
    description: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

async function createCustomer(data) {
    try {
        await connectToMongo();
        const customer = new Customer(data);
        return await customer.save();
    } catch (err) {
        console.error('Error creating customer:', err.message);
        throw err;
    }
}

async function getAllCustomers() {
    try {
        await connectToMongo();
        return await Customer.find({});
    } catch (err) {
        console.error('Error getAllCustomers:', err.message);
        throw err;
    }
}

async function getAllCustomersForDropdownOption() {
    try {
        await connectToMongo();
        return await Customer.find({}, { companyName: 1, address: 1 });
    } catch (err) {
        console.error('Error getAllCustomersForDropdownOption:', err.message);
        throw err;
    }
}

async function getAllCustomersForListPage(keyword, page = 1, take = 10) {
    try {
        await connectToMongo();
        
        // Build filter for keyword search (case-insensitive, partial match on companyName or contact names)
        const filter = keyword
            ? {
                $or: [
                    { companyName: { $regex: keyword, $options: 'i' } },
                    { 'contacts.name': { $regex: keyword, $options: 'i' } },
                    { 'contacts.email': { $regex: keyword, $options: 'i' } }
                ]
            }
            : {};

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(take);
        const limit = parseInt(take);

        // Query with filter, pagination, and sort by companyName
        const items = await Customer.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ companyName: 1 });

        const total = await Customer.countDocuments(filter);

        return {
            data: items,
            page: parseInt(page),
            take: parseInt(take),
            total,
            totalPages: Math.ceil(total / take)
        };
    } catch (err) {
        console.error('Error getAllCustomersForListPage:', err.message);
        throw err;
    }
}

async function getCustomerById(id) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        return await Customer.findOne({ _id: objectId });
    } catch (err) {
        console.error('Error getCustomerById:', err.message);
        throw err;
    }
}

async function updateCustomer(id, data) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        data.updatedAt = new Date();
        return await Customer.findByIdAndUpdate(objectId, data, { new: true });
    } catch (err) {
        console.error('Error updateCustomer:', err.message);
        throw err;
    }
}

async function deleteCustomer(id) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        return await Customer.deleteOne({ _id: objectId });
    } catch (err) {
        console.error('Error deleteCustomer:', err.message);
        throw err;
    }
}

module.exports = {
    createCustomer,
    getAllCustomers,
    getAllCustomersForDropdownOption,
    getAllCustomersForListPage,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};
