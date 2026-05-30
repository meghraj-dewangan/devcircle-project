import Message from '../models/Message.js';
import User from '../models/User.js';

// get all people you have chatted with
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get latest messages involving current user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    // Build one entry per conversation partner
    const conversationMap = new Map();

    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === userId.toString()
          ? msg.receiver
          : msg.sender;

      const otherId = otherUser._id.toString();

      if (!conversationMap.has(otherId)) {
        const isUnread =
          msg.receiver._id.toString() === userId.toString() && !msg.isRead;

        conversationMap.set(otherId, {
          user: otherUser,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: isUnread ? 1 : 0,
        });
      } else {
        // Count unread messages for conversation
        const conv = conversationMap.get(otherId);
        if (
          msg.receiver._id.toString() === userId.toString() &&
          !msg.isRead
        ) {
          conv.unreadCount += 1;
        }
      }
    });

    res.json(Array.from(conversationMap.values()));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// get all messages with a specific user
const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 }); // oldest first

    // Mark incoming messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// send a message to a user
const sendMessage = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Message cannot be empty' });
  }

  try {
    const receiver = await User.findById(req.params.userId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.userId,
      content: content.trim(),
    });

    const populated = await message.populate([
      { path: 'sender', select: 'username avatar' },
      { path: 'receiver', select: 'username avatar' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export { getConversations, getMessages, sendMessage };

