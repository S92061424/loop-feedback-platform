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

export const embedText = async (text: string): Promise<number[]> => {
  const apiKey = process.env.GOOGLE_API_KEY as string;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  const result = await model.embedContent(text);
  return result.embedding.values;
};

export const cosineSimilarity = (a: number[], b: number[]): number => {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const answerQuestion = async (
  question: string,
  contextItems: { content: string; sentiment?: string | undefined; channel: string }[]
): Promise<string> => {

  const apiKey = process.env.GOOGLE_API_KEY as string;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const contextText = contextItems
    .map((item, i) => `[${i + 1}] (${item.channel}, sentiment: ${item.sentiment || "unknown"}) ${item.content}`)
    .join("\n");

  const prompt = `You are answering questions about customer feedback for a product team. Answer ONLY using the feedback provided below. If the feedback doesn't contain enough information to answer, say so clearly. Do not invent or assume anything not present in the feedback.

Feedback data:
${contextText}

Question: ${question}

Give a concise, direct answer grounded only in the feedback above. Reference item numbers like [1], [2] where relevant.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};
export const generateReportNarrative = async (stats: {
  totalFeedback: number;
  sentimentBreakdown: { POS: number; NEU: number; NEG: number };
  topThemes: { name: string; count: number }[];
  sampleQuotes: string[];
}): Promise<string> => {
  const apiKey = process.env.GOOGLE_API_KEY as string;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const prompt = `You are writing a Voice-of-Customer report for a product team's leadership. Use ONLY the data below — do not invent numbers or facts.

Total feedback this period: ${stats.totalFeedback}
Sentiment breakdown: ${stats.sentimentBreakdown.POS} positive, ${stats.sentimentBreakdown.NEU} neutral, ${stats.sentimentBreakdown.NEG} negative
Top themes: ${stats.topThemes.map((t) => `${t.name} (${t.count} mentions)`).join(", ")}
Sample verbatim quotes: ${stats.sampleQuotes.map((q) => `"${q}"`).join(" | ")}

Write a short professional report (3-4 short paragraphs) covering:
1. Overall sentiment summary
2. Top themes and what they suggest
3. 1-2 notable verbatim quotes
4. Recommended actions for the product team

Keep it concise and business-appropriate.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};