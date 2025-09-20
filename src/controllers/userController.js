const userService = require('../services/userService');
const _ = require('lodash');

const createUser = async (req, res) => {
    try {
        const userData = req.body;
        
        // Validate required fields
        if (!userData.username || !userData.email || !userData.password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }

        const user = await userService.createUser(userData);
        
        res.status(201).json({
            success: true,
            data: user,
            message: 'User created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;
        
        const user = await userService.updateUser(id, userData);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: user,
            message: 'User updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { loginCredential, password } = req.body;
        
        if (!loginCredential || !password) {
            return res.status(400).json({
                success: false,
                message: 'Login credential (username or email) and password are required'
            });
        }

        const result = await userService.login(loginCredential, password);
        
        // Set JWT token as HTTP-only cookie
        res.cookie('auth_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // More flexible for development
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
            path: '/', // Available for all routes
            domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost' // Set domain for localhost in development
        });
        
        res.json({
            success: true,
            data: result,
            message: 'Login successful'
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.auth_token;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        const result = await userService.logout(token);
        
        // Clear the auth cookie with same options as when set
        res.clearCookie('auth_token', {
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
        });
        
        res.json({
            success: true,
            data: result,
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        // Try to get token from Authorization header first, then from cookie
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.auth_token;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        const decoded = userService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = {
    createUser,
    updateUser,
    login,
    logout,
    authenticateToken
};
