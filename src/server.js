require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/user', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/roles', require('./routes/roles'));
app.use('/permissions', require('./routes/permissions'));
app.use('/customers', require('./routes/customers'));
app.use('/offering-templates', require('./routes/templates'));
app.use('/offerings', require('./routes/offerings'));
app.use('/company', require('./routes/company'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TGT Backend running on http://localhost:${PORT}`);
});
