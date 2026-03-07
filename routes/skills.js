import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all skills (trending)
router.get('/trending', async (req, res) => {
  try {
    const users = await User.find({}, { skills: 1 });
    
    // Count skill frequency
    const skillCounts = {};
    users.forEach(user => {
      user.skills.forEach(skill => {
        skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
      });
    });

    // Sort by frequency
    const trending = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));

    res.status(200).json({
      success: true,
      skills: trending
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trending skills',
      error: error.message
    });
  }
});

// Endorse a skill
router.post('/endorse/:userId/:skillName', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skill = user.skills.find(
      s => s.name.toLowerCase() === req.params.skillName.toLowerCase()
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    skill.endorsed = (skill.endorsed || 0) + 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill endorsed successfully',
      skill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error endorsing skill',
      error: error.message
    });
  }
});

// Get users by specific skill
router.get('/by-skill/:skillName', async (req, res) => {
  try {
    const users = await User.find({
      'skills.name': { $regex: req.params.skillName, $options: 'i' }
    })
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
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Recommend connections based on complementary skills
router.get('/recommendations/:userId', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get skills that the current user has
    const userSkills = currentUser.skills.map(s => s.name.toLowerCase());

    // Find users with complementary or same skills
    const recommendations = await User.find({
      _id: { $ne: req.params.userId },
      'skills.name': { $in: userSkills }
    })
      .select('-password')
      .limit(10);

    res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting recommendations',
      error: error.message
    });
  }
});

export default router;
