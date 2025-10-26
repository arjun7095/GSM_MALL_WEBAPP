const express = require('express');
const router = express.Router();
const About = require('../models/About');
const Contact = require('../models/Contact');
const Services = require('../models/Services');

// Auth endpoint
router.post('/auth', (req, res) => {
  const { username, password } = req.body;
  // Hardcoded for demo; in production, use env vars and bcrypt
  if (username === 'admin' && password === 'secret') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// About
router.get('/about', async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = new About({ content: 'Default About content for MallBoost: Your digital marketing platform for malls.' });
      await about.save();
    }
    res.json(about);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/about', async (req, res) => {
  const { username, password, content } = req.body;
  if (username !== 'admin' || password !== 'secret') {
    console.log(username)
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    let about = await About.findOne();
    if (!about) about = new About();
    about.content = content;
    await about.save();
    res.json(about);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Contact
router.get('/contact', async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = new Contact({
        address: '123 Mall Avenue, NY 10001',
        phone: '+1 800 555 0199',
        email: 'support@mallboost.com',
        mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>' // Replace with real embed
      });
      await contact.save();
    }
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/contact', async (req, res) => {
  const { username, password, address, phone, email, mapEmbed } = req.body;
  if (username !== 'admin' || password !== 'secret') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    let contact = await Contact.findOne();
    if (!contact) contact = new Contact();
    contact.address = address;
    contact.phone = phone;
    contact.email = email;
    contact.mapEmbed = mapEmbed;
    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Services
router.get('/services', async (req, res) => {
  let doc = await Services.findOne() || new Services({
    title: "OUR SERVICES",
    subtitle: "Everything your mall needs to thrive digitally",
    services: [
      { icon: "ChartLine", title: "Analytics Dashboard", desc: "Real-time footfall & sales insights" },
      { icon: "Megaphone", title: "Campaign Manager", desc: "Launch SMS, email & in-app promotions" },
      { icon: "Store", title: "Brand Collaboration", desc: "Connect retailers with joint offers" },
      { icon: "Calendar", title: "Event Promotion", desc: "Boost festivals, sales & pop-ups" },
    ]
  });
  await doc.save();
  res.json(doc);
});

// PUT Services
router.put('/services', async (req, res) => {
  const { username, password, title, subtitle, services } = req.body;
  if (username !== 'admin' || password !== 'secret') return res.status(401).json({ message: 'Unauthorized' });

  let doc = await Services.findOne() || new Services();
  doc.title = title;
  doc.subtitle = subtitle;
  doc.services = services;
  await doc.save();
  res.json(doc);
});
module.exports = router;