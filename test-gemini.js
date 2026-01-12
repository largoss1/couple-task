import { GoogleGenAI } from "@google/genai";

async function testGemini() {
  console.log("Testing Gemini SDK...\n");

  const apiKey = "AIzaSyAlAJdUZv338_eF3COMTbG3or7aeZhZ5bE"; // Thay bằng key thật

  if (!apiKey || apiKey === "YAIzaSyAlAJdUZv338_eF3COMTbG3or7aeZhZ5bE") {
    console.error("❌ Please set your API key in the test file");
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    console.log("📤 Sending request to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: "Hello! Can you help me organize my schedule today?",
    });

    console.log("✅ Success!\n");
    console.log("Response:", response.text);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\nDetails:", error);
  }
}

testGemini();
