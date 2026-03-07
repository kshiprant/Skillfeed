import express from 'express';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get or create conversation
router.post('/conversation/:otherUserId', auth, async (req, res) => {
  try {
    const { otherUserId } = req.params;

    if (req.userId === otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot chat with yourself'
      });
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, otherUserId] }
    }).populate('participants', 'name avatar');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.userId, otherUserId],
        messages: []
      });
      await conversation.save();
      await conversation.populate('participants', 'name avatar');
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error managing conversation',
      error: error.message
    });
  }
});

// Send message
router.post('/:conversationId/send', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    const message = {
      senderId: req.userId,
      content: content.trim(),
      createdAt: new Date(),
      isRead: false
    };

    conversation.messages.push(message);
    conversation.lastMessage = {
      content: content.trim(),
      sentAt: new Date(),
      senderId: req.userId
    };
    conversation.lastMessageTime = new Date();

    await conversation.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
});

// Get conversation messages
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate('participants', 'name avatar email')
      .populate('messages.senderId', 'name avatar');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(
      p => p._id.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
});

// Get all conversations for user
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId
    })
      .populate('participants', 'name avatar email')
      .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
});

// Mark messages as read
router.put('/:conversationId/mark-read', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Mark all messages from other user as read
    conversation.messages.forEach(msg => {
      if (msg.senderId.toString() !== req.userId) {
        msg.isRead = true;
      }
    });

    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message
    });
  }
});

// Delete conversation
router.delete('/:conversationId', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await Conversation.findByIdAndDelete(req.params.conversationId);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: error.message
    });
  }
});

export default router;
