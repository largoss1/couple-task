import { GoogleGenAI } from "@google/genai";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in environment variables"
    );
  }

  return new GoogleGenAI({
    apiKey: apiKey,
  });
}

/**
 * Generate AI response (simplified - returns text only)
 */
export async function generateGeminiResponse(userMessage, systemContext = "") {
  try {
    const ai = getGeminiClient();

    const prompt = systemContext
      ? `${systemContext}\n\nUser: ${userMessage}\n\nAssistant:`
      : userMessage;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    return {
      text: text.trim(),
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error(`Gemini request failed: ${error.message}`);
  }
}

/**
 * Parse AI response to detect task creation intent
 */
export function parseTaskCreationIntent(aiResponse) {
  const response = aiResponse.toLowerCase();

  // Keywords that indicate task creation
  const createKeywords = [
    "create_task",
    "add_task",
    "new_task",
    "i will create",
    "i'll create",
    "let me create",
    "creating a task",
    "adding a task",
  ];

  const hasCreateIntent = createKeywords.some((keyword) =>
    response.includes(keyword)
  );

  if (!hasCreateIntent) {
    return null;
  }

  // Try to extract task details from response
  // This is a simple regex-based parser
  const titleMatch =
    response.match(/title[:\s]+"([^"]+)"/i) ||
    response.match(/task[:\s]+"([^"]+)"/i) ||
    response.match(/"([^"]+)"/);

  const dateMatch =
    response.match(/date[:\s]+"?([^",\n]+)"?/i) ||
    response.match(/(today|tomorrow|next week|tonight)/i);

  const timeMatch =
    response.match(/time[:\s]+"?(\d{1,2}:\d{2}\s*(?:am|pm)?)"?/i) ||
    response.match(/at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);

  const priorityMatch =
    response.match(/priority[:\s]+(\d)/i) ||
    response.match(/(urgent|high priority)/i);

  return {
    title: titleMatch?.[1]?.trim(),
    dueDate: dateMatch?.[1]?.trim(),
    dueTime: timeMatch?.[1]?.trim(),
    priority: priorityMatch
      ? priorityMatch[1] === "urgent" || priorityMatch[1] === "high priority"
        ? 4
        : parseInt(priorityMatch[1]) || 2
      : 2,
  };
}
