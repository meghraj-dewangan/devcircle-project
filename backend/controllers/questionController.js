import { validationResult } from 'express-validator';
import Question from '../models/Question.js';
import Vote from '../models/Vote.js';

// get popular tags from all questions
const getPopularTags = async (req, res) => {
  try {
    const tags = await Question.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
      {
        $project: {
          _id: 0,
          tag: '$_id',
          postCount: '$count',
        },
      },
    ]);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// get all questions with tag filter
const getQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = 10;

    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    const questions = await Question.find(filter)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + questions.length < total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const createQuestion = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    return res.status(400).json({ errors: errors.array() });
  }

  const { title, body, tags } = req.body;

  try {
    const question = await Question.create({
      author: req.user._id,
      title,
      body,
      tags: tags
        ? Array.isArray(tags)
          ? tags
          : tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    });

    const populated = await question.populate('author', 'username avatar');
    res.status(201).json(populated);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// get a single question
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate('acceptedAnswer');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// edit your own question
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own questions' });
    }

    const { title, body, tags } = req.body;

    if (title) question.title = title.trim();

    if (body) question.body = body.trim();

    if (tags !== undefined) {
      question.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    await question.save();
    const updated = await question.populate('author', 'username avatar');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// delete your own question
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own questions' });
    }

    await question.deleteOne();

    res.json({ message: 'Question deleted' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/questions/:id/vote - upvote or downvote a question
const voteQuestion = async (req, res) => {
  const { voteType } = req.body;

  if (!['up', 'down'].includes(voteType)) {
    return res.status(400).json({ message: 'voteType must be "up" or "down"' });
  }

  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const existingVote = await Vote.findOne({
      user: req.user._id,

      targetType: 'question',
      targetId: req.params.id,
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        
        await existingVote.deleteOne();

        if (voteType === 'up') question.upvotes = Math.max(0, question.upvotes - 1);
        else question.downvotes = Math.max(0, question.downvotes - 1);
      } else {
       
        if (existingVote.voteType === 'up') {
          question.upvotes = Math.max(0, question.upvotes - 1);
          question.downvotes += 1;
        } else {

          question.downvotes = Math.max(0, question.downvotes - 1);

          question.upvotes += 1;

        }
        existingVote.voteType = voteType;
        await existingVote.save();
      }
    } else {
     
      await Vote.create({
        user: req.user._id,

        targetType: 'question',
        targetId: req.params.id,
        voteType,
      });

      if (voteType === 'up') question.upvotes += 1;
      
      else question.downvotes += 1;
    }

    await question.save();
    res.json({ upvotes: question.upvotes, downvotes: question.downvotes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export { getPopularTags, getQuestions, createQuestion, getQuestionById, updateQuestion, deleteQuestion, voteQuestion };
