import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export interface AiResponse {
  response: string;
  reasoning: string;
  original_prompt: string;
}

export interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export async function sendPrompt(prompt: string): Promise<AiResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/prompt`, { prompt });
    return response.data;
  } catch (error) {
    console.error("Error sending prompt to AI:", error);
    throw error;
  }
}
