const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require('cors');

// CORS configuration for cookie-based authentication
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow localhost for development
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:8080'
        ];
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Allow any origin in development
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const workStepRoutes = require('./routes/workStepRoutes');
app.use("/work-step", workStepRoutes);

const workFlowRoutes = require('./routes/workFlowRoutes');
app.use("/workflow", workFlowRoutes);

const customerRoutes = require('./routes/customerRoutes');
app.use("/customer", customerRoutes);

const workStepCategoryRoutes = require('./routes/workStepCategoryRoutes');
app.use("/workstep-category", workStepCategoryRoutes);

const projectRoutes = require('./routes/projectRoutes');
app.use("/project", projectRoutes);

const userRoutes = require('./routes/userRoutes');
app.use("/user", userRoutes);

app.listen(PORT, "0.0.0.0", (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);