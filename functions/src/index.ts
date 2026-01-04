import * as functions from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";
import cors from "cors";
import express from "express";
import twilio from "twilio";

// Initialize Firebase Admin
admin.initializeApp();

// Define secrets
const googleAiApiKey = defineSecret("GOOGLE_AI_API_KEY");
const twilioAccountSid = defineSecret("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineSecret("TWILIO_AUTH_TOKEN");
const twilioWhatsAppFrom = defineSecret("TWILIO_WHATSAPP_FROM");

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
const getAI = async () => {
  // Prefer Firestore (admin-updatable) values, fall back to deployed secret.
  // This makes Admin "API Settings" updates take effect even when a secret is set.
  let firestoreApiKey: string | undefined;
  try {
    const credentialsRef = admin.firestore().collection('apiCredentials').doc('secrets');
    const credentialsDoc = await credentialsRef.get();
    const credentialsData = credentialsDoc.data();
    firestoreApiKey = credentialsData?.googleAI?.apiKey;
  } catch (error) {
    console.warn('Error reading API key from Firestore:', error);
  }

  const apiKey = (firestoreApiKey && firestoreApiKey.trim()) ? firestoreApiKey.trim() : googleAiApiKey.value();
  
  if (!apiKey) {
    throw new Error("Google AI API key not configured. Set GOOGLE_AI_API_KEY secret via: firebase functions:secrets:set GOOGLE_AI_API_KEY or update via Admin Settings");
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

    const ai = await getAI();
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

    const responseText = response.text;
    if (!responseText) {
      res.status(500).json({ error: "AI failed to generate response" });
      return;
    }
    const plan = JSON.parse(responseText);
    
    // Ensure dailyPlan is always an array, even if AI doesn't return it
    if (!plan.dailyPlan || !Array.isArray(plan.dailyPlan)) {
      plan.dailyPlan = [];
    }
    
    // Validate required fields
    if (!plan.title || !plan.description) {
      res.status(500).json({ error: "AI response missing required fields" });
      return;
    }
    
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error("Generate itinerary error:", error);
    let errorMessage = "Failed to generate itinerary";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("403") || error.message.includes("PERMISSION_DENIED")) {
        errorMessage = "Google AI API key is invalid or has been revoked. Please contact administrator.";
        statusCode = 403;
      } else if (error.message.includes("leaked")) {
        errorMessage = "Google AI API key has been reported as leaked. A new API key is required.";
        statusCode = 403;
      } else {
        errorMessage = error.message;
      }
    }
    
    res.status(statusCode).json({ 
      error: errorMessage, 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
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

    const ai = await getAI();
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

    if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
      const firstImage = imageResponse.generatedImages[0];
      if (firstImage?.image?.imageBytes) {
        const base64ImageBytes: string = firstImage.image.imageBytes;
        const dataUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        res.json({ success: true, data: { imageUrl: dataUrl } });
      } else {
        res.status(500).json({ error: "AI failed to return valid image data" });
      }
    } else {
      res.status(500).json({ error: "AI failed to return an image" });
    }
  } catch (error) {
    console.error("Generate image error:", error);
    let errorMessage = "Failed to generate image";
    let statusCode = 500;
    
    if (error instanceof Error) {
      // Check for API key errors
      if (error.message.includes("API key") || error.message.includes("403") || error.message.includes("PERMISSION_DENIED")) {
        errorMessage = "Google AI API key is invalid or has been revoked. Please contact administrator.";
        statusCode = 403;
      } else if (error.message.includes("leaked")) {
        errorMessage = "Google AI API key has been reported as leaked. A new API key is required.";
        statusCode = 403;
      } else {
        errorMessage = error.message;
      }
    }
    
    res.status(statusCode).json({ 
      error: errorMessage, 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
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

    const ai = await getAI();

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

// Create User (Admin only)
app.post("/createUser", verifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    console.log("[createUser] Request received:", { 
      email: req.body.email, 
      name: req.body.name,
      hasPassword: !!req.body.password,
      roles: req.body.roles 
    });
    
    const { email, password, name, countryCode, contactNumber, roles, customRoles } = req.body;
    const { uid } = req.body; // From verifyAuth middleware

    if (!email || !password || !name || !countryCode || !contactNumber || !roles || roles.length === 0) {
      console.error("[createUser] Missing required fields");
      res.status(400).json({ 
        success: false,
        error: "Missing required fields: email, password, name, countryCode, contactNumber, and at least one role are required" 
      });
      return;
    }
    
    // Validate contact number format
    const contactNumberDigits = contactNumber.replace(/\D/g, '');
    if (contactNumberDigits.length < 7 || contactNumberDigits.length > 15) {
      console.error("[createUser] Invalid contact number format");
      res.status(400).json({ 
        success: false,
        error: "Contact number must be between 7 and 15 digits" 
      });
      return;
    }

    // Verify the requester is an admin
    console.log("[createUser] Verifying admin status for requester:", uid);
    const requesterRecord = await admin.auth().getUser(uid);
    const requesterCustomClaims = requesterRecord.customClaims || {};
    const requesterRoles = requesterCustomClaims.roles || [];
    
    // Also check Firestore for roles
    const requesterDoc = await admin.firestore().collection('users').doc(uid).get();
    const requesterData = requesterDoc.data();
    const requesterFirestoreRoles = requesterData?.roles || [];

    const isAdmin = requesterRoles.includes('Admin') || requesterFirestoreRoles.includes('Admin');
    console.log("[createUser] Requester admin status:", isAdmin, { requesterRoles, requesterFirestoreRoles });
    
    if (!isAdmin) {
      console.error("[createUser] Forbidden: User is not an admin");
      res.status(403).json({ 
        success: false,
        error: "Forbidden: Only admins can create users" 
      });
      return;
    }

    // Create user in Firebase Auth
    console.log("[createUser] Creating Firebase Auth user...");
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });
    console.log("[createUser] Firebase Auth user created:", userRecord.uid);

    // Set custom claims for roles
    if (roles && roles.length > 0) {
      console.log("[createUser] Setting custom claims:", roles);
      await admin.auth().setCustomUserClaims(userRecord.uid, { roles });
    }

    // Create user document in Firestore
    console.log("[createUser] Creating Firestore document...");
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      name,
      email,
      countryCode: countryCode.trim(),
      contactNumber: contactNumberDigits, // Store only digits
      roles: roles || [],
      customRoles: customRoles || [],
    });
    console.log("[createUser] Firestore document created successfully");

    const response = { 
      success: true, 
      data: { 
        uid: userRecord.uid,
        email: userRecord.email,
        name,
        roles 
      } 
    };
    console.log("[createUser] Success - returning response:", response);
    res.json(response);
  } catch (error) {
    console.error("[createUser] Error occurred:", error);
    if (error instanceof Error) {
      console.error("[createUser] Error details:", {
        message: error.message,
        code: (error as any).code,
        stack: error.stack
      });
      
      if (error.message.includes('email-already-exists') || (error as any).code === 'auth/email-already-exists') {
        res.status(409).json({ 
          success: false,
          error: "User with this email already exists" 
        });
        return;
      }
    }
    
    res.status(500).json({ 
      success: false,
      error: "Failed to create user", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Update User Password (Admin only)
app.post("/updateUserPassword", verifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    console.log("[updateUserPassword] Request received:", { 
      targetUserId: req.body.userId,
      hasPassword: !!req.body.password
    });
    
    const { userId, password } = req.body;
    const { uid } = req.body; // From verifyAuth middleware

    if (!userId || !password) {
      console.error("[updateUserPassword] Missing required fields");
      res.status(400).json({ 
        success: false,
        error: "Missing required fields: userId and password are required" 
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      console.error("[updateUserPassword] Password too short");
      res.status(400).json({ 
        success: false,
        error: "Password must be at least 6 characters long" 
      });
      return;
    }

    // Verify the requester is an admin
    console.log("[updateUserPassword] Verifying admin status for requester:", uid);
    const requesterRecord = await admin.auth().getUser(uid);
    const requesterCustomClaims = requesterRecord.customClaims || {};
    const requesterRoles = requesterCustomClaims.roles || [];
    
    // Also check Firestore for roles
    const requesterDoc = await admin.firestore().collection('users').doc(uid).get();
    const requesterData = requesterDoc.data();
    const requesterFirestoreRoles = requesterData?.roles || [];

    const isAdmin = requesterRoles.includes('Admin') || requesterFirestoreRoles.includes('Admin');
    console.log("[updateUserPassword] Requester admin status:", isAdmin, { requesterRoles, requesterFirestoreRoles });
    
    if (!isAdmin) {
      console.error("[updateUserPassword] Forbidden: User is not an admin");
      res.status(403).json({ 
        success: false,
        error: "Forbidden: Only admins can update user passwords" 
      });
      return;
    }

    // Check if target user exists
    let targetUser;
    try {
      targetUser = await admin.auth().getUser(userId);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.error("[updateUserPassword] Target user not found in Firebase Auth");
        res.status(404).json({ 
          success: false,
          error: "User not found in Firebase Authentication" 
        });
        return;
      }
      throw error;
    }

    // Update password in Firebase Auth
    console.log("[updateUserPassword] Updating password for user:", targetUser.email);
    await admin.auth().updateUser(userId, {
      password: password
    });
    console.log("[updateUserPassword] Password updated successfully");

    const response = { 
      success: true, 
      message: "Password updated successfully",
      data: { 
        uid: userId,
        email: targetUser.email
      } 
    };
    console.log("[updateUserPassword] Success - returning response:", response);
    res.json(response);
  } catch (error) {
    console.error("[updateUserPassword] Error occurred:", error);
    if (error instanceof Error) {
      console.error("[updateUserPassword] Error details:", {
        message: error.message,
        code: (error as any).code,
        stack: error.stack
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: "Failed to update password", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Send WhatsApp Message (Admin only)
app.post("/sendWhatsApp", verifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    const { userIds, message } = req.body;
    const { uid } = req.body; // From verifyAuth middleware

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ 
        success: false,
        error: "Missing or invalid userIds array" 
      });
      return;
    }

    if (!message || !message.trim()) {
      res.status(400).json({ 
        success: false,
        error: "Message is required" 
      });
      return;
    }

    // Verify the requester is an admin
    const requesterDoc = await admin.firestore().collection('users').doc(uid).get();
    const requesterData = requesterDoc.data();
    const requesterFirestoreRoles = requesterData?.roles || [];
    const isAdmin = requesterFirestoreRoles.includes('Admin');

    if (!isAdmin) {
      res.status(403).json({ 
        success: false,
        error: "Forbidden: Only admins can send WhatsApp messages" 
      });
      return;
    }

    // Prefer Firestore (admin-updatable) values, fall back to deployed secrets.
    let firestoreTwilio: any = null;
    try {
      const credentialsRef = admin.firestore().collection('apiCredentials').doc('secrets');
      const credentialsDoc = await credentialsRef.get();
      const credentialsData = credentialsDoc.data();
      firestoreTwilio = credentialsData?.twilio || null;
    } catch (error) {
      console.warn('Error reading Twilio credentials from Firestore:', error);
    }

    const accountSid = (firestoreTwilio?.accountSid && String(firestoreTwilio.accountSid).trim())
      ? String(firestoreTwilio.accountSid).trim()
      : twilioAccountSid.value();
    const authToken = (firestoreTwilio?.authToken && String(firestoreTwilio.authToken).trim())
      ? String(firestoreTwilio.authToken).trim()
      : twilioAuthToken.value();
    const fromNumber = (firestoreTwilio?.whatsappFrom && String(firestoreTwilio.whatsappFrom).trim())
      ? String(firestoreTwilio.whatsappFrom).trim()
      : twilioWhatsAppFrom.value();

    if (!accountSid || !authToken || !fromNumber) {
      res.status(500).json({ 
        success: false,
        error: "Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM secrets or update via Admin Settings." 
      });
      return;
    }

    const client = twilio(accountSid, authToken);
    const results = [];
    const errors = [];

    // Fetch all users and filter out admins
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where(admin.firestore.FieldPath.documentId(), 'in', userIds)
      .get();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Skip admins
      if (userData.roles && userData.roles.includes('Admin')) {
        continue;
      }

      // Determine WhatsApp number
      let whatsappNumber: string | null = null;
      let whatsappCountryCode: string | null = null;

      if (userData.useSameAsContact !== false) {
        // Use contact number
        whatsappNumber = userData.contactNumber;
        whatsappCountryCode = userData.countryCode;
      } else if (userData.whatsappNumber && userData.whatsappCountryCode) {
        // Use separate WhatsApp number
        whatsappNumber = userData.whatsappNumber;
        whatsappCountryCode = userData.whatsappCountryCode;
      }

      if (!whatsappNumber || !whatsappCountryCode) {
        errors.push({
          userId: userDoc.id,
          email: userData.email,
          error: "No WhatsApp number available"
        });
        continue;
      }

      // Format phone number for Twilio (E.164 format)
      const phoneNumber = `${whatsappCountryCode}${whatsappNumber}`;

      try {
        const twilioMessage = await client.messages.create({
          from: `whatsapp:${fromNumber}`,
          to: `whatsapp:${phoneNumber}`,
          body: message.trim(),
        });

        results.push({
          userId: userDoc.id,
          email: userData.email,
          phoneNumber,
          messageSid: twilioMessage.sid,
          status: 'sent'
        });
      } catch (twilioError: any) {
        errors.push({
          userId: userDoc.id,
          email: userData.email,
          phoneNumber,
          error: twilioError.message || "Failed to send message"
        });
      }
    }

    res.json({ 
      success: true,
      data: {
        sent: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error("WhatsApp send error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to send WhatsApp messages", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Update API Credentials (Admin only)
app.post("/updateApiCredentials", verifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    const { section, field, value } = req.body;
    const { uid } = req.body; // From verifyAuth middleware

    if (!section || !value || !value.trim()) {
      res.status(400).json({ 
        success: false,
        error: "Missing required fields: section and value are required" 
      });
      return;
    }

    // Verify the requester is an admin
    const requesterDoc = await admin.firestore().collection('users').doc(uid).get();
    const requesterData = requesterDoc.data();
    const requesterFirestoreRoles = requesterData?.roles || [];
    const isAdmin = requesterFirestoreRoles.includes('Admin');

    if (!isAdmin) {
      res.status(403).json({ 
        success: false,
        error: "Forbidden: Only admins can update API credentials" 
      });
      return;
    }

    // Store credentials in Firestore (secure collection)
    const credentialsRef = admin.firestore().collection('apiCredentials').doc('secrets');
    const credentialsData: any = {};
    
    if (section === 'googleAI') {
      credentialsData.googleAI = { apiKey: value.trim() };
    } else if (section === 'twilio' && field) {
      const currentData = (await credentialsRef.get()).data() || {};
      credentialsData.twilio = {
        ...(currentData.twilio || {}),
        [field]: value.trim()
      };
    } else if (section === 'email') {
      const currentData = (await credentialsRef.get()).data() || {};
      if (field === 'apiKey') {
        credentialsData.email = {
          ...(currentData.email || {}),
          apiKey: value.trim()
        };
      } else if (field === 'fromEmail') {
        credentialsData.email = {
          ...(currentData.email || {}),
          fromEmail: value.trim()
        };
      } else if (field === 'service') {
        credentialsData.email = {
          ...(currentData.email || {}),
          service: value.trim()
        };
      }
    }

    // Update Firestore document
    await credentialsRef.set(credentialsData, { merge: true });

    // Note: To actually update Firebase Functions secrets, you would need to:
    // 1. Use Firebase Admin SDK to update secrets (requires special permissions)
    // 2. Or use Firebase CLI: firebase functions:secrets:set SECRET_NAME
    // For now, we store in Firestore and functions can read from there as fallback

    res.json({ 
      success: true,
      message: "API credentials updated successfully",
      data: { section, field: field || 'main' }
    });
  } catch (error) {
    console.error("Update API credentials error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update API credentials", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Get API Credentials Status (Admin only) - Returns masked values
app.get("/getApiCredentialsStatus", verifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Verify the requester is an admin
    const requesterDoc = await admin.firestore().collection('users').doc(uid).get();
    const requesterData = requesterDoc.data();
    const requesterFirestoreRoles = requesterData?.roles || [];
    const isAdmin = requesterFirestoreRoles.includes('Admin');

    if (!isAdmin) {
      res.status(403).json({ 
        success: false,
        error: "Forbidden: Only admins can view API credentials status" 
      });
      return;
    }

    // Check if credentials exist in Firestore
    const credentialsRef = admin.firestore().collection('apiCredentials').doc('secrets');
    const credentialsDoc = await credentialsRef.get();
    const credentialsData = credentialsDoc.data() || {};

    // Prefer Firestore when present (admin-updatable override), else secret.
    const secretsStatus = {
      googleAI: {
        configured: !!credentialsData.googleAI?.apiKey || !!googleAiApiKey.value(),
        source: credentialsData.googleAI?.apiKey ? 'firestore' : (googleAiApiKey.value() ? 'secret' : 'none')
      },
      twilio: {
        accountSid: {
          configured: !!credentialsData.twilio?.accountSid || !!twilioAccountSid.value(),
          source: credentialsData.twilio?.accountSid ? 'firestore' : (twilioAccountSid.value() ? 'secret' : 'none')
        },
        authToken: {
          configured: !!credentialsData.twilio?.authToken || !!twilioAuthToken.value(),
          source: credentialsData.twilio?.authToken ? 'firestore' : (twilioAuthToken.value() ? 'secret' : 'none')
        },
        whatsappFrom: {
          configured: !!credentialsData.twilio?.whatsappFrom || !!twilioWhatsAppFrom.value(),
          source: credentialsData.twilio?.whatsappFrom ? 'firestore' : (twilioWhatsAppFrom.value() ? 'secret' : 'none')
        }
      }
    };

    res.json({ 
      success: true,
      data: secretsStatus
    });
  } catch (error) {
    console.error("Get API credentials status error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to get API credentials status", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Export HTTP functions with secret access
export const api = functions.https.onRequest(
  {
    secrets: [googleAiApiKey, twilioAccountSid, twilioAuthToken, twilioWhatsAppFrom],
  },
  app
);

