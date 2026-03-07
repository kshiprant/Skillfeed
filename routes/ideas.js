import express from 'express';
import Idea from '../models/Idea.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create idea
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, skillsNeeded, stage, tags, image } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const idea = new Idea({
      title,
      description,
      category,
      skillsNeeded,
      stage,
      tags,
      image,
      creator: req.userId
    });

    await idea.save();
    await idea.populate('creator', 'name avatar email');

    // Add idea to user's ideas array
    await User.findByIdAndUpdate(
      req.userId,
      { $push: { ideas: idea._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Idea created successfully',
      idea
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating idea',
      error: error.message
    });
  }
});

// Get all ideas
router.get('/', async (req, res) => {
  try {
    const { category, stage, skill, page = 1, limit = 10 } = req.query;
    const query = { isPublic: true };

    if (category) query.category = category;
    if (stage) query.stage = stage;
    if (skill) {
      query['skillsNeeded.skill'] = { $regex: skill, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const ideas = await Idea.find(query)
      .populate('creator', 'name avatar location level')
      .populate('interestedUsers.userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Idea.countDocuments(query);

    res.status(200).json({
      success: true,
      count: ideas.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      ideas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ideas',
      error: error.message
    });
  }
});

// Get single idea
router.get('/:ideaId', async (req, res) => {
  try {
    const idea = await Idea.findByIdAndUpdate(
      req.params.ideaId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('creator', 'name avatar location level bio')
      .populate('interestedUsers.userId', 'name avatar level');

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    res.status(200).json({
      success: true,
      idea
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching idea',
      error: error.message
    });
  }
});

// Update idea
router.put('/:ideaId', auth, async (req, res) => {
  try {
    let idea = await Idea.findById(req.params.ideaId);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Verify ownership
    if (idea.creator.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this idea'
      });
    }

    const { title, description, category, skillsNeeded, stage, tags, image } = req.body;

    idea = await Idea.findByIdAndUpdate(
      req.params.ideaId,
      {
        title: title || idea.title,
        description: description || idea.description,
        category: category || idea.category,
        skillsNeeded: skillsNeeded || idea.skillsNeeded,
        stage: stage || idea.stage,
        tags: tags || idea.tags,
        image: image || idea.image,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('creator', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Idea updated successfully',
      idea
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating idea',
      error: error.message
    });
  }
});

// Delete idea
router.delete('/:ideaId', auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.ideaId);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    if (idea.creator.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this idea'
      });
    }

    await Idea.findByIdAndDelete(req.params.ideaId);

    // Remove from user's ideas
    await User.findByIdAndUpdate(
      req.userId,
      { $pull: { ideas: req.params.ideaId } }
    );

    res.status(200).json({
      success: true,
      message: 'Idea deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting idea',
      error: error.message
    });
  }
});

// Express interest in idea
router.post('/:ideaId/interest', auth, async (req, res) => {
  try {
    const { role } = req.body;

    const idea = await Idea.findById(req.params.ideaId);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Check if already interested
    const alreadyInterested = idea.interestedUsers.some(
      u => u.userId.toString() === req.userId
    );

    if (alreadyInterested) {
      return res.status(400).json({
        success: false,
        message: 'You are already interested in this idea'
      });
    }

    idea.interestedUsers.push({
      userId: req.userId,
      role: role || 'Other'
    });

    await idea.save();
    await idea.populate('interestedUsers.userId', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Interest recorded successfully',
      idea
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording interest',
      error: error.message
    });
  }
});

// Remove interest from idea
router.delete('/:ideaId/interest', auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.ideaId);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    idea.interestedUsers = idea.interestedUsers.filter(
      u => u.userId.toString() !== req.userId
    );

    await idea.save();

    res.status(200).json({
      success: true,
      message: 'Interest removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing interest',
      error: error.message
    });
  }
});

export default router;
