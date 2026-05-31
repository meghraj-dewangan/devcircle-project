import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: [true, 'Question title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    body: {
      type: String,
      required: [true, 'Question is required'],
    },

    tags: {
      type: [String],
      default: [],
    },

    answerCount: {
      type: Number,
      default: 0,
    },

    upvotes: {
      type: Number,
      default: 0,
    },

    downvotes: {
      type: Number,
      default: 0,
    },
    // question has  accepted answer
    isResolved: {
      type: Boolean,
      default: false,
    },
    // Reference to the accepted answer 
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);

