import User from '../models/User.js';
import Post from '../models/Post.js';
import Question from '../models/Question.js';



const search = async (req, res) => {
  const { q, type } = req.query;

  const searchTerm = q ? q.trim() : '';

  const regex = searchTerm ? new RegExp(searchTerm, 'i') : null;

  try {
    const results = {};

    // Users
    if (!type || type === 'all' || type === 'users') {

      results.users = await User.find(
        regex ? { $or: [{ username: regex }, { bio: regex }] } : {}
      )
        .select('username avatar bio followerCount')
        .sort({ createdAt: -1 })
        .limit(type === 'users' ? 20 : 8);
    }

    
   
    let matchedUserIds = [];

    if (regex) {
      const matchedUsers = await User.find({ username: regex }).select('_id');

      matchedUserIds = matchedUsers.map((u) => u._id);
    }

   
    if (!type || type === 'all' || type === 'posts') {

      const postFilter = regex
        ? {
            $or: [
              { content: regex },
              { tags: regex },
              { author: { $in: matchedUserIds } },

            ],
          }
        : {};

      results.posts = await Post.find(postFilter).populate('author', 'username avatar').sort({ createdAt: -1 }).limit(type === 'posts' ? 20 : 8);
        
        
        
    }

    // Questions
    if (!type || type === 'all' || type === 'questions') {
      const questionFilter = regex
        ? {
            $or: [
              { title: regex },
              { body: regex },
              { tags: regex },
              { author: { $in: matchedUserIds } },
            ],
          }
        : {};

      results.questions = await Question.find(questionFilter).populate('author', 'username avatar').sort({ createdAt: -1 }).limit(type === 'questions' ? 20 : 8);
        
    }

    res.json(results);

  } catch (error) {
    
    res.status(500).json({ message: 'Server error' });
  }
};

export { search };

