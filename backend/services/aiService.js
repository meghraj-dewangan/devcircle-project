import OpenAI from 'openai';

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

let client = null;

const getClient = () => {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
};

const cleanText = (value = '') => value.replace(/\s+/g, ' ').trim();

const firstUpper = (value = '') => {
  const text = cleanText(value);

  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const wordsOnly = (value = '') =>
  cleanText(value).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  
const parseJson = (value = '') => {

  const text = cleanText(value);

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const makePostFallback = (content) => {

  const text = cleanText(content);
  if (!text) return '';

  const line = firstUpper(text).replace(/[.!?]*$/, '.');

  return `${line} Share your thoughts if you have worked on something similar.`;
};

const makeQuestionFallback = (title, body) => {

  const cleanTitle = cleanText(title);
  const cleanBody = cleanText(body);

  return {
    title: cleanTitle ? firstUpper(cleanTitle) : 'How do I fix this issue?',
    body: cleanBody
      ? firstUpper(cleanBody)
      : 'Please share the error message and what you already tried.',
  };
};

const makeTagsFallback = (content) => {

  const words = wordsOnly(content).filter((word) => word.length > 4);
  const list = [...new Set(words)].slice(0, 3);

  return list.length > 0 ? list : ['general'];
};

const hasUsefulDetail = (text = '') => {
  const value = cleanText(text).toLowerCase();
  return (
    value.includes('error') || value.includes('expected') ||value.includes('tried') ||value.includes('failed') ||value.includes('version') ||value.includes('stack') ||value.includes('trace') ||/\d/.test(value)
   
  );
};

const callText = async (input, instructions, options = {}) => {
  if (!process.env.OPENAI_API_KEY) {

    throw new Error('OPENAI_API_KEY is missing in backend .env');
  }

  const response = await getClient().responses.create({

    model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    instructions,
    input,
    max_output_tokens: options.max_output_tokens || 300,
    temperature: options.temperature ?? 0.2,
    store: false,
  });

  const text = cleanText(response.output_text || '');

  if (!text) {
    throw new Error('OpenAI returned empty response');
  }

  return text;
};

const callJson = async (input, instructions, schema, options = {}) => {

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing in backend .env');
  }

  const response = await getClient().responses.create({

    model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    instructions,
    input,
    text: {
      format: {
        type: 'json_schema',
        name: options.name || 'result',
        strict: true,
        schema,
      },
    },

    max_output_tokens: options.max_output_tokens || 300,
    temperature: options.temperature ?? 0.2,
    store: false,
  });

  const parsed = parseJson(response.output_text || '');

  if (!parsed) {
    throw new Error('Unable to parse model response');
  }

  return parsed;
};

const improvePost = async (content) => {
  try {
    const result = await callJson(
      `Draft: ${content}`,
      'Rewrite the draft into a natural post for a developer community. Keep the same meaning. Do not invent facts. Write 2 or 3 short sentences.',
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          post: { type: 'string' },
        },
        required: ['post'],
      },
      { name: 'improved_post', max_output_tokens: 220 }
    );

    const post = cleanText(result.post || '');
    return post || makePostFallback(content);
  } catch {
    return makePostFallback(content);
  }
};

const improveQuestion = async (title, body) => {

  const fallback = makeQuestionFallback(title, body);

  try {
    const result = await callJson(
      `Title: ${title}\nBody: ${body}`,
      'Rewrite the question in simple clear English. Fix grammar and spelling. Do not add new facts.',
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['title', 'body'],
      },
      { name: 'improved_question', max_output_tokens: 320 }
    );

    const newTitle = cleanText(result.title || '');
    const newBody = cleanText(result.body || '');

    if (newTitle && newBody) {
      return { title: newTitle, body: newBody };
    }
  } catch {
    // use fallback below
  }

  return fallback;
};

const generateTags = async (content) => {
  try {
    const result = await callJson(
      `Content: ${content}`,
      'Generate 3 to 5 short lowercase technical tags. Return simple tags only.',
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['tags'],

      },
      { name: 'generated_tags', max_output_tokens: 180 }
    );

    const tags = Array.isArray(result.tags)
      ? result.tags
          .map((tag) => cleanText(tag).toLowerCase().replace(/^#/, ''))
          .filter(Boolean)
          .slice(0, 5)
      : [];

    if (tags.length > 0) {
      return [...new Set(tags)];
    }
  } catch {
    // use fallback below
  }

  return makeTagsFallback(content);
};

const detectVagueQuestion = async (title, body) => {
  const local = {

    isVague: false,
    reason: '',
  };

  const titleText = cleanText(title);

  const bodyText = cleanText(body);

  if (!titleText || !bodyText) {
    return { isVague: true, reason: 'Add both a title and a description.' };
  }

  if (titleText.length < 12 || wordsOnly(titleText).length < 3) {

    local.isVague = true;
    local.reason = 'Make the title a little more specific.';
  } else if (bodyText.length < 40 || wordsOnly(bodyText).length < 8) {

    local.isVague = true;
    local.reason = 'Add more detail like the error and what you tried.';
  } else if (!hasUsefulDetail(bodyText)) {
    local.isVague = true;
    local.reason = 'Mention the error message, expected result, or what you tried.';
  }

  try {
    const result = await callJson(

      `Title: ${title}\nBody: ${body}`,
      'Check if the question is vague. Return only JSON with isVague boolean and reason string.',
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          isVague: { type: 'boolean' },
          reason: { type: 'string' },
        },
        required: ['isVague', 'reason'],
      },
      { name: 'vague_check', max_output_tokens: 160 }
    );

    if (typeof result.isVague === 'boolean') {

      if (result.isVague) {
        return {
          isVague: true,
          reason: cleanText(result.reason) || local.reason || 'Please add more detail.',
        };
      }

      return local.isVague ? local : { isVague: false, reason: '' };
    }
  } catch {
    // use local check below
  }

  return local;
};

const suggestAnswer = async (title, body) => {
  
  try {
    return await callText(
      `Question Title: ${title}\nQuestion Details: ${body}`,
      'Answer the technical question in simple plain text. Keep it clear and concise, under 400 words.',
      { max_output_tokens: 450 }
    );
  } catch {
    return 'Unable to generate a suggestion right now. Please try again later.';
  }
};

export {
  improvePost,
  improveQuestion,
  generateTags,
  detectVagueQuestion,
  suggestAnswer,
};
