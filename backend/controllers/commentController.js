import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

const findPostByRef = async (postRef ) => {
  
  const isNumberRef = /^\d+$/.test(postRef);
  if (isNumberRef) {
    return Post.findOne({ postNumber: Number(postRef) });
  }
  return Post.findById(postRef);
};

// get all comments for a post
const getComments = async (req, res) => {
  try {
    const post = await findPostByRef(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username avatar').sort({ createdAt: 1 }); 
      

    res.json(comments);
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// add a comment to a post
const addComment = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {

    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  try {
    const post = await findPostByRef(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      content: content.trim(),
    });

   
    post.commentCount += 1;

    await post.save();

    const populated = await comment.populate('author', 'username avatar');

    res.status(201).json(populated);
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
};

// delete your own comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });

    }

    if (comment.author.toString() !== req.user._id.toString()) {

      return res.status(403).json({ message: 'You can delete only your own comments' });
    }

    await comment.deleteOne();

   
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    res.json({ message: 'Comment deleted' });
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
};

export { getComments, addComment, deleteComment };

