const { connectToMongo, mongoose } = require('./mongoAccessor');
const _ = require('lodash');

const WorkStepCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const WorkStepCategory = mongoose.models.WorkStepCategory || mongoose.model('WorkStepCategory', WorkStepCategorySchema);

async function createWorkStepCategory(data) {
    try {
        await connectToMongo();
        const workStepCategory = new WorkStepCategory(data);
        return await workStepCategory.save();
    } catch (err) {
        console.error('Error creating workStepCategory:', err.message);
        throw err;
    }
}

async function getAllWorkStepCategories() {
    try {
        await connectToMongo();
        return await WorkStepCategory.find({});
    } catch (err) {
        console.error('Error getAllWorkStepCategories:', err.message);
        throw err;
    }
}

async function getAllWorkStepCategoriesForListPage(keyword, page = 1, take = 10) {
    try {
        await connectToMongo();
        
        // Build filter for keyword search (case-insensitive, partial match on name or description)
        const filter = keyword
            ? {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } }
                ]
            }
            : {};

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(take);
        const limit = parseInt(take);

        // Query with filter, pagination, and sort by name
        const items = await WorkStepCategory.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ name: 1 });

        const total = await WorkStepCategory.countDocuments(filter);

        return {
            data: items,
            page: parseInt(page),
            take: parseInt(take),
            total,
            totalPages: Math.ceil(total / take)
        };
    } catch (err) {
        console.error('Error getAllWorkStepCategoriesForListPage:', err.message);
        throw err;
    }
}

async function getWorkStepCategoryById(id) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        return await WorkStepCategory.findOne({ _id: objectId });
    } catch (err) {
        console.error('Error getWorkStepCategoryById:', err.message);
        throw err;
    }
}

async function updateWorkStepCategory(id, data) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        data.updatedAt = new Date();
        return await WorkStepCategory.findByIdAndUpdate(objectId, data, { new: true });
    } catch (err) {
        console.error('Error updateWorkStepCategory:', err.message);
        throw err;
    }
}

async function deleteWorkStepCategory(id) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        return await WorkStepCategory.deleteOne({ _id: objectId });
    } catch (err) {
        console.error('Error deleteWorkStepCategory:', err.message);
        throw err;
    }
}

module.exports = {
    createWorkStepCategory,
    getAllWorkStepCategories,
    getAllWorkStepCategoriesForListPage,
    getWorkStepCategoryById,
    updateWorkStepCategory,
    deleteWorkStepCategory
};
