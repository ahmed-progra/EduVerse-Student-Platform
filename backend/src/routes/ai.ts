import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const MENTOR_SYSTEM = `You are EduVerse AI Mentor, a friendly programming tutor. 
Guide users with Socratic questioning — help them discover answers rather than giving them directly.
Keep responses concise (3-5 sentences). Use code examples when helpful. Focus on Python basics.`;

const REVIEW_SYSTEM = `You are a code reviewer. Analyze the provided code and give:
1. A score out of 10
2. 2-3 specific issues or improvements
3. One positive observation
Be concise and constructive. Use bullet points.`;

const HINTS_SYSTEM = `You are a progressive hint system. The user has a programming challenge.
Generate hints at 3 levels of specificity:
1. A subtle nudge about approach or data structures
2. More direct guidance about the algorithm
3. A concrete suggestion approaching pseudo-code
Return all 3 hints separated by "|||". Keep each hint under 2 sentences.`;

const CHALLENGE_SYSTEM = `You are a programming challenge generator for EduVerse.
Generate a coding challenge based on the given topic and difficulty.
Return a JSON object with: title, description, example, difficulty, topics.
Keep description under 100 words. Example must show input/output.`;

function buildPrompt(type: string, data: any): string {
  switch (type) {
    case "mentor":
      return `The user asks: "${data.message}"\n\nRespond as a helpful tutor.`;
    case "review":
      return `Review this ${data.language} code:\n\`\`\`${data.language}\n${data.code}\n\`\`\``;
    case "hints":
      return `The user is working on this challenge: "${data.challenge}"\n\nGenerate 3 progressive hints.`;
    case "challenge":
      return `Generate a ${data.difficulty} difficulty programming challenge about ${data.topic}. Return as JSON.`;
    default:
      return "";
  }
}

export async function callClaude(system: string, prompt: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.length < 20 || key.includes("placeholder") || key === "sk-ant-api03-...") {
    return "The AI service is not configured. Please set a valid ANTHROPIC_API_KEY.";
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }
    return "No response from AI.";
  } catch (err: any) {
    console.error("Claude API error:", err.message);
    if (err.status === 401) {
      return "AI service authentication failed. Please check the ANTHROPIC_API_KEY in your .env file.";
    }
    if (err.status === 529) {
      return "AI service is temporarily overloaded. Please try again.";
    }
    return `AI service error: ${err.message}. Please ensure a valid ANTHROPIC_API_KEY is set.`;
  }
}

router.post("/mentor", requireAuth, async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ success: false, error: "Message is required" });
      return;
    }

    const prompt = buildPrompt("mentor", { message });
    const text = await callClaude(MENTOR_SYSTEM, prompt);

    res.json({
      success: true,
      data: { text },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/review", requireAuth, async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      res.status(400).json({ success: false, error: "Code is required" });
      return;
    }

    const prompt = buildPrompt("review", { code, language: language || "python" });
    const text = await callClaude(REVIEW_SYSTEM, prompt);

    res.json({
      success: true,
      data: { text },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/hints", requireAuth, async (req: Request, res: Response) => {
  try {
    const { challenge } = req.body;
    const prompt = buildPrompt("hints", { challenge: challenge || "two sum problem" });
    const text = await callClaude(HINTS_SYSTEM, prompt);

    res.json({
      success: true,
      data: { text },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/challenge", requireAuth, async (req: Request, res: Response) => {
  try {
    const { topic, difficulty } = req.body;
    const prompt = buildPrompt("challenge", { topic: topic || "python", difficulty: difficulty || "medium" });
    const text = await callClaude(CHALLENGE_SYSTEM, prompt);

    let challenge: any;
    try {
      challenge = JSON.parse(text);
    } catch {
      challenge = { title: "Custom Challenge", description: text, difficulty, topics: [topic] };
    }

    res.json({
      success: true,
      data: { challenge },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
