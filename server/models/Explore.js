// models/Explore.js
const mongoose = require('mongoose');

/**
 * Media item (image or video) stored in GridFS
 * url = "/api/upload/<ObjectId>"
 */
const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  originalName: String,
  contentType: String
});

/**
 * Store offer
 */
const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
});

/**
 * Individual store
 */
const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // matches category.name
  description: String,
  image: { type: String }, // GridFS file ID (or null)
  media: [mediaSchema],
  offers: [offerSchema]
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  icon: String // e.g., "FaTshirt", "FaUtensils"
}, { timestamps: true });

/**
 * Main Explore document (single-document design)
 */
const exploreSchema = new mongoose.Schema({
  categories: [categorySchema],
  stores: [storeSchema]
}, {
  collection: 'explore',
  timestamps: true
});

/**
 * Auto-populate default categories on first save
 */
exploreSchema.pre('save', function (next) {
  if (this.isNew && this.categories.length === 0) {
    const defaultCategories = [
      'Apparels',
      'Food Court',
      'Jewellery',
      'Restaurant & Bar',
      'Movies & Entertainments',
      'Game Zone',
      'Fashion Stores',
      'Banquets'
    ];

    this.categories = defaultCategories.map(name => ({ name }));
  }
  next();
});

/**
 * Ensure only one Explore document exists
 * (Optional: use upsert in routes instead of index)
 */
// exploreSchema.index({ _id: 1 }); // REMOVED — MongoDB auto-indexes _id

module.exports = mongoose.model('Explore', exploreSchema);