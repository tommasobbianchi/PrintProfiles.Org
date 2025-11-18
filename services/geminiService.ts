import { GoogleGenAI, Type } from "@google/genai";
import { FilamentProfile, PrinterBrand, FilamentType } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        nozzleTemp: {
            type: Type.NUMBER,
            description: "Suggested nozzle temperature in Celsius.",
        },
        bedTemp: {
            type: Type.NUMBER,
            description: "Suggested bed temperature in Celsius.",
        },
        printSpeed: {
            type: Type.NUMBER,
            description: "Suggested general print speed in mm/s.",
        },
        retractionDistance: {
            type: Type.NUMBER,
            description: "Suggested retraction distance in mm. Should be low for direct drive (e.g., Bambu) and higher for Bowden (e.g., Creality Ender).",
        },
        retractionSpeed: {
            type: Type.NUMBER,
            description: "Suggested retraction speed in mm/s.",
        },
        fanSpeed: {
            type: Type.NUMBER,
            description: "Suggested part cooling fan speed as a percentage (0-100). PETG usually requires less fan than PLA.",
        },
    },
    required: ["nozzleTemp", "bedTemp", "printSpeed", "retractionDistance", "retractionSpeed", "fanSpeed"],
};

export const suggestFilamentSettings = async (
  printerBrand: PrinterBrand,
  filamentType: FilamentType,
  manufacturer: string,
  brand?: string
): Promise<Partial<FilamentProfile>> => {
  try {
    const prompt = `
      Based on the following 3D printer and filament information, provide optimal settings for a high-quality print.
      - Printer Brand: ${printerBrand}
      - Filament Type: ${filamentType}
      - Manufacturer: ${manufacturer || 'Generic'}
      - Brand/Product Line: ${brand || 'N/A'}

      Consider the typical hardware for the specified printer brand (e.g., direct drive vs. Bowden extruder) when suggesting retraction settings.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("AI returned an empty response.");
    }

    const suggestedSettings = JSON.parse(jsonText);
    return suggestedSettings as Partial<FilamentProfile>;

  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    throw new Error("Failed to get AI suggestions. Please check your API key and try again.");
  }
};
