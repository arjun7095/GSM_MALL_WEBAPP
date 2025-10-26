// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gfsBucket = null;

// Initialize GridFS after DB connection
mongoose.connection.once('open', () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
  console.log('GridFS Bucket initialized');
});

// Multer memory storage (we stream directly to GridFS)
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
  if (!gfsBucket) {
    return res.status(503).json({ message: 'Upload service not ready' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { originalname, mimetype, buffer } = req.file;

  const filename = `mallboost_${Date.now()}_${originalname}`;
  const writeStream = gfsBucket.openUploadStream(filename, {
    contentType: mimetype
  });

  writeStream.on('error', (err) => {
    console.error('GridFS upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  });

  writeStream.on('finish', () => {
    const fileUrl = `/api/upload/${writeStream.id}`;
    res.json({
      url: fileUrl,
      id: writeStream.id.toString(),
      originalName: originalname,
      contentType: mimetype
    });
  });

  // Pipe buffer to GridFS
  writeStream.end(buffer);
});

// GET /api/upload/:id
router.get('/:id', (req, res) => {
  if (!gfsBucket) {
    return res.status(503).json({ message: 'Storage not ready' });
  }

  const fileId = new mongoose.Types.ObjectId(req.params.id);

  gfsBucket.find({ _id: fileId }).toArray((err, files) => {
    if (err || !files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    const readStream = gfsBucket.openDownloadStream(fileId);
    readStream.on('error', () => res.status(404).send('Not found'));
    readStream.pipe(res);
  });
});

module.exports = router;