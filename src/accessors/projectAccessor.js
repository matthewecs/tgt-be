const { connectToMongo, mongoose } = require('./mongoAccessor');
const _ = require('lodash');

const PeriodSchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    period: { type: PeriodSchema, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    status: { type: String, enum: ['draft', 'offering', 'ongoing', 'done'], default: 'draft' },
    createdDate: { type: Date, default: Date.now },
    updateDate: { type: Date, default: Date.now }
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

async function createProject(data) {
    try {
        await connectToMongo();
        const project = new Project(data);
        return await project.save();
    } catch (err) {
        console.error('Error creating project:', err.message);
        throw err;
    }
}

async function getAllProjects() {
    try {
        await connectToMongo();
        return await Project.find({});
    } catch (err) {
        console.error('Error getAllProjects:', err.message);
        throw err;
    }
}

async function getAllProjectsForListPage(keyword, page = 1, take = 10) {
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
        const items = await Project.find(filter)
            .populate('customerId', 'companyName')
            .skip(skip)
            .limit(limit)
            .sort({ name: 1 });

        const total = await Project.countDocuments(filter);

        return {
            data: items,
            page: parseInt(page),
            take: parseInt(take),
            total,
            totalPages: Math.ceil(total / take)
        };
    } catch (err) {
        console.error('Error getAllProjectsForListPage:', err.message);
        throw err;
    }
}

async function getProjectById(id) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        return await Project.findOne({ _id: objectId }).populate('customerId', 'companyName address');
    } catch (err) {
        console.error('Error getProjectById:', err.message);
        throw err;
    }
}

async function updateProject(id, data) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        data.updateDate = new Date();
        return await Project.findByIdAndUpdate(objectId, data, { new: true }).populate('customerId', 'companyName');
    } catch (err) {
        console.error('Error updateProject:', err.message);
        throw err;
    }
}

async function deleteProject(id) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        return await Project.deleteOne({ _id: objectId });
    } catch (err) {
        console.error('Error deleteProject:', err.message);
        throw err;
    }
}

module.exports = {
    createProject,
    getAllProjects,
    getAllProjectsForListPage,
    getProjectById,
    updateProject,
    deleteProject
};
