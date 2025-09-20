const { connectToMongo, mongoose } = require('./mongoAccessor');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
    status: { type: String, enum: ['active', 'inactive', 'deleted'], default: 'active' },
    lastLogin: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createUser(data) {
    try {
        await connectToMongo();
        const user = new User(data);
        return await user.save();
    } catch (err) {
        console.error('Error creating user:', err.message);
        throw err;
    }
}

async function getUserById(id) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        return await User.findById(objectId).select('-password');
    } catch (err) {
        console.error('Error getUserById:', err.message);
        throw err;
    }
}

async function getUserByUsername(username) {
    try {
        await connectToMongo();
        return await User.findOne({ username, status: { $ne: 'deleted' } });
    } catch (err) {
        console.error('Error getUserByUsername:', err.message);
        throw err;
    }
}

async function getUserByEmail(email) {
    try {
        await connectToMongo();
        return await User.findOne({ email, status: { $ne: 'deleted' } });
    } catch (err) {
        console.error('Error getUserByEmail:', err.message);
        throw err;
    }
}

async function updateUser(id, data) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        data.updatedAt = new Date();
        return await User.findByIdAndUpdate(objectId, data, { new: true }).select('-password');
    } catch (err) {
        console.error('Error updateUser:', err.message);
        throw err;
    }
}

async function updateLastLogin(id) {
    try {
        await connectToMongo();
        const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
        return await User.findByIdAndUpdate(objectId, { 
            lastLogin: new Date(),
            updatedAt: new Date()
        }, { new: true }).select('-password');
    } catch (err) {
        console.error('Error updateLastLogin:', err.message);
        throw err;
    }
}

module.exports = {
    createUser,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    updateUser,
    updateLastLogin
};
