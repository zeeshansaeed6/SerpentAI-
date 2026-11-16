const { GoogleGenAI } = require('@google/genai');

// Benchmarked on the real scan task (corn snake + green tree python photos): the Flash-Lite models
// with minimal thinking answer in ~5s and identified both correctly, whereas gemini-3.6-flash with
// default thinking took 30-170s or hit its rate limit. Override via env if Google changes models.
const MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite'
];

// One attempt per model with a hard timeout: the SDK's silent retries made scans hang for minutes.
// Worst case is 2 x 20s, under the browser's 45s limit.
const ATTEMPT_TIMEOUT_MS = 20000;
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { timeout: ATTEMPT_TIMEOUT_MS, retryOptions: { attempts: 1 } }
});

const IDENTIFY_PROMPT = `You are an expert herpetologist AI assistant specializing in snake species identification. Analyze this image carefully.

If the image contains a snake, identify the species and provide detailed information. If the image does NOT contain a snake, respond accordingly.

You MUST respond with ONLY valid JSON in this exact format (no markdown, no code fences, no extra text):

{
  "isSnake": true/false,
  "snakeName": "Common name of the snake species",
  "scientificName": "Scientific (Latin) name",
  "confidence": "High/Medium/Low",
  "venomous": true/false,
  "dangerLevel": "Harmless/Mild/Moderate/Dangerous/Deadly",
  "description": "A detailed 2-3 sentence description of this snake species, including key identifying features like color patterns, head shape, and body build.",
  "habitat": "Natural habitat description (forests, deserts, grasslands, wetlands, etc.)",
  "region": "Geographic regions where this species is commonly found",
  "behavior": "Brief description of typical behavior (nocturnal/diurnal, aggressive/docile, etc.)",
  "diet": "What this snake typically eats",
  "firstAid": "If venomous: detailed first aid instructions for a bite. If non-venomous: say 'This species is non-venomous. Clean the wound and seek medical attention if concerned.'",
  "funFact": "An interesting or surprising fact about this snake species"
}

If the image does NOT contain a snake, respond with:
{
  "isSnake": false,
  "snakeName": "Not a snake",
  "scientificName": "N/A",
  "confidence": "High",
  "venomous": false,
  "dangerLevel": "Harmless",
  "description": "The uploaded image does not appear to contain a snake. Please upload a clear image of a snake for identification.",
  "habitat": "N/A",
  "region": "N/A",
  "behavior": "N/A",
  "diet": "N/A",
  "firstAid": "N/A",
  "funFact": "N/A"
}`;

const CHAT_INSTRUCTION = `You are "SerpentBot", an expert herpetologist and venom safety AI assistant.
Your goal is to provide accurate, calm, scientifically verified, and safety-conscious information about snakes, snakebite prevention, emergency first-aid protocols, and reptile behavior.

Critical Safety Directives:
1. If a user describes an active or recent snakebite, prioritize immediate medical triage advice: stay calm, immobilize the limb, do NOT tourniquet/cut/suck, and call emergency services immediately (911/112/108/Poison Control).
2. Never encourage handling wild snakes or attempting DIY venom extraction.
3. Be concise, reassuring, clear, and format key steps with bullet points.
4. Promote humane wildlife coexistence and dispel dangerous myths.`;

// Models sometimes wrap JSON in fences or prose; keep only the outermost {...}.
const extractJson = (text) => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('No JSON object in AI response');
  return JSON.parse(text.slice(start, end + 1));
};

// Try each model in turn; a bad reply (not just an API error) also falls through to the next model
const generate = async (input, thinkingLevel, parse = (text) => text, maxOutputTokens) => {
  let lastError = new Error('No AI model available');
  for (const model of MODELS) {
    try {
      const interaction = await client.interactions.create({
        model,
        input,
        generation_config: {
          thinking_level: thinkingLevel,
          ...(maxOutputTokens && { max_output_tokens: maxOutputTokens })
        }
      });
      return parse(interaction.output_text || '');
    } catch (error) {
      lastError = error;
      console.error(`Gemini ${model} failed:`, String(error.message).slice(0, 160));
    }
  }
  throw lastError;
};

// Rate limits, overload and timeouts mean "try again shortly", not "your photo was bad"
const isBusy = (error) => /429|503|rate limit|high demand|overloaded|timeout|timed out|abort/i.test(String(error?.message));

const analyzeSnakeImage = async (base64ImageData, mimeType) => {
  try {
    return await generate(
      [
        { type: 'text', text: IDENTIFY_PROMPT },
        { type: 'image', data: base64ImageData, mime_type: mimeType }
      ],
      'minimal',
      extractJson
    );
  } catch (error) {
    const busy = isBusy(error);
    const err = new Error(busy
      ? 'The AI service is busy right now. Please try again in a moment.'
      : 'AI analysis failed. Please try again with a clearer image.');
    err.statusCode = busy ? 503 : 502;
    throw err;
  }
};

const chat = async (message) => {
  // Minimal thinking and a token cap keep replies fast (the cap leaves room for a full first-aid list)
  const reply = await generate(
    [{ type: 'text', text: `${CHAT_INSTRUCTION}\n\nUser Question: ${message}` }],
    'minimal',
    undefined,
    900
  );
  return reply || "I'm here to help with snake identification and safety. Please ask any question.";
};

module.exports = { analyzeSnakeImage, chat };
