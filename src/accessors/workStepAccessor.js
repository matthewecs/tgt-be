const { connectToMongo, mongoose } = require('./mongoAccessor');
const _ = require('lodash'); // Import lodash

const OptionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    preReqValue: { type: Number },
    preReqUnit: { type: String },
    metricValue: { type: Number },
    metricUnit: { type: String },
    price: { type: Number },
    quantity: { type: Number },
    minValue: { type: Number },
    maxValue: { type: Number }
}, { _id: false });

const NextActionSchema = new mongoose.Schema({
    nextUniqueKey: { type: String, required: true },
    isMandatory: { type: Boolean, required: true },
}, { _id: false });

const WorkStepSchema = new mongoose.Schema({
    name: { type: String, required: true },
    uniqueKey: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkStepCategory', required: true },
    description: { type: String },
    options: { type: [OptionSchema], default: [] },
    nextActions: { type: [NextActionSchema], default: [] }
});

const WorkStep = mongoose.models.WorkStep || mongoose.model('WorkStep', WorkStepSchema);

async function upsertWorkStep(datum) {
    try {
        await connectToMongo();

        const uniqueKey = datum.categoryId + '-' + _.kebabCase(datum.name)
        await WorkStep.deleteOne({uniqueKey: uniqueKey});
        await WorkStep.deleteOne({_id: datum.id});

        const transformed = {
            _id: datum.id,
            uniqueKey,
            ...datum
        };
    
        await WorkStep.insertOne(transformed);
      } catch (err) {
        if (err.name === 'MongoServerError' && err.code === 11000) {
            return
        }

        console.error('Error saving wotkstep:', err.message);
        throw err;
      }
    }

async function getAllWorkSteps() {
    try {
        await connectToMongo();

        return WorkStep.find({});
    } catch (err) {
        console.error('Error getAllWorkSteps:', err.message);
        throw err;
    }
}

async function getAllWorkStepsWithProjection(categoryId = null) {
    try {
        await connectToMongo();

        // Build filter for categoryId if provided
        const filter = categoryId ? { categoryId } : {};

        return WorkStep.find(filter, {
            name: 1,
            uniqueKey: 1,
            categoryId: 1
        });
    } catch (err) {
        console.error('Error getAllWorkSteps:', err.message);
        throw err;
    }
}

async function getAllWorkStepsForListPage(keyword, page = 1, take = 10, categoryId = null) {
    try {
        await connectToMongo();
        
        // Build filter for keyword search and optional categoryId
        const filter = {};
        
        // Add keyword search filter
        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }
        
        // Add categoryId filter if provided
        if (categoryId) {
            filter.categoryId = categoryId;
        }

        const projection = {
            name: 1,
            uniqueKey: 1,
            description: 1,
            options: 1
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(take);
        const limit = parseInt(take);

        // Query with filter, pagination, and sort by name
        const items = await WorkStep.find(filter, projection)
            .skip(skip)
            .limit(limit)
            .sort({ name: 1 });

        const total = await WorkStep.countDocuments(filter);

        return {
            data: items,
            page: parseInt(page),
            take: parseInt(take),
            total,
            totalPages: Math.ceil(total / take)
        };
    } catch (err) {
        console.error('Error getAllWorkStepsForListPage:', err.message);
        throw err;
    }
}

async function deleteEntity(id) {
    try {
        await connectToMongo();

        // Delete the WorkStep document by _id
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        const result = await WorkStep.deleteOne({ _id: objectId });

        return result;
    } catch (err) {
        console.error('Error deleteEntity:', err.message);
        throw err;
    }
}

async function getById(id) {
    try {
        await connectToMongo();

        // Find WorkStep by _id (string or ObjectId)
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        const result = await WorkStep.findOne({ _id: objectId });

        return result;
    } catch (err) {
        console.error('Error getById:', err.message);
        throw err;
    }
}

async function getByName(name, categoryId) {
    try {
        await connectToMongo();
        // Find WorkStep by name (case-insensitive)
        return await WorkStep.findOne({ uniqueKey: categoryId + '-' + _.kebabCase(name) });
    } catch (err) {
        console.error('Error getByName:', err.message);
        throw err;
    }
}

async function findsByUniqueKeys(uniqueKeys) {
    try {
        await connectToMongo();
        // Find WorkSteps by an array of uniqueKeys
        return await WorkStep.find({ uniqueKey: { $in: uniqueKeys } });
    } catch (err) {
        console.error('Error findsByUniqueKeys:', err.message);
        throw err;
    }
}

module.exports = { upsertWorkStep, getAllWorkSteps, getAllWorkStepsWithProjection, getAllWorkStepsForListPage, deleteEntity, getById, getByName, findsByUniqueKeys };
