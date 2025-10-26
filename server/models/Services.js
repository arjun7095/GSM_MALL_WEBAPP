const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  icon: String,
  title: String,
  desc: String
});

const servicesSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  services: [serviceSchema]
});

module.exports = mongoose.model('Services', servicesSchema);