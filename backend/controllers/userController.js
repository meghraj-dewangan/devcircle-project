import User from '../models/User.js';
import Follow from '../models/Follow.js';
import Post from '../models/Post.js';

// view anyone public profile
const getUserProfile = async (req, res) => {

  try {
    const user = await User.findOne({ username: req.params.username }).select(
      '-password -email'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ author: user._id })
      .populate('author', 'username avatar')
      .populate({
        path: 'repostOf',
        select: 'content image postNumber createdAt author',
        populate: { path: 'author', select: 'username avatar' },
      }).sort({ createdAt: -1 }).limit(10);
      
    res.json({
      ...user.toObject(),
      posts,
      
    });

  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
};

// update your own profile
const updateProfile = async (req, res) => {

  const { bio, skills, githubLink, website } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio, skills, githubLink, website },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);

  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
};

//upload profile picture
const uploadAvatar = async (req, res) => {
  if (!req.file) {

    return res.status(400).json({ message: 'No image file uploaded' });
  }

  try {
    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json({ avatar: user.avatar });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const getFollowers = async (req, res) => {
  try {

    const follows = await Follow.find({ following: req.params.id }).populate(
      'follower',
      'username avatar bio'
    );

    const followers = follows.map((f) => f.follower);

    res.json(followers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const getFollowing = async (req, res) => {
  try {

    const follows = await Follow.find({ follower: req.params.id }).populate(
      'following',
      'username avatar bio'
    );

    const following = follows.map((f) => f.following);

    res.json(following);
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
  
};

export {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  getFollowers,
  getFollowing,
};
