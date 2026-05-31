import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import Vote from '../models/Vote.js';


const getAnswers = async (req, res) => {
  try {
    // Show accepted answer first then by upvotes then by date
    const answers = await Answer.find({ question: req.params.id }).populate('author', 'username avatar').sort({ isAccepted: -1, upvotes: -1, createdAt: 1 });
      
      
    res.json(answers);
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
};

// post answer to a question
const addAnswer = async (req, res) => {

  const { body } = req.body;

  if (!body || body.trim() === '') {

    return res.status(400).json({ message: 'Answer cannot be empty' });
  }

  try {
    const question = await Question.findById(req.params.id);
    if (!question) {

      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = await Answer.create({

      question: req.params.id,
      author: req.user._id,
      body: body.trim(),
    });

   
    question.answerCount += 1;
    await question.save();

    const populated = await answer.populate('author', 'username avatar');

    res.status(201).json(populated);
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
};

// accept an answer question owner only
const acceptAnswer = async (req, res) => {

  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'answer not found' });

    }

    const question = await Question.findById(answer.question);

    if (!question) {

      return res.status(404).json({ message: 'question not found' });
    }

    // Only the person who asked can accept  answer
    if (question.author.toString() !== req.user._id.toString()) {

      return res.status(403).json({ message: 'Only the question author can accept an answer' });
    }

  
    if (question.acceptedAnswer) {

      await Answer.findByIdAndUpdate(question.acceptedAnswer, { isAccepted: false });
    }

    answer.isAccepted = true;
    
    await answer.save();

    question.acceptedAnswer = answer._id;

    question.isResolved = true;

    await question.save();

    res.json({ message: 'Answer accepted', answer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// upvote or downvote an answer
const voteAnswer = async (req, res) => {

  const { voteType } = req.body;

  if (!['up', 'down'].includes(voteType)) {
    return res.status(400).json({ message: 'voteType must be up or down' });
  }

  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const existingVote = await Vote.findOne({
      user: req.user._id,
      targetType: 'answer',
      targetId: req.params.id,
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
   
        await existingVote.deleteOne();

        if (voteType === 'up') answer.upvotes = Math.max(0, answer.upvotes - 1);

        else answer.downvotes = Math.max(0, answer.downvotes - 1);
      } else {
        
        if (existingVote.voteType === 'up') {

          answer.upvotes = Math.max(0, answer.upvotes - 1);

          answer.downvotes += 1;
        } else {
          answer.downvotes = Math.max(0, answer.downvotes - 1);

          answer.upvotes += 1;
        }
        existingVote.voteType = voteType;

        await existingVote.save();
      }
    } else {
      // New vote
      await Vote.create({
        user: req.user._id,
        targetId: req.params.id,
        targetType: 'answer',
        voteType,
      });

      if (voteType === 'up') answer.upvotes += 1;

      else answer.downvotes += 1;
    }

    await answer.save();
    res.json({ upvotes: answer.upvotes, downvotes: answer.downvotes });
  } catch (error) {
    
    res.status(500).json({ message: 'Server error' });
  }
};

export { getAnswers, addAnswer, acceptAnswer, voteAnswer };

