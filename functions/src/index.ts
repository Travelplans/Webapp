import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";
import * as cors from "cors";
import * as express from "express";

// Initialize Firebase Admin
admin.initializeApp();

// Initialize CORS
const corsHandler = cors({ origin: true });

// Initialize Express app for HTTP functions
const app = express();
app.use(corsHandler);
app.use(express.json());

// Apply rate limiting to all routes
import { rateLimiter } from './middleware/rateLimiter';
app.use(rateLimiter);

// Initialize Google AI
const getAI = () => {
  // Get from Firebase Functions config (production) or environment variable (local dev)
  const apiKey = functions.config().googleai?.api_key || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Google AI API key not configured. Set via: firebase functions:config:set googleai.api_key=YOUR_KEY or GOOGLE_AI_API_KEY env var");
  }
  return new GoogleGenAI({ apiKey });
};

// Middleware to verify authentication
const verifyAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.body.uid = decodedToken.uid;
    next();
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Generate Itinerary
app.post("/generateItinerary", verifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    const { destination, duration, travelerType, budget } = req.body;

    if (!destination || !duration || !travelerType || !budget) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const ai = getAI();
    const prompt = `Create a detailed travel itinerary for a ${duration}-day trip to ${destination} for a ${travelerType} on a ${budget} budget. Provide a catchy title, an estimated price for one person in AED, a compelling one-paragraph summary of the trip, and a day-by-day plan. Each day should have a title and a paragraph describing the activities.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        price: { type: Type.INTEGER, description: "Estimated price for one person in AED, based on the budget." },
        description: { type: Type.STRING, description: "A compelling one-paragraph summary of the trip." },
        dailyPlan: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.INTEGER },
              title: { type: Type.STRING },
              activities: { type: Type.STRING },
            },
          },
        },
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const plan = JSON.parse(response.text);
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error("Generate itinerary error:", error);
    res.status(500).json({ error: "Failed to generate itinerary", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Generate Image
app.post("/generateImage", verifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    const { prompt, destination } = req.body;

    if (!prompt && !destination) {
      res.status(400).json({ error: "Missing prompt or destination" });
      return;
    }

    const ai = getAI();
    const imagePrompt = prompt || `A scenic, high-quality, vibrant photograph representing a travel destination: ${destination}. No text or people.`;

    const imageResponse = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "16:9",
      },
    });

    if (imageResponse.generatedImages?.length > 0) {
      const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
      const dataUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      res.json({ success: true, data: { imageUrl: dataUrl } });
    } else {
      res.status(500).json({ error: "AI failed to return an image" });
    }
  } catch (error) {
    console.error("Generate image error:", error);
    res.status(500).json({ error: "Failed to generate image", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Chat with AI
app.post("/chat", verifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    const { message, itineraryContext } = req.body;

    if (!message) {
      res.status(400).json({ error: "Missing message" });
      return;
    }

    const ai = getAI();

    const systemInstruction = itineraryContext
      ? `You are a friendly and helpful travel assistant for a company called "Travelplans.fun". Your goal is to help users find their perfect travel package. You have access to the following list of available itineraries. Use this information to answer user questions and make recommendations. Be concise and conversational. Do not mention that you have a list; just use the information naturally.\n\nAvailable Itineraries:\n${itineraryContext}`
      : `You are a friendly and helpful travel assistant for a company called "Travelplans.fun". Your goal is to help users find their perfect travel package. Be concise and conversational.`;

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction,
      },
    });

    const responseStream = await chat.sendMessageStream({ message });

    let fullResponse = "";
    for await (const chunk of responseStream) {
      fullResponse += chunk.text;
    }

    res.json({ success: true, data: { text: fullResponse } });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat message", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Export HTTP functions
export const api = functions.https.onRequest(app);

