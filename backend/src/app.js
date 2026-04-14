require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ success: true, message: 'Backend API is running' }));

app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/quizzes',     require('./routes/quiz.routes'));
app.use('/api/submissions', require('./routes/submission.routes'));
app.use('/api/rankings',    require('./routes/ranking.routes'));
app.use('/api/llm',         require('./routes/llm.routes'));
app.use('/api/admin',       require('./routes/admin.routes'));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

module.exports = app;