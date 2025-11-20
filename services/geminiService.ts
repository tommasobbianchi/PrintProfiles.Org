import { GoogleGenAI, Type } from "@google/genai";
import { FilamentProfile, PrinterBrand, FilamentType } from '../types';

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        nozzleTemp: {
            type: Type.NUMBER,
            description: "Suggested nozzle temperature for other layers in Celsius.",
        },
        nozzleTempInitial: {
            type: Type.NUMBER,
            description: "Suggested nozzle temperature for the first layer in Celsius (usually 5-10 degrees hotter).",
        },
        bedTemp: {
            type: Type.NUMBER,
            description: "Suggested bed temperature for other layers in Celsius.",
        },
        bedTempInitial: {
            type: Type.NUMBER,
            description: "Suggested bed temperature for the first layer in Celsius.",
        },
        printSpeed: {
            type: Type.NUMBER,
            description: "Suggested general print speed in mm/s.",
        },
        maxVolumetricSpeed: {
            type: Type.NUMBER,
            description: "Maximum volumetric speed (flow rate) in mm³/s. Very important for modern printers (e.g. 22 for PLA, 12 for PETG).",
        },
        retractionDistance: {
            type: Type.NUMBER,
            description: "Suggested retraction distance in mm.",
        },
        retractionSpeed: {
            type: Type.NUMBER,
            description: "Suggested retraction speed in mm/s.",
        },
        fanSpeedMin: {
            type: Type.NUMBER,
            description: "Minimum part cooling fan speed percentage (e.g., 100 for PLA, 30 for PETG, 0 for ABS).",
        },
        fanSpeedMax: {
            type: Type.NUMBER,
            description: "Maximum part cooling fan speed percentage.",
        },
    },
    required: ["nozzleTemp", "nozzleTempInitial", "bedTemp", "bedTempInitial", "printSpeed", "maxVolumetricSpeed", "retractionDistance", "retractionSpeed", "fanSpeedMin", "fanSpeedMax"],
};

export const suggestFilamentSettings = async (
  printerBrand: PrinterBrand,
  filamentType: FilamentType,
  manufacturer: string,
  brand?: string
): Promise<Partial<FilamentProfile>> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
      throw new Error("API_KEY environment variable not set. AI features will not work.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      Based on the following 3D printer and filament information, provide optimal settings for a high-quality print.
      
      - Printer Brand: ${printerBrand}
      - Filament Type: ${filamentType}
      - Manufacturer: ${manufacturer || 'Generic'}
      - Brand/Product Line: ${brand || 'N/A'}

      Crucial: Determine the 'Max Volumetric Speed' (Flow Rate) in mm³/s accurately. This is critical for modern slicers like Orca Slicer and Bambu Studio.
      Also distinguish between initial layer temperatures and standard temperatures.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonText = response.text;
    if (!jsonText) {
        throw new Error("AI returned an empty response.");
    }

    const suggestedSettings = JSON.parse(jsonText);
    return suggestedSettings as Partial<FilamentProfile>;

  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) {
        throw error;
    }
    throw new Error("Failed to get AI suggestions. Please check your API key and try again.");
  }
};