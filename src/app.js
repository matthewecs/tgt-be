const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require('cors')

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

const workStepRoutes = require('./routes/workStepRoutes');
app.use("/work-step", workStepRoutes);

const workFlowRoutes = require('./routes/workFlowRoutes');
app.use("/workflow", workFlowRoutes);

const customerRoutes = require('./routes/customerRoutes');
app.use("/customer", customerRoutes);

const workStepCategoryRoutes = require('./routes/workStepCategoryRoutes');
app.use("/workstep-category", workStepCategoryRoutes);

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);