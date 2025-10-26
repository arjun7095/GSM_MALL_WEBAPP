const express = require('express');
const router = express.Router();
const Explore = require('../models/Explore');

// GET Categories
router.get('/categories', async (req, res) => {
  const doc = await Explore.findOne() || new Explore({ categories: [
    { name: 'Apparels' }, { name: 'Food Court' }, { name: 'Jewellery' },
    { name: 'Restaurant & Bar' }, { name: 'Movies & Entertainments' },
    { name: 'Game Zone' }, { name: 'Fashion Stores' }, { name: 'Banquets' }
  ] });
  res.json(doc.categories);
});

// GET Stores
router.get('/stores', async (req, res) => {
  const doc = await Explore.findOne();
  res.json(doc?.stores || []);
});

// // PUT Explore Data (admin)
// router.put('/', async (req, res) => {
//   const { username, password, categories, stores } = req.body;
//   if (username !== 'admin' || password !== 'secret') return res.status(401).json({ message: 'Unauthorized' });
//   let doc = await Explore.findOne() || new Explore();
//   doc.categories = categories;
//   doc.stores = stores;
//   await doc.save();
//   res.json(doc);
// });


// PUT /api/explore
router.put('/', async (req, res) => {
  const { username, password, categories, stores } = req.body;

  if (username !== 'admin' || password !== 'secret') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    let doc = await Explore.findOne() || new Explore();

    doc.categories = categories;
    doc.stores = stores.map(s => ({
      ...s,
      image: s.image || null,
      media: (s.media || []).map(m => ({
        type: m.type,
        url: m.url,
        originalName: m.originalName,
        contentType: m.contentType
      })),
      offers: s.offers || []
    }));

    await doc.save(); // ← Only one .save()

    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;