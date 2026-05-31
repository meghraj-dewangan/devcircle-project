import Follow from '../models/Follow.js';
import User from '../models/User.js';

// follows a user

const followUser = async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  try {
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const alreadyFollowing = await Follow.findOne({
      follower: req.user._id,
      following: userId,
    });

    if (alreadyFollowing) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    await Follow.create({ follower: req.user._id, following: userId });

    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
    
    await User.findByIdAndUpdate(userId, { $inc: { followerCount: 1 } });

    res.json({ message: 'Followed successfully', isFollowing: true });
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
};

// unfollow a user
const unfollowUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,

      following: userId,
    });

    if (!follow) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Update counts
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followerCount: -1 } });

    res.json({ message: 'Unfollowed successfully', isFollowing: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// check if you follow a user
const getFollowStatus = async (req, res) => {
  try {
    const follow = await Follow.findOne({
      follower: req.user._id,
      following: req.params.userId,
    });

    res.json({ isFollowing: !!follow });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const getBulkFollowStatus = async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (!ids.length) return res.json({});

    const follows = await Follow.find({

      follower: req.user._id,
      following: { $in: ids },
    }).select('following');

    const result = {};
    
    ids.forEach((id) => { result[id] = false; });
    follows.forEach((f) => { result[f.following.toString()] = true; });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export { followUser, unfollowUser, getFollowStatus, getBulkFollowStatus };

