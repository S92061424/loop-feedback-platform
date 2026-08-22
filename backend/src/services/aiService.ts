import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ClassificationResult {
  sentiment: "POS" | "NEU" | "NEG";
  sentimentScore: number;
  themes: string[];
  featureArea: string;
  rationale: string;
}

export const classifyFeedback = async (
  content: string,
  existingThemes: string[] = []
): Promise<ClassificationResult> => {
  const apiKey = process.env.GOOGLE_API_KEY as string;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const prompt = `You are a customer feedback classifier. Analyze this feedback and return ONLY valid JSON, no markdown fences, no extra text.

Feedback: "${content}"

${existingThemes.length > 0 ? `Existing themes to reuse if relevant: ${existingThemes.join(", ")}` : ""}

Return JSON in exactly this shape:
{
  "sentiment": "POS" | "NEU" | "NEG",
  "sentimentScore": <number between -1 and 1>,
  "themes": [<array of 1-2 short theme names, reuse existing ones when they fit>],
  "featureArea": "<short feature area label, e.g. 'onboarding', 'billing', 'mobile app'>",
  "rationale": "<one sentence explaining the classification>"
}`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();

  // Strip markdown code fences if present
  text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

  try {
    const parsed = JSON.parse(text) as ClassificationResult;
    return parsed;
  } catch (err) {
    console.error("Failed to parse AI classification response:", text);
    throw new Error("AI classification returned invalid JSON");
  }
};