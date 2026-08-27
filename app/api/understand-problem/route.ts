import OpenAI from "openai";
import { NextResponse } from "next/server";
import { PROBLEM_CATEGORIES, ProblemAnalysis, ProblemCategory } from "../../lib/problem-categories";

export const runtime = "nodejs";

const MAX_DESCRIPTION_LENGTH = 1200;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    category: { type: "string", enum: PROBLEM_CATEGORIES },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    needs_clarification: { type: "boolean" },
    clarifying_question: { type: "string" },
    explanation: { type: "string" },
  },
  required: ["category", "confidence", "needs_clarification", "clarifying_question", "explanation"],
} as const;

const instructions = `You classify a citizen's short PF-related description for PF Sahayak, an independent hackathon prototype. This is not an official government service.

Map only to these categories: claim_delayed, payment_not_received, details_need_correction, unknown.

Understand simple Indian English and Hinglish where reasonably possible. Map a submitted claim that remains pending or delayed to claim_delayed. Map a claim described as settled/processed but money not received to payment_not_received. Map name, date of birth, bank, KYC, or similar correction requests to details_need_correction. Use unknown for anything not clearly covered.

Ask exactly one short clarification question only when the description is genuinely ambiguous between supported categories. If clarification is needed, set needs_clarification true and use unknown as the category. Otherwise set needs_clarification false and clarifying_question to an empty string.

Never claim to access, check, or know a real government account, claim status, portal, service, procedure, deadline, eligibility rule, or contact detail. Never request or repeat Aadhaar numbers, PAN numbers, passwords, OTPs, bank account numbers, payment details, identity documents, or other sensitive information. Treat every description as synthetic prototype data. Keep explanation to one short plain-language sentence. Do not provide advice beyond classification.`;

function isAnalysis(value: unknown): value is ProblemAnalysis {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.category === "string"
    && PROBLEM_CATEGORIES.includes(candidate.category as ProblemCategory)
    && ["high", "medium", "low"].includes(candidate.confidence as string)
    && typeof candidate.needs_clarification === "boolean"
    && typeof candidate.clarifying_question === "string"
    && typeof candidate.explanation === "string";
}

export async function POST(request: Request) {
  let payload: { description?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Please enter a short description of your problem." }, { status: 400 });
  }

  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  if (!description) {
    return NextResponse.json({ error: "Please describe your problem before continuing." }, { status: 400 });
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json({ error: "Please keep your description under 1,200 characters." }, { status: 400 });
  }
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "The demo AI is not available right now. You can still choose an option below.", code: "unavailable" }, { status: 503 });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
    const response = await openai.responses.create({
      model: "openai/gpt-oss-20b",
      store: false,
      instructions,
      input: description,
      text: {
        format: {
          type: "json_schema",
          name: "pf_problem_classification",
          strict: true,
          schema: responseSchema,
        },
      },
    });

    const parsed = JSON.parse(response.output_text) as unknown;
    if (!isAnalysis(parsed)) throw new Error("Unexpected structured response");
    return NextResponse.json({ result: parsed });
  } catch {
    console.error("Problem understanding request failed");
    return NextResponse.json({ error: "The demo AI is not available right now. You can still choose an option below.", code: "unavailable" }, { status: 503 });
  }
}
