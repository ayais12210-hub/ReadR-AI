
import { GoogleGenAI, Type } from "@google/genai";
import { PageData, AspectRatio } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const pageSchema = {
  type: Type.OBJECT,
  properties: {
    pageText: {
      type: Type.STRING,
      description: "Concise, read-aloud friendly text for this page. Suitable for ages 6-8."
    },
    sceneSynopsis: {
      type: Type.STRING,
      description: "A one-sentence summary of the action and setting on this page."
    },
    focalCharacters: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of characters who are the main focus of this page."
    },
    setting: {
      type: Type.STRING,
      description: "Description of the location and environment."
    },
    keyProps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of important objects or items on this page."
    },
    mood: {
      type: Type.STRING,
      description: "The emotional tone of this page (e.g., 'curious, gentle')."
    },
  }
};

export const paginateStory = async (fullStory: string): Promise<PageData[]> => {
  const model = "gemini-2.5-pro";
  const prompt = `You are a narrative engine for a children's storybook app. Read the following story and segment it into age-appropriate pages for 6-8 year olds. For each page, provide the required JSON object. Ensure the story flows logically from one page to the next.\n\nSTORY:\n${fullStory}`;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: pageSchema
      },
    },
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as PageData[];
  } catch (e) {
    console.error("Failed to parse paginated story response:", jsonText);
    throw new Error("Could not understand the story structure. Please try a different story.");
  }
};

export const createIllustrationPrompt = async (page: PageData, characterDesc: string, artStyle: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `You are an art director for a children's storybook. Your most important job is to ensure **strict character consistency** across all illustrations. Create a single, detailed, kid-safe illustration prompt.

    CHARACTER BIBLE (Strictly Adhere): ${characterDesc}
    ART STYLE: ${artStyle}
    PAGE DATA: ${JSON.stringify(page)}

    INSTRUCTIONS:
    - The CHARACTER BIBLE is the absolute source of truth for the character's appearance. **Every detail must be strictly enforced in the prompt to maintain visual consistency from page to page.**
    - Combine the character bible, art style, and page data into a cohesive, single-paragraph prompt.
    - Describe the scene, camera framing, and lighting suitable for a picture book.
    - **Reiterate the character's specific appearance and clothing from the bible within the main prompt description.**
    - IMPORTANT: Do NOT include any negative prompts or instructions like "No horror". Focus ONLY on the positive description of the image.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
};

export const generateIllustration = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  const model = 'imagen-4.0-generate-001';
  const fullPrompt = `${prompt}. Negative prompt: dark horror, gore, weapons, text artifacts, deformed anatomy, brand logos.`;

  const response = await ai.models.generateImages({
    model,
    prompt: fullPrompt,
    config: {
      numberOfImages: 1,
      aspectRatio,
      outputMimeType: 'image/png'
    }
  });
  
  if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("Image generation failed.");
  }

  return response.generatedImages[0].image.imageBytes;
};

export const generateAudio = async (text: string): Promise<string> => {
    const model = "gemini-2.5-flash-preview-tts";
    
    // SSML can be complex, for this app, a simple cheerful instruction is sufficient.
    const prompt = `Say cheerfully in a warm, friendly UK English accent: ${text}`;
    
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // A friendly, clear voice
            },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
        throw new Error("Audio generation failed to return data.");
    }
    return base64Audio;
};

export const getCharacterSuggestion = async (): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `You are a creative assistant for a children's book author. Generate a detailed character bible for a new story character, suitable for kids aged 6-8. The bible should be concise but specific enough to ensure visual consistency in illustrations.

Format the output as a single paragraph with clear descriptors. Include:
- **Name and Age:** e.g., "Mina the mouse, 7 years old,"
- **Physical Appearance:** e.g., "with soft grey fur, large curious ears, and a tiny pink nose."
- **Clothing/Signature Outfit:** e.g., "She always wears a bright yellow raincoat and little red boots."
- **Key Personality Traits:** e.g., "She is brave, curious, and a little bit mischievous."

Provide only the description text, without any labels, bullet points, or quotes. The final output should be a single, flowing paragraph.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text.trim();
};

export const getArtStyleSuggestion = async (): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `You are a creative assistant for a children's book illustrator. Generate a single, concise, and evocative art style description. The style should be suitable for a children's picture book. Provide only the description text, without any labels or quotes. Example: 'Soft watercolour storybook illustration with pastel edges and a gentle paper grain texture.'`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text.trim();
};

export const getStorySuggestion = async (): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `You are a creative assistant for a children's book author. Generate a short, complete, and imaginative story suitable for kids aged 6-8. The story should be about 5-6 short paragraphs long. Provide only the story text, without any title, labels, or quotes.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text.trim();
};
