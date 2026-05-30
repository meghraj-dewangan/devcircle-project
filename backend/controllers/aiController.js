import * as aiService from '../services/aiService.js';

const getAiError=(error)=>{
    const message = error?.message || '';

    if (message.includes('429') || message.toLowerCase().includes('quota')) {
    return { status: 429, message: 'AI limit reached for today. Try later or use a new API key.' };
  }

  if (message.includes('401') || message.toLowerCase().includes('api key')) {
    return { status: 401, message: 'Invalid OpenAI API key. Please check backend .env.' };
  }

  if (message.includes('not found') || message.includes('not supported')) {
    return { status: 400, message: 'Selected AI model is not available for this key.' };
  }

  if (
    message.includes('empty response') ||
    message.includes('short response') ||
    message.includes('oversized response') ||
    message.includes('boilerplate content') ||
    message.includes('unrelated post') ||
    message.includes('Unable to parse model response')
  ) {
    return { status: 502, message: 'AI returned an invalid draft. Please try again.' };
  }

  return { status: 500, message: 'AI service error. Please try again.' };
}

//post

const improvePost = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Post content required' });
  }

  try {
    const improved = await aiService.improvePost(content);
    res.json({ improved });
  } catch (error) {
    const aiError = getAiError(error);
    res.status(aiError.status).json({ message: aiError.message });
  }
};



const improveQuestion = async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }

  try {
    const improved = await aiService.improveQuestion(title, body);
    res.json(improved);
  } catch (error) {
    const aiError = getAiError(error);
    res.status(aiError.status).json({ message: aiError.message });
  }
};


const generateTags = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const tags = await aiService.generateTags(content);
    res.json({ tags });
  } catch (error) {
    const aiError = getAiError(error);
    res.status(aiError.status).json({ message: aiError.message });
  }
};


const detectVague = async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }

  try {
    const result = await aiService.detectVagueQuestion(title, body);
    res.json(result);
  } catch (error) {
    const aiError = getAiError(error);
    res.status(aiError.status).json({ message: aiError.message });
  }
};


const suggestAnswer = async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }

  try {
    const answer = await aiService.suggestAnswer(title, body);
    res.json({ answer });
  } catch (error) {
    const aiError = getAiError(error);
    res.status(aiError.status).json({ message: aiError.message });
  }
};

export { improvePost, improveQuestion, generateTags, detectVague, suggestAnswer };
