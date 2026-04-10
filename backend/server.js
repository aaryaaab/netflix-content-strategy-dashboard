const express = require('express');
const cors = require('cors');
const { loadData } = require('./services/dataService');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Load data and start server
loadData()
  .then(() => {
    console.log('✅ Dataset loaded successfully.');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to load dataset:', err);
    process.exit(1);
  });
