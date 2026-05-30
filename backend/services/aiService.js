
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';


const callGroq = async(prompt)=>{
    if(!process.env.GROQ_API_KEY){
         throw new Error('GROQ_API_KEY is missing in backend .env');
    }

    const response = await fetch( GROQ_API_URL,{
        method:'post',
        headers:{
             Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
        },
        body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
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

   return JSON.parse(cleaned);

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
  const prompt = `Rewrite this technical question to be clearer.
Return valid JSON only with fields: "title", "body".
Title: ${title}
Body: ${body}`;

  const text = await callGroq(prompt);

  try {
    return parseJsonFromModel(text);
  } catch {
    // If parsing fails, return original values
    return { title, body };
  }
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
Title: ${title}
Body: ${body}`;

  const text = await callGroq(prompt);

  try {
    return parseJsonFromModel(text);
  } catch {
    return { isVague: false, reason: '' };
  }
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

