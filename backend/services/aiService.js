import OpenAI from 'openai';

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

let openaiClient = null;

const getClient = () => {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return openaiClient;
};

const normalizeText = (value = '') => value.replace(/\s+/g, ' ').trim();

const splitWords = (value = '') =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const capitalizeSentence = (value = '') => {
  const text = normalizeText(value);
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const postStopWords = new Set([
  'about',
  'after',
  'again',
  'also',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'been',
  'before',
  'being',
  'but',
  'by',
  'can',
  'could',
  'did',
  'do',
  'does',
  'doing',
  'for',
  'from',
  'get',
  'got',
  'had',
  'has',
  'have',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'like',
  'make',
  'me',
  'more',
  'my',
  'not',
  'of',
  'on',
  'or',
  'our',
  'out',
  'please',
  'really',
  'so',
  'some',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'this',
  'to',
  'up',
  'us',
  'very',
  'was',
  'we',
  'what',
  'when',
  'where',
  'which',
  'with',
  'would',
  'you',
  'your',
]);

const getPostTopicWords = (value = '') =>
  [...new Set(
    normalizeText(value)
      .match(/\b[a-z0-9][a-z0-9#+.-]*\b/gi)
      ?.map((word) => word.toLowerCase())
      .filter((word) => word.length > 2 && !postStopWords.has(word)) || []
  )].slice(0, 6);

const hasTopicAnchor = (source, output) => {
  const topicWords = getPostTopicWords(source);
  if (topicWords.length === 0) return true;

  const text = normalizeText(output).toLowerCase();

  return topicWords.some((word) => {
    const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const root = safeWord.endsWith('s') ? safeWord.slice(0, -1) : safeWord;
    return new RegExp(`\\b${root}s?\\b`, 'i').test(text);
  });
};

const hasBoilerplatePhrase = (text = '') => {
  const lower = normalizeText(text).toLowerCase();
  const phrases = [
    'this update can help other developers understand the point quickly',
    'share your thoughts if you have worked on something similar',
    'share your thoughts or experience if you have worked on something similar',
    'share your thoughts if you have worked on a similar thing',
    'generated.',
  ];

  return phrases.some((phrase) => lower.includes(phrase));
};

const validateImprovedPost = (source, output) => {
  const text = normalizeText(output);

  if (!text) {
    throw new Error('OpenAI returned empty response');
  }

  if (text.length < 20) {
    throw new Error('OpenAI returned a short response');
  }

  if (text.length > 500) {
    throw new Error('OpenAI returned an oversized response');
  }

  if (hasBoilerplatePhrase(text)) {
    throw new Error('OpenAI returned boilerplate content');
  }

  if (!hasTopicAnchor(source, text)) {
    throw new Error('OpenAI returned unrelated post');
  }

  return text;
};

const hasUsefulDetail = (value = '') => {
  const text = normalizeText(value).toLowerCase();
  return (
    text.includes('error') ||
    text.includes('expected') ||
    text.includes('tried') ||
    text.includes('version') ||
    text.includes('stack') ||
    text.includes('trace') ||
    text.includes('code') ||
    text.includes('```') ||
    /\d/.test(text)
  );
};

const improveQuestionLocally = (title, body) => {
  const cleanBody = normalizeText(body);
  const cleanTitle = normalizeText(title);

  const improvedTitle = cleanTitle ? capitalizeSentence(cleanTitle) : 'How do I fix this issue?';
  const improvedBody = cleanBody
    ? capitalizeSentence(cleanBody)
    : 'Please share the error message, what you expected, and what you already tried.';

  return { title: improvedTitle, body: improvedBody };
};

const generateTagsLocally = (content) => {
  const techWords = [
    'javascript', 'python', 'react', 'node', 'express', 'mongodb', 'sql',
    'html', 'css', 'typescript', 'api', 'rest', 'graphql', 'docker',
    'git', 'linux', 'aws', 'firebase', 'nextjs', 'vue', 'angular',
    'redux', 'jwt', 'auth', 'database', 'async', 'promise', 'fetch',
    'axios', 'error', 'bug', 'deploy', 'server', 'frontend', 'backend',
    'fullstack', 'mern', 'java', 'php', 'laravel', 'django', 'flask',
  ];

  const lower = content.toLowerCase();
  const found = techWords.filter((word) => lower.includes(word));

  if (found.length >= 2) return found.slice(0, 5);

  const words = splitWords(content).filter((word) => word.length > 4);
  const unique = [...new Set(words)].slice(0, 3);

  return unique.length > 0 ? unique : ['general', 'question'];
};

const detectVagueLocally = (title, body) => {
  const cleanTitle = normalizeText(title);
  const cleanBody = normalizeText(body);
  const titleWords = splitWords(cleanTitle);
  const bodyWords = splitWords(cleanBody);

  if (!cleanTitle || !cleanBody) {
    return { isVague: true, reason: 'Add both a title and a description.' };
  }

  if (cleanTitle.length < 12 || titleWords.length < 3) {
    return { isVague: true, reason: 'Make the title a little more specific.' };
  }

  if (cleanBody.length < 40 || bodyWords.length < 8) {
    return { isVague: true, reason: 'Add more detail like the error and what you tried.' };
  }

  if (!hasUsefulDetail(cleanBody)) {
    return { isVague: true, reason: 'Mention the error message, expected result, or what you tried.' };
  }

  return { isVague: false, reason: '' };
};

const isPlaceholderRewrite = (text = '') => {
  const lower = text.toLowerCase();
  return (
    lower.includes('[your') ||
    lower.includes('[insert') ||
    lower.includes('[add') ||
    lower.includes('placeholder')
  );
};

const callOpenAI = async (input, instructions = '') => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing in backend .env');
  }

  const response = await getClient().responses.create({
    model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    instructions,
    input,
    max_output_tokens: 500,
    store: false,
  });

  const text = normalizeText(response.output_text || '');

  if (!text) {
    throw new Error('OpenAI returned empty response');
  }

  return text;
};

const parseJsonFromModel = (text) => {
  let cleaned = text.trim();

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7).trim();
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3).trim();
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3).trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Unable to parse model response');
  }
};

const buildPostPrompt = (content, strict = false) => {
  const topicWords = getPostTopicWords(content);
  const topicLine = topicWords.length
    ? `Preserve these exact topic terms when they matter: ${topicWords.join(', ')}.`
    : 'Keep the rewrite centered on the same topic.';

  return `Rewrite the draft into a clean natural post for a developer community.
Rules:
- Keep the same topic and meaning.
- Do not invent facts, brands, names, numbers, or outcomes.
- Do not replace a real term with an unrelated one.
- Use simple natural English.
- Write 2 or 3 short sentences.
- No heading, no bullets, no markdown, no intro, and no closing line.
- Return only JSON that matches the schema.
${strict ? '- Do not use boilerplate lines like "This update can help..." or "Share your thoughts...".' : ''}
${topicLine}

Draft: ${content}`;
};

const requestImprovedPost = async (content, strict = false) => {
  const response = await getClient().responses.create({
    model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    instructions: 'You rewrite short drafts into natural posts. Stay on topic and do not invent facts.',
    input: buildPostPrompt(content, strict),
    text: {
      format: {
        type: 'json_schema',
        name: 'improved_post',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            post: { type: 'string' },
          },
          required: ['post'],
        },
      },
    },
    temperature: 0.2,
    max_output_tokens: 220,
    store: false,
  });

  const parsed = parseJsonFromModel(response.output_text || '');
  return validateImprovedPost(content, parsed?.post || '');
};

const improvePost = async (content) => {
  try {
    return await requestImprovedPost(content, false);
  } catch (firstError) {
    try {
      return await requestImprovedPost(content, true);
    } catch (secondError) {
      throw secondError || firstError;
    }
  }
};

const improveQuestion = async (title, body) => {
  const fallback = improveQuestionLocally(title, body);

  try {
    const response = await getClient().responses.create({
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      instructions: 'Rewrite technical questions in simple clear English. Fix grammar and spelling. Keep the title and body focused on the same issue. Do not invent new facts.',
      input: `Title: ${title}\nBody: ${body}`,
      text: {
        format: {
          type: 'json_schema',
          name: 'improved_question',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['title', 'body'],
          },
        },
      },
      max_output_tokens: 350,
      store: false,
    });

    const parsed = parseJsonFromModel(response.output_text || '');
    const titleText = normalizeText(parsed?.title || '');
    const bodyText = normalizeText(parsed?.body || '');

    if (titleText && bodyText && !isPlaceholderRewrite(titleText) && !isPlaceholderRewrite(bodyText)) {
      return { title: titleText, body: bodyText };
    }
  } catch {
    // use local fallback
  }

  return fallback;
};

const generateTags = async (content) => {
  const instructions = 'Generate short technical tags.';
  const input = `Generate 3 to 5 technical tags for this content.
Return only comma-separated lowercase tags.

Content: ${content}`;

  try {
    const text = await callOpenAI(input, instructions);
    const tags = text
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0 && tag.length < 30);

    if (tags.length > 0) return tags;
  } catch {
    // use local keyword extraction
  }

  return generateTagsLocally(content);
};

const detectVagueQuestion = async (title, body) => {
  const instructions = 'Check technical question quality.';
  const input = `Check if this technical question is vague.
Return valid JSON only with: "isVague" (boolean), "reason" (string).
Be strict but simple.

Title: ${title}
Body: ${body}`;

  try {
    const text = await callOpenAI(input, instructions);
    const parsed = parseJsonFromModel(text);
    const localResult = detectVagueLocally(title, body);

    if (typeof parsed?.isVague === 'boolean') {
      if (parsed.isVague) {
        return {
          isVague: true,
          reason: normalizeText(parsed.reason) || localResult.reason || 'Please add more detail.',
        };
      }

      return localResult.isVague ? localResult : { isVague: false, reason: '' };
    }
  } catch {
    // fall back to local checks
  }

  return detectVagueLocally(title, body);
};

const suggestAnswer = async (title, body) => {
  const instructions = 'Answer technical questions in simple plain text.';
  const input = `Keep it clear and concise, max 400 words.

Question Title: ${title}
Question Details: ${body}`;

  try {
    return await callOpenAI(input, instructions);
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
