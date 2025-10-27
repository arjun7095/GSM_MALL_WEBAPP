const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const pagesRouter = require('./routes/pages');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/gsm-mall', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/pages', pagesRouter);
app.use('/api/explore', require('./routes/explore'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/events', require('./routes/events'));

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'GSM Mall Marketing Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});