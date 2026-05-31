import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
   
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ['answer', 'question'],
      default: 'answer',
    },
    voteType: {
      type: String,
      enum: ['up', 'down'],
      required: true,
    },
  },
  { timestamps: true }
);

// One vote per user
voteSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model('Vote', voteSchema);

