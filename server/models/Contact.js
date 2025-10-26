// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  mapEmbed: { type: String }
});

module.exports = mongoose.model('Contact', contactSchema);