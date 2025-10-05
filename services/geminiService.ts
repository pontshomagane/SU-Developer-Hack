import { GoogleGenAI, Type } from "@google/genai";
import { Machine } from "../types";

let ai: GoogleGenAI | null = null;

// Cache for API responses to reduce costs and improve performance
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

const getAI = () => {
  if (!ai) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not configured. Please set GEMINI_API_KEY in your environment variables.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const rateLimit = () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    return new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = now;
  return Promise.resolve();
};

const getCachedResponse = (key: string) => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedResponse = (key: string, data: any) => {
  responseCache.set(key, { data, timestamp: Date.now() });
};

export const predictDelay = async (delayHistory: number[], duration: number): Promise<{ predicted_delay_minutes: number; reminder_message: string; }> => {
  try {
    // Create cache key based on delay history and duration
    const cacheKey = `delay_${delayHistory.join(',')}_${duration}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      console.log("Using cached delay prediction");
      return cached;
    }

    await rateLimit();
    const aiInstance = getAI();
    
    const prompt = `
You are AuraBot, an AI assistant for users of the DYP Aura smart living system.

Student's delay history (minutes after cycle finished): [${delayHistory.join(', ')}]
Current cycle duration: ${duration} minutes

TASK: Predict delay and create personalized reminder.

DELAY PREDICTION RULES:
- New users (empty history): 3-5 minutes
- Consistent users (avg < 5 min): 2-4 minutes  
- Variable users (avg 5-15 min): 5-10 minutes
- Often late users (avg > 15 min): 10-20 minutes

REMINDER MESSAGE GUIDELINES:
- Keep under 25 words
- Use modern, intelligent terminology when appropriate
- Be encouraging and friendly
- Reference studying, res life, or campus activities

EXAMPLES:
- On-time users: "You're a laundry legend! Your wash will be done soon."
- Often late: "Don't leave your machine hanging! Your res-mates will thank you."
- New users: "Welcome to DYP Aura! Your cycle is running smoothly."

Return ONLY valid JSON: {"predicted_delay_minutes": number, "reminder_message": string}
`;

    const response = await aiInstance.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predicted_delay_minutes: { type: Type.NUMBER },
            reminder_message: { type: Type.STRING },
          },
          required: ["predicted_delay_minutes", "reminder_message"],
        },
        temperature: 0.7,
        maxOutputTokens: 150,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    const result = {
      predicted_delay_minutes: Math.max(0, Math.min(30, parsed.predicted_delay_minutes || 5)),
      reminder_message: parsed.reminder_message || `Your ${duration} min cycle is running!`
    };
    
    setCachedResponse(cacheKey, result);
    return result;
    
  } catch (error) {
    console.error("Error in predictDelay:", error);
    
    // Enhanced fallback based on delay history
    const avgDelay = delayHistory.length > 0 ? delayHistory.reduce((a, b) => a + b, 0) / delayHistory.length : 5;
    const fallbackDelay = Math.min(15, Math.max(3, Math.round(avgDelay * 0.8)));
    
    const fallbackMessages = [
      `Your ${duration} min cycle is running smoothly!`,
      `Laundry in progress! Check back in ${duration} minutes.`,
      `Cycle started! Your clothes will be ready soon.`,
      `DYP Aura is working hard for you!`
    ];
    
    return {
      predicted_delay_minutes: fallbackDelay,
      reminder_message: fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]
    };
  }
};


export const getChatbotResponse = async (question: string, machines: Machine[]): Promise<string> => {
  try {
    // Create cache key based on question and machine status
    const machineStatusHash = machines.map(m => `${m.type}${m.id}${m.status}`).join('');
    const cacheKey = `chat_${question.toLowerCase().replace(/\s+/g, '_')}_${machineStatusHash}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      console.log("Using cached chatbot response");
      return cached;
    }

    await rateLimit();
    const aiInstance = getAI();
    
    const machineStatusSummary = machines.map(m => `${m.type} ${m.id}: ${m.status}`).join(', ');
    const freeMachines = machines.filter(m => m.status === 'Free');
    const busyMachines = machines.filter(m => m.status === 'Busy');
    
    const systemInstruction = `
You are AuraBot, the official intelligent assistant for the DYP Aura smart living system.

CURRENT MACHINE STATUS: ${machineStatusSummary}

RESPONSE GUIDELINES:
- Be friendly, helpful, and use Stellenbosch/Matie slang appropriately
- Keep responses concise (under 50 words)
- ONLY answer laundry-related questions
- Use current machine status to provide accurate information
- For non-laundry questions, politely redirect: "I'm here to help with laundry! Ask me about machine availability, cycle times, or laundry tips."

SMART SUGGESTIONS:
- If multiple machines are free: "Great time to do laundry! ${freeMachines.length} machines available."
- If machines are busy: "Most machines are busy. Try again in 30-60 minutes."
- For specific machine queries: Check the status and respond directly

INTELLIGENT CONTEXT:
- Reference living spaces and smart home concepts
- Mention productivity, lifestyle optimization, or modern living when relevant
- Be encouraging about efficient time management

Remember: You're helping students save time for studying and campus life!
`;

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 100,
      }
    });

    const responseText = response.text.trim();
    setCachedResponse(cacheKey, responseText);
    return responseText;
    
  } catch (error) {
    console.error("Error in getChatbotResponse:", error);
    
    // Smart fallback responses based on machine status
    const freeMachines = machines.filter(m => m.status === 'Free');
    const busyMachines = machines.filter(m => m.status === 'Busy');
    
    if (question.toLowerCase().includes('free') || question.toLowerCase().includes('available')) {
      if (freeMachines.length > 0) {
        return `Yes! ${freeMachines.length} machines are free: ${freeMachines.map(m => `${m.type} ${m.id}`).join(', ')}.`;
      } else {
        return "All machines are currently busy. Check back in 30-60 minutes!";
      }
    }
    
    if (question.toLowerCase().includes('time') || question.toLowerCase().includes('when')) {
      if (freeMachines.length >= 2) {
        return "Perfect time for laundry! Multiple machines available.";
      } else if (freeMachines.length === 1) {
        return "One machine free - grab it quick!";
      } else {
        return "All machines busy. Try again later or check back in an hour.";
      }
    }
    
    // Generic fallback
    const fallbackResponses = [
      "I'm here to help with laundry questions! Ask me about machine availability.",
      "Sorry, I'm having trouble connecting. Check the machine status above!",
      "I can help with laundry info! What would you like to know?",
      "Having connection issues, but you can see machine status on the dashboard!"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
};