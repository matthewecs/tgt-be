const { connectToMongo, mongoose } = require('./mongoAccessor');
const _ = require('lodash');

const SelectedOptionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    preReqValue: { type: Number },
    preReqUnit: { type: String },
    metricValue: { type: Number },
    metricUnit: { type: String },
    price: { type: Number },
    quantity: { type: Number },
    eligible: { type: Boolean },
    originalQuantity: { type: Number },
    conversionRate: { type: Number }
}, { _id: false });

const StepSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    uniqueKey: { type: String, required: true },
    description: { type: String }
}, { _id: false });

const SelectedStepSchema = new mongoose.Schema({
    step: { type: StepSchema, required: true },
    selectedOption: { type: SelectedOptionSchema, required: true }
}, { _id: false });

const WorkFlowSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    targetProductionCapacity: { type: Number, required: true },
    selectedSteps: { type: [SelectedStepSchema], default: [] },
    totalSteps: { type: Number, required: true },
    employeeName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const WorkFlow = mongoose.models.WorkFlow || mongoose.model('WorkFlow', WorkFlowSchema);

async function createWorkFlow(data) {
    try {
        await connectToMongo();
        const workFlow = new WorkFlow(data);
        return await workFlow.save();
    } catch (err) {
        console.error('Error creating workflow:', err.message);
        throw err;
    }
}

async function getAllWorkFlows() {
    try {
        await connectToMongo();
        return await WorkFlow.find({});
    } catch (err) {
        console.error('Error getAllWorkFlows:', err.message);
        throw err;
    }
}

async function getAllWorkFlowsForListPage(keyword, page = 1, take = 10) {
    try {
        await connectToMongo();
        
        // Build filter for keyword search (case-insensitive, partial match on projectName or employeeName)
        const filter = keyword
            ? {
                $or: [
                    { projectName: { $regex: keyword, $options: 'i' } },
                    { employeeName: { $regex: keyword, $options: 'i' } }
                ]
            }
            : {};

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(take);
        const limit = parseInt(take);

        // Query with filter, pagination, and sort by createdAt
        const items = await WorkFlow.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await WorkFlow.countDocuments(filter);

        return {
            data: items,
            page: parseInt(page),
            take: parseInt(take),
            total,
            totalPages: Math.ceil(total / take)
        };
    } catch (err) {
        console.error('Error getAllWorkFlowsForListPage:', err.message);
        throw err;
    }
}

async function getWorkFlowById(id) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        return await WorkFlow.findOne({ _id: objectId });
    } catch (err) {
        console.error('Error getWorkFlowById:', err.message);
        throw err;
    }
}

async function updateWorkFlow(id, data) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        data.updatedAt = new Date();
        return await WorkFlow.findByIdAndUpdate(objectId, data, { new: true });
    } catch (err) {
        console.error('Error updateWorkFlow:', err.message);
        throw err;
    }
}

async function deleteWorkFlow(id) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        return await WorkFlow.deleteOne({ _id: objectId });
    } catch (err) {
        console.error('Error deleteWorkFlow:', err.message);
        throw err;
    }
}

module.exports = {
    createWorkFlow,
    getAllWorkFlows,
    getAllWorkFlowsForListPage,
    getWorkFlowById,
    updateWorkFlow,
    deleteWorkFlow
};
