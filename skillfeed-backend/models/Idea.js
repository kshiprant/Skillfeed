import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: 2000
  },
  category: {
    type: String,
    enum: [
      'Technology',
      'Finance',
      'Health',
      'Education',
      'E-commerce',
      'Entertainment',
      'Social',
      'Other'
    ],
    default: 'Other'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillsNeeded: [{
    skill: String,
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert']
    }
  }],
  stage: {
    type: String,
    enum: ['Idea', 'MVP', 'Launching', 'Growing'],
    default: 'Idea'
  },
  interestedUsers: [{
    userId: mongoose.Schema.Types.ObjectId,
    role: {
      type: String,
      enum: ['Founder', 'Developer', 'Designer', 'Marketer', 'Investor', 'Other']
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  image: String,
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster searches
ideaSchema.index({ category: 1, createdAt: -1 });
ideaSchema.index({ 'skillsNeeded.skill': 1 });

export default mongoose.model('Idea', ideaSchema);
