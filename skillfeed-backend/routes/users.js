import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();
// Get user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('ideas');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});
// Update user profile
router.put('/:userId', auth, async (req, res) => {
  try {
    // Verify user is updating their own profile
    if (req.userId !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }
    const { name, bio, location, level, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        name: name || undefined,
        bio: bio || undefined,
        location: location || undefined,
        level: level || undefined,
        avatar: avatar || undefined,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});
// Add skill
router.post('/:userId/skills', auth, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    const { name, proficiency } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }
    const user = await User.findById(req.params.userId);
    // Check if skill already exists
    const skillExists = user.skills.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (skillExists) {
      return res.status(400).json({
        success: false,
        message: 'Skill already added'
      });
    }
    user.skills.push({
      name,
      proficiency: proficiency || 'Beginner'
    });
    await user.save();
    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding skill',
      error: error.message
    });
  }
});
// Remove skill
router.delete('/:userId/skills/:skillName', auth, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    const user = await User.findById(req.params.userId);
    user.skills = user.skills.filter(
      s => s.name.toLowerCase() !== req.params.skillName.toLowerCase()
    );
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Skill removed successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing skill',
      error: error.message
    });
  }
});
// Search users by skills and location
router.get('/search/query', async (req, res) => {
  try {
    const { skill, location, level } = req.query;
    const query = {};
    if (skill) {
      query['skills.name'] = { $regex: skill, $options: 'i' };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (level) {
      query.level = level;
    }
    const users = await User.find(query)
      .select('-password')
      .limit(20);
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message
    });
  }
});
export default router;
