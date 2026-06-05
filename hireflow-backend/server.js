
require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Log incoming requests for dev/debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Import API Routers
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Bind API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Serve Frontend Static Files from sibling folder '/hirefront/'
const frontendPath = path.join(__dirname, '../hirefront');
app.use(express.static(frontendPath));

// Redirect root URL to index.html login page
app.get('/', (req, res) => {
  res.redirect('/pages/index.html');
});

// Global Error Handler for uncaught exceptions
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'A serious error occurred on the server.' });
});

const db = require('./config/db');

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Start Server and listen on specified port
app.listen(PORT, () => {
  console.log(`🚀 EmployNet Server is running on port ${PORT}`);
  console.log(`🔗 Local API: http://localhost:${PORT}/api`);
  console.log(`💻 User Interface: http://localhost:${PORT}/pages/index.html`);
});
