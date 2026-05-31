import { validationResult } from 'express-validator';
import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import Counter from '../models/Counter.js';

const findPostByRef = (postRef, withAuthor = false) => {

  const isNumberRef = /^\d+$/.test(postRef);

  if (isNumberRef) {
    const query = Post.findOne({ postNumber: Number(postRef) });
    return withAuthor ? query.populate('author', 'username avatar bio') : query;
  }

  const query = Post.findById(postRef);
  return withAuthor ? query.populate('author', 'username avatar bio') : query;
};

const ensurePostNumber = async (post) => {

  if (!post || post.postNumber) return post;

  const counter = await Counter.findOneAndUpdate(
    { key: 'postNumber' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  post.postNumber = counter.value;
  await post.save();
  return post;
};

// posts from users you follow and your own
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const followData = await Follow.find({ follower: req.user._id }).select('following');
    const followingIds = followData.map((f) => f.following);

    followingIds.push(req.user._id); 

    const posts = await Post.find({ author: { $in: followingIds } })
      .populate('author', 'username avatar')
      .populate({
        path: 'repostOf',
        select: 'content image postNumber createdAt author',
        populate: { path: 'author', select: 'username avatar' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    await Promise.all(posts.map((post) => ensurePostNumber(post)));

    const total = await Post.countDocuments({ author: { $in: followingIds } });

    res.json({
      posts,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 
const getExplorePosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'username avatar')
      .populate({
        path: 'repostOf',
        select: 'content image postNumber createdAt author',
        populate: { path: 'author', select: 'username avatar' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    await Promise.all(posts.map((post) => ensurePostNumber(post)));

    const total = await Post.countDocuments();

    res.json({

      posts,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const createPost = async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { content, tags } = req.body;

  const normalizeTags = (rawTags) => {
    if (!rawTags) return [];

    let parsed = rawTags;

    if (typeof rawTags === 'string') {
      try {
        parsed = JSON.parse(rawTags);
      } catch {
        parsed = rawTags.split(',');
      }
    }

    if (!Array.isArray(parsed)) return [];

    const clean = parsed.map((t) => String(t).trim().toLowerCase().replace(/^#/, '')).filter(Boolean);
      
    return [...new Set(clean)].slice(0, 5);
  };

  try {
    const postData = {

      author: req.user._id,
      content,
      tags: normalizeTags(tags),
    };

    const counter = await Counter.findOneAndUpdate(

      { key: 'postNumber' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    postData.postNumber = counter.value;

    
    if (req.file) {

      postData.image = `/uploads/${req.file.filename}`;
    }

    const post = await Post.create(postData);
    const populated = await post.populate('author', 'username avatar');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// get a single post
const getPostById = async (req, res) => {

  try {
    const post = await findPostByRef(req.params.id, true).populate({
      path: 'repostOf',
      select: 'content image postNumber createdAt author',
      populate: { path: 'author', select: 'username avatar' },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await ensurePostNumber(post);

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// repost an existing post into your feed
const repostPost = async (req, res) => {

  try {
    const sourcePost = await findPostByRef(req.params.id);
    if (!sourcePost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let originalPost = sourcePost;

    if (sourcePost.repostOf) {
      const foundPost = await Post.findById(sourcePost.repostOf);
      if (foundPost) originalPost = foundPost;
    }

    const existingRepost = await Post.findOne({

      author: req.user._id,
      repostOf: originalPost._id,
    });

    if (existingRepost) {

      const populatedExisting = await Post.findById(existingRepost._id)
        .populate('author', 'username avatar')
        .populate({

          path: 'repostOf',
          select: 'content image postNumber createdAt author',
          populate: { path: 'author', select: 'username avatar' },
        });

      return res.json(populatedExisting);
    }

    const counter = await Counter.findOneAndUpdate(

      { key: 'postNumber' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const repost = await Post.create({

      author: req.user._id,
      content: originalPost.content,
      image: originalPost.image || '',
      tags: originalPost.tags || [],
      repostOf: originalPost._id,
      postNumber: counter.value,

    });

    originalPost.repostCount = (originalPost.repostCount || 0) + 1;

    await originalPost.save();

    const populated = await Post.findById(repost._id)
      .populate('author', 'username avatar')
      .populate({
        path: 'repostOf',
        select: 'content image postNumber createdAt author',
        populate: { path: 'author', select: 'username avatar' },
      });

    return res.status(201).json(populated);
  } catch (error) {

    return res.status(500).json({ message: 'Server error' });
  }
};


const deletePost = async (req, res) => {

  try {

    const post = await findPostByRef(req.params.id);

    if (!post) {

      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    if (post.repostOf) {

      await Post.findByIdAndUpdate(post.repostOf, {
        $inc: { repostCount: -1 },
        
      });
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// like a post
const likePost = async (req, res) => {
  try {
    const post = await findPostByRef(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      return res.status(400).json({ message: 'You already liked this post' });
    }

    post.likes.push(req.user._id);

    post.likeCount = post.likes.length;
    await post.save();

    res.json({ likeCount: post.likeCount, liked: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// unlike a post
const unlikePost = async (req, res) => {
  try {
    const post = await findPostByRef(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.likes = post.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    post.likeCount = post.likes.length;
    
    await post.save();

    res.json({ likeCount: post.likeCount, liked: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  getFeed,
  getExplorePosts,
  createPost,
  getPostById,
  deletePost,
  repostPost,
  likePost,
  unlikePost,
};
