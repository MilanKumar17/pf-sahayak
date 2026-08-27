"use client";

import { FormEvent, useState } from "react";
import { CATEGORY_LABELS, ProblemAnalysis, ProblemCategory } from "../lib/problem-categories";

type ProblemUnderstandingProps = {
  onUseCategory: (category: Exclude<ProblemCategory, "unknown">) => void;
};

type ApiResponse = { result?: ProblemAnalysis; error?: string };

export default function ProblemUnderstanding({ onUseCategory }: ProblemUnderstandingProps) {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<ProblemAnalysis | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function understandProblem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = description.trim();
    setResult(null);
    setMessage("");
    if (!trimmed) {
      setMessage("Please describe your problem before continuing.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/understand-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmed }),
      });
      const data = await response.json() as ApiResponse;
      if (!response.ok || !data.result) {
        setMessage(data.error ?? "We could not understand that right now. Please choose an option below.");
        return;
      }
      setResult(data.result);
    } catch {
      setMessage("We could not understand that right now. Please choose an option below.");
    } finally {
      setIsLoading(false);
    }
  }

  const canContinue = result && !result.needs_clarification && result.category !== "unknown";

  return (
    <section className="problem-understanding" aria-labelledby="describe-problem-title">
      <div className="ai-heading"><span className="ai-spark" aria-hidden="true">✦</span><div><p className="ai-label">Optional shortcut</p><h3 id="describe-problem-title">Describe your problem</h3></div></div>
      <p className="ai-copy">Use a few words in English or Hinglish. We’ll match it to one of the guides in this prototype.</p>
      <form onSubmit={understandProblem} noValidate>
        <label className="sr-only" htmlFor="problem-description">Describe your PF problem</label>
        <textarea id="problem-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="For example: My claim has been pending for more than a month." maxLength={1200} disabled={isLoading} />
        <button className="secondary-action" type="submit" disabled={isLoading}>{isLoading ? "Understanding your problem..." : "Understand my problem"}<span aria-hidden="true">→</span></button>
      </form>
      <p className="ai-disclosure">This is an independent hackathon prototype. AI responses are for demonstration only and are not connected to any official government system. Do not include personal or sensitive information.</p>
      {message && <p className="ai-message" role="status">{message}</p>}
      {result?.needs_clarification && <div className="ai-result clarification" role="status"><b>One quick question</b><p>{result.clarifying_question || "Could you share whether your claim is pending, settled without payment, or needs a detail correction?"}</p></div>}
      {result && !result.needs_clarification && result.category === "unknown" && <div className="ai-result" role="status"><b>We do not have a guide for that yet.</b><p>{result.explanation || "Try describing a delayed claim, missing payment, or a detail correction."}</p><button type="button" className="retry-button" onClick={() => { setResult(null); setMessage(""); }}>Try describing it again</button></div>}
      {canContinue && <div className="ai-result matched" role="status"><b>We found the closest guide: {CATEGORY_LABELS[result.category]}</b><p>{result.explanation}</p><button type="button" className="text-button" onClick={() => { if (result.category !== "unknown") onUseCategory(result.category); }}>Continue with this guide <span aria-hidden="true">→</span></button></div>}
    </section>
  );
}
