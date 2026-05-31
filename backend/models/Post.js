import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    postNumber: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    content: {
      type: String,
      required: [true, 'Post is required'],
      maxlength: [1000, 'Post cannot exceed 1000 characters'],
    },
    
    image: {
      type: String,
      default: '',
    },

    tags: {
      type: [String],
      default: [],
    },
    
    repostOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    
    repostCount: {
      type: Number,
      default: 0,
    },

    likeCount: {
      type: Number,
      default: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
    },
    // user IDs array who liked this post
    
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);

