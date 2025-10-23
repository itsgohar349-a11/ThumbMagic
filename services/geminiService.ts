import { GoogleGenAI, Modality } from '@google/genai';
import { fileToBase64 } from '../utils/fileUtils';

// This assumes process.env.API_KEY is available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const STYLES = ['Photorealistic', 'Cinematic', 'Bright Cartoon', 'Vintage'];

export interface GeneratedImage {
  style: string;
  imageUrl: string;
}

const getHeadlineSuggestion = async (baseImage1: File, baseImage2: File | null): Promise<string> => {
    const imageParts = [];
    const base64Image1 = await fileToBase64(baseImage1);
    imageParts.push({
      inlineData: {
        mimeType: baseImage1.type,
        data: base64Image1,
      },
    });

    if (baseImage2) {
        const base64Image2 = await fileToBase64(baseImage2);
        imageParts.push({
          inlineData: {
            mimeType: baseImage2.type,
            data: base64Image2,
          },
        });
    }

    const promptText = baseImage2 
      ? 'Based on these two images, suggest a short, catchy, eye-catching thumbnail headline that captures their combined theme. Provide ONLY the text for the headline, nothing else. Maximum 5 words.'
      : 'Suggest a short, catchy, eye-catching thumbnail headline for this image. Provide ONLY the text for the headline, nothing else. Maximum 5 words.';

    const textPart = {
      text: promptText,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [...imageParts, textPart] },
    });
    
    return response.text.trim().replace(/"/g, ''); // Remove quotes if any
};

export const generateThumbnails = async (
  baseImage1: File,
  baseImage2: File | null,
  text: string
): Promise<GeneratedImage[]> => {
  let headlineText = text;
  if (!headlineText.trim()) {
    headlineText = await getHeadlineSuggestion(baseImage1, baseImage2);
  }

  const imageParts = [];
  const base64Image1 = await fileToBase64(baseImage1);
  imageParts.push({
    inlineData: {
      mimeType: baseImage1.type,
      data: base64Image1,
    },
  });

  if (baseImage2) {
    const base64Image2 = await fileToBase64(baseImage2);
    imageParts.push({
      inlineData: {
        mimeType: baseImage2.type,
        data: base64Image2,
      },
    });
  }
  
  const generationPromises = STYLES.map(async (style) => {
    const mergeInstruction = baseImage2 
      ? `Take the two provided images and **creatively merge them into a single, cohesive background composition**. The merge should look natural and professional. Then, add the text "${headlineText}" as an eye-catching headline.`
      : `Take the provided image and add the text "${headlineText}" as an eye-catching headline.`;

    const prompt = `
      You are an expert thumbnail designer with a modern, cool, and unique aesthetic.
      
      **Primary Goal:** ${mergeInstruction}

      **Instructions:**
      1.  **Dynamic Text Layout (Most Important!)**: Create a visually stunning and dynamic headline.
          *   **Multi-line Composition**: Do NOT just place the text on a single line. Artistically break the headline into multiple lines. For example, for "My Epic Adventure", you could stack it creatively like "MY EPIC" on the first line and "ADVENTURE" below it. Adjust alignment (left, right, center) to best fit the image composition.
          *   **Creative Typography**: Use a bold, playful, high-impact font. You can vary font sizes or weights for different words to create emphasis and visual hierarchy. The goal is a cool, custom-designed look, not just plain text on an image.
          *   **Readability is Key**: Ensure high contrast against the background. Use effects like subtle drop shadows, outlines, or glows to make the text pop and be instantly readable.

      2.  **Smart Emojis**: Intelligently add one or two emojis that match the text's tone and meaning. Integrate them creatively into the headline layout, don't just place them at the end.

      3.  **Image Integrity**: The final composition must be natural and attractive. Harmonize colors. If needed, add a subtle vignette or background blur to enhance focus on the subject and text. **Crucially, preserve the person's face and pose**. Do not distort the person or add extra limbs or artifacts.

      4.  **Safe & Effective Framing**: Keep safe margins for cropping. The headline must be clearly visible even on small thumbnail sizes. Arrange the text for maximum visual impact within the image.

      5.  **Technical Specs**:
          *   **Aspect Ratio**: 16:9 landscape.
          *   **Resolution**: High-resolution, download-ready.

      6.  **Style**: Generate the final image in a **${style}** style.

      7.  **Quality Control**: No watermarks, text artifacts, or low-quality compression. The output must be a clean, professional-grade image.
    `;
    
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [...imageParts, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            return {
                style,
                imageUrl: `data:${mimeType};base64,${base64ImageData}`,
            };
        }
    }
    
    throw new Error(`Image generation failed for style: ${style}`);
  });

  return Promise.all(generationPromises);
};