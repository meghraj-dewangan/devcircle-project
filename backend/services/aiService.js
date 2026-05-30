
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

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

const topicKeywords = ['react', 'nodejs', 'node', 'express', 'mongodb', 'jwt', 'api', 'redux', 'vite', 'socket', 'login', 'auth', 'frontend', 'backend', 'laravel', 'php', 'java', 'python'];

const extractTopic = (title, body) => {
  const words = splitWords(`${title} ${body}`);
  const found = words.find((word) => topicKeywords.includes(word));
  if (!found) return '';
  return found === 'node' ? 'nodejs' : found;
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
  const cleanTitle = normalizeText(title);
  const cleanBody = normalizeText(body);
  const topic = extractTopic(cleanTitle, cleanBody);

  const improvedTitle = topic ? `How do I fix this ${topic} issue?` : 'How do I fix this issue?';

  const improvedBody = cleanBody
    ? capitalizeSentence(cleanBody)
    : 'Please share the error message, what you expected, and what you already tried.';

  return {
    title: improvedTitle,
    body: improvedBody,
  };
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
    return {
      isVague: true,
      reason: 'Add more detail like the error and what you tried.',
    };
  }

  if (!hasUsefulDetail(cleanBody)) {
    return {
      isVague: true,
      reason: 'Mention the error message, expected result, or what you tried.',
    };
  }

  return { isVague: false, reason: '' };
};


const callGroq = async(prompt)=>{
    if(!process.env.GROQ_API_KEY){
         throw new Error('GROQ_API_KEY is missing in backend .env');
    }

    const response = await fetch( GROQ_API_URL,{
        method:'POST',
        headers:{
             Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
        },
        body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
    });

     if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();

  if (!text){
    throw new Error('Groq API empty response');
  }
  return text;


};

const parseJsonFromModel = (text)=>{
    let cleaned = text.trim();

    if(cleaned.startsWith('```json')){
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
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Unable to parse model response');
   }

};

// improve a post to more clear

const improvePost = async(content)=>{
    const prompt = `Improve this developer post. Keep it short and clear.
Return only final improved text.
Post: ${content}`;
return callGroq(prompt);
};

//improve question title and body

const improveQuestion = async (title, body) => {
  const fallback = improveQuestionLocally(title, body);
  const prompt = `Rewrite this technical question in simple clear English.
Keep the same meaning.
Do not add new facts.
If the question is vague, keep it short and ask for the missing detail.
Return valid JSON only with fields: "title", "body".
Title: ${title}
Body: ${body}`;

  const text = await callGroq(prompt);

  try {
    const parsed = parseJsonFromModel(text);
    const titleText = normalizeText(parsed?.title || '');
    const bodyText = normalizeText(parsed?.body || '');

    if (!isPlaceholderRewrite(titleText) && !isPlaceholderRewrite(bodyText)) {
      return {
        title: titleText,
        body: bodyText,
      };
    }
  } catch {
    // Fall back to a simple local rewrite when the model output is not usable.
  }

  return fallback;
};

// generate tags for post and questions

const generateTags = async (content) => {
  const prompt = `Generate 3 to 5 technical tags for this content.
Return only comma-separated lowercase tags.
Content: ${content}`;

  const text = await callGroq(prompt);

  return text
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
};

//check for question is too vague or unclear

const detectVagueQuestion = async (title, body) => {
  const prompt = `Check if this technical question is vague.
Return valid JSON only with: "isVague" (boolean), "reason" (string).
Be strict but simple.
Title: ${title}
Body: ${body}`;

  const text = await callGroq(prompt);

  try {
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
    // Fall back to local checks if the model response is malformed.
  }

  return detectVagueLocally(title, body);
};

// suggest an answer to a developer question

const suggestAnswer = async (title, body) => {
  const prompt = `Answer this technical question in simple plain text.
Keep it clear and concise (max 400 words).
Question Title: ${title}
Question Details: ${body}`;

  return callGroq(prompt);
};


export {
  improvePost,
  improveQuestion,
  generateTags,
  detectVagueQuestion,
  suggestAnswer,
};

