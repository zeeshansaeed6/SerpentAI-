const { GoogleGenAI } = require('@google/genai');

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const analyzeSnakeImage = async (base64ImageData, mimeType) => {
  const prompt = `You are an expert herpetologist AI assistant specializing in snake species identification. Analyze this image carefully.

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

  try {
    const interaction = await client.interactions.create({
      model: 'gemini-3.6-flash',
      input: [
        { type: 'text', text: prompt },
        {
          type: 'image',
          data: base64ImageData,
          mime_type: mimeType
        }
      ]
    });

    const responseText = interaction.output_text;

    // Clean the response - remove markdown code fences if present
    let cleanedText = responseText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const result = JSON.parse(cleanedText);
    return result;
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

module.exports = { analyzeSnakeImage };
