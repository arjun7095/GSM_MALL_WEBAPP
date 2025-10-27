// models/Event.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true }, // Mobile as String (for +91, 0 prefix)
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true }, // Mobile as String
  registeredAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateTime: { type: Date, required: true },
  description: String,
  poster: String,
  feedbacks: [feedbackSchema],
  registrations: [registrationSchema] // NEW
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);