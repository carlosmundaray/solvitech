const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // 100MB limit
  fileFilter: function(req, file, cb) {
    if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
      return cb(new Error('Only video files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Upload video
router.post('/', auth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, category, tags, visibility } = req.body;
    
    const video = new Video({
      title,
      description,
      videoUrl: `/uploads/${req.files.video[0].filename}`,
      thumbnailUrl: `/uploads/${req.files.thumbnail[0].filename}`,
      user: req.user.id,
      category,
      tags: tags ? tags.split(',') : [],
      visibility
    });

    await video.save();
    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ message: 'Error uploading video' });
  }
});

// Get all public videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find({ visibility: 'public' })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching videos' });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', 'username avatar subscribers')
      .populate('comments.user', 'username avatar');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching video' });
  }
});

// Update video
router.put('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedVideo);
  } catch (err) {
    res.status(500).json({ message: 'Error updating video' });
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await video.remove();
    res.json({ message: 'Video removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting video' });
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const newComment = {
      text: req.body.text,
      user: req.user.id
    };

    video.comments.unshift(newComment);
    await video.save();

    const populatedVideo = await Video.findById(req.params.id)
      .populate('comments.user', 'username avatar');

    res.json(populatedVideo.comments);
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment' });
  }
});

module.exports = router; 