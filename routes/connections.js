import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Send connection request
router.post('/request/:targetUserId', auth, async (req, res) => {
  try {
    const { targetUserId } = req.params;

    if (req.userId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot connect with yourself'
      });
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if connection already exists or pending
    const existingConnection = targetUser.connections.find(
      c => c.userId.toString() === req.userId
    );

    if (existingConnection) {
      if (existingConnection.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Connection request already pending'
        });
      }
      if (existingConnection.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Already connected with this user'
        });
      }
    }

    // Add connection request to target user
    targetUser.connections.push({
      userId: req.userId,
      status: 'pending'
    });

    await targetUser.save();

    // Also add reverse pending connection to current user
    const currentUser = await User.findById(req.userId);
    currentUser.connections.push({
      userId: targetUserId,
      status: 'pending'
    });

    await currentUser.save();

    res.status(200).json({
      success: true,
      message: 'Connection request sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending connection request',
      error: error.message
    });
  }
});

// Accept connection request
router.post('/accept/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(req.userId);
    const requestingUser = await User.findById(userId);

    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update connection status for current user
    const connection = currentUser.connections.find(
      c => c.userId.toString() === userId
    );

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    connection.status = 'accepted';
    await currentUser.save();

    // Update connection status for requesting user
    const reverseConnection = requestingUser.connections.find(
      c => c.userId.toString() === req.userId
    );

    if (reverseConnection) {
      reverseConnection.status = 'accepted';
      await requestingUser.save();
    }

    res.status(200).json({
      success: true,
      message: 'Connection accepted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting connection',
      error: error.message
    });
  }
});

// Reject connection request
router.post('/reject/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(req.userId);
    const requestingUser = await User.findById(userId);

    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove connection request from current user
    currentUser.connections = currentUser.connections.filter(
      c => c.userId.toString() !== userId
    );

    await currentUser.save();

    // Remove from requesting user as well
    requestingUser.connections = requestingUser.connections.filter(
      c => c.userId.toString() !== req.userId
    );

    await requestingUser.save();

    res.status(200).json({
      success: true,
      message: 'Connection rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting connection',
      error: error.message
    });
  }
});

// Get user's connections
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('connections.userId', 'name avatar location level');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const connections = {
      pending: user.connections.filter(c => c.status === 'pending'),
      accepted: user.connections.filter(c => c.status === 'accepted')
    };

    res.status(200).json({
      success: true,
      connections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching connections',
      error: error.message
    });
  }
});

// Get pending connection requests for current user
router.get('/pending/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('connections.userId', 'name avatar location level bio');

    const pendingRequests = user.connections.filter(c => c.status === 'pending');

    res.status(200).json({
      success: true,
      count: pendingRequests.length,
      requests: pendingRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message
    });
  }
});

export default router;
