const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors()); 
app.use(express.json()); 

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const uploadRoutes = require("./routes/uploadRoutes");
const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);

app.use("/api/upload", uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Welcome to the CampusCrate API! 🚀' 
  });
});

module.exports = app;