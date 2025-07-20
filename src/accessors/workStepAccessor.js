const { connectToMongo, mongoose } = require('./mongoAccessor');

const OptionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    preReqValue: { type: Number },
    preReqUnit: { type: String },
    metricValue: { type: Number },
    metricUnit: { type: String },
    price: { type: Number },
    quantity: { type: Number }
}, { _id: false });

const WorkStepSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    options: { type: [OptionSchema], default: [] },
    nextActions: { type: [String], default: [] }
});

const WorkStep = mongoose.models.WorkStep || mongoose.model('WorkStep', WorkStepSchema);

async function upsertWorkStep(datum) {
    try {
        await connectToMongo();

        await WorkStep.deleteOne({_id: datum.id});

        const transformed = {
            _id: datum.id,
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

module.exports = { upsertWorkStep, getAllWorkSteps };
