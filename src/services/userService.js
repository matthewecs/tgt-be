const userAccessor = require('../accessors/userAccessor');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const createUser = async (userData) => {
    // Check if user already exists
    const existingUserByUsername = await userAccessor.getUserByUsername(userData.username);
    if (existingUserByUsername) {
        throw new Error('Username already exists');
    }

    const existingUserByEmail = await userAccessor.getUserByEmail(userData.email);
    if (existingUserByEmail) {
        throw new Error('Email already exists');
    }

    // Create user
    const user = await userAccessor.createUser(userData);
    
    // Return user without password
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
};

const updateUser = async (id, userData) => {
    // Check if username/email already exists (excluding current user)
    if (userData.username) {
        const existingUser = await userAccessor.getUserByUsername(userData.username);
        if (existingUser && existingUser._id.toString() !== id) {
            throw new Error('Username already exists');
        }
    }

    if (userData.email) {
        const existingUser = await userAccessor.getUserByEmail(userData.email);
        if (existingUser && existingUser._id.toString() !== id) {
            throw new Error('Email already exists');
        }
    }

    // Don't allow password updates through this method
    if (userData.password) {
        delete userData.password;
    }

    return userAccessor.updateUser(id, userData);
};

const login = async (loginCredential, password) => {
    // Find user by username or email
    let user = await userAccessor.getUserByUsername(loginCredential);
    if (!user) {
        user = await userAccessor.getUserByEmail(loginCredential);
    }

    if (!user) {
        throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
        throw new Error('Account is inactive');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    // Update last login
    await userAccessor.updateLastLogin(user._id);

    // Generate JWT token
    const token = jwt.sign(
        { 
            userId: user._id, 
            username: user.username,
            role: user.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data without password and token
    const { password: userPassword, ...userWithoutPassword } = user.toObject();
    
    return {
        user: userWithoutPassword,
        token
    };
};

const logout = async (token) => {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    // You could implement token blacklisting with Redis or a database table
    return { message: 'Logged out successfully' };
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

module.exports = {
    createUser,
    updateUser,
    login,
    logout,
    verifyToken
};
