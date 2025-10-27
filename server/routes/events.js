// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const QRCode = require('qrcode');

// GET all events
router.get('/', async (req, res) => {
  const events = await Event.find().sort({ dateTime: 1 });
  res.json(events);
});

// GET QR Code as PNG
router.get('/:id/qr', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).send('Event not found');

    const feedbackUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/events/feedback/${event._id}`;
    const qrBuffer = await QRCode.toBuffer(feedbackUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#1a2a6c', light: '#ffffff' }
    });

    res.set('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (err) {
    res.status(500).send('QR failed');
  }
});

// POST: Register for event
router.post('/:id/register', async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    await Event.findByIdAndUpdate(req.params.id, {
      $push: {
        registrations: { name, email, phone }
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Feedback
router.post('/feedback/:id', async (req, res) => {
  const { name, number, rating, comment } = req.body;
  if (!name || !number || !rating || !comment) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    await Event.findByIdAndUpdate(req.params.id, {
      $push: {
        feedbacks: { name, number, rating, comment }
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT: Admin update
router.put('/', async (req, res) => {
  const { username, password, events } = req.body;
  if (username !== 'admin' || password !== 'secret') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    await Event.deleteMany({});
    await Event.insertMany(events);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;