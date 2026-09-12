"use client";

import { FormEvent, useState } from "react";
import { CATEGORY_LABELS, ProblemAnalysis, ProblemCategory } from "../lib/problem-categories";

type Language = "English" | "Hinglish";

type ProblemUnderstandingProps = {
  onUseCategory: (
    category: Exclude<ProblemCategory, "unknown">
  ) => void;

  onCategoryDetected: (
    category: Exclude<ProblemCategory, "unknown">
  ) => void;

  language: Language;
};

type ApiResponse = { result?: ProblemAnalysis; error?: string };

export default function ProblemUnderstanding({
  onUseCategory,
  onCategoryDetected,
  language,
}: ProblemUnderstandingProps) {
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
      setMessage(
  language === "Hinglish"
    ? "Aage badhne se pehle apni problem batayein."
    : "Please describe your problem before continuing."
);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/understand-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        description: trimmed,
        language,
        }),
      });
      const data = await response.json() as ApiResponse;
      if (!response.ok || !data.result) {
        setMessage(
  data.error ??
    (language === "Hinglish"
      ? "Abhi aapki problem samajh nahi paaye. Neeche se koi option choose karein."
      : "We could not understand that right now. Please choose an option below.")
);
        return;
      }
      setResult(data.result);

if (
  !data.result.needs_clarification &&
  data.result.category !== "unknown"
) {
  onCategoryDetected(data.result.category);
}
    } catch {
  setMessage(
    language === "Hinglish"
      ? "Abhi aapki problem samajh nahi paaye. Neeche se koi option choose karein."
      : "We could not understand that right now. Please choose an option below."
  );
} finally {
      setIsLoading(false);
    }
  }

  const canContinue = result && !result.needs_clarification && result.category !== "unknown";
  const matchedTitle =
  language === "Hinglish"
    ? result?.category === "claim_delayed"
      ? "Mera PF claim delayed hai"
      : result?.category === "payment_not_received"
        ? "Mujhe abhi tak payment nahi mili"
        : "Meri details mein correction chahiye"
    : result?.category
      ? CATEGORY_LABELS[result.category]
      : "";

const matchedExplanation =
  language === "Hinglish"
    ? result?.category === "claim_delayed"
      ? "Claim pending hai bohot samay se."
      : result?.category === "payment_not_received"
        ? "Claim settled dikh raha hai, lekin payment abhi tak nahi mili."
        : "Name, bank ya KYC details mein correction ki zarurat hai."
    : result?.explanation ?? "";

  return (
    <section className="problem-understanding" aria-labelledby="describe-problem-title">
      <div className="ai-heading">
  <span className="ai-spark" aria-hidden="true">✦</span>
  <div>
    <p className="ai-label">
      {language === "Hinglish" ? "OPTIONAL SHORTCUT" : "OPTIONAL SHORTCUT"}
    </p>

    <h3 id="describe-problem-title">
      {language === "Hinglish"
        ? "Apni problem batayein"
        : "Describe your problem"}
    </h3>
  </div>
</div>

<p className="ai-copy">
  {language === "Hinglish"
    ? "English ya Hinglish mein apni problem batayein. Hum isse is prototype ke relevant guide se match karenge."
    : "Use a few words in English or Hinglish. We’ll match it to one of the guides in this prototype."}
</p>
      <form onSubmit={understandProblem} noValidate>
        <label className="sr-only" htmlFor="problem-description">Describe your PF problem</label>
        <textarea id="problem-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={
  language === "Hinglish"
    ? "Jaise: Mera PF claim ek mahine se pending hai."
    : "For example: My claim has been pending for more than a month."
} maxLength={1200} disabled={isLoading} />
        <button className="secondary-action" type="submit" disabled={isLoading}>
  {isLoading
    ? language === "Hinglish"
      ? "Aapki problem samajh rahe hain..."
      : "Understanding your problem..."
    : language === "Hinglish"
      ? "Meri problem samjhein"
      : "Understand my problem"}
  <span aria-hidden="true">→</span>
</button>
      </form>
      <p className="ai-disclosure">
  {language === "Hinglish"
    ? "Yeh ekk hackathon prototype hai. AI responses sirf demonstration ke liye hain aur kisi official government system se connected nahi hain. Personal ya sensitive information share na karein."
    : "This is an independent hackathon prototype. AI responses are for demonstration only and are not connected to any official government system. Do not include personal or sensitive information."}
</p>
      {message && <p className="ai-message" role="status">{message}</p>}
      {result?.needs_clarification && (
  <div className="ai-result clarification" role="status">
    <b>
      {language === "Hinglish"
        ? "Ek chhota sa sawaal"
        : "One quick question"}
    </b>

    <p>
      {result.clarifying_question ||
        (language === "Hinglish"
          ? "Kya aapka claim pending hai, payment nahi mili hai, ya kisi detail mein correction chahiye?"
          : "Could you share whether your claim is pending, settled without payment, or needs a detail correction?")}
    </p>
  </div>
)}
      {result &&
  !result.needs_clarification &&
  result.category === "unknown" && (
    <div className="ai-result" role="status">
      <b>
        {language === "Hinglish"
          ? "Abhi is problem ke liye guide available nahi hai."
          : "We do not have a guide for that problem yet."}
      </b>

      <p>
        {result.explanation ||
          (language === "Hinglish"
            ? "Delayed claim, missing payment, ya detail correction ke baare mein batayein."
            : "Try describing a delayed claim, missing payment, or a detail correction.")}
      </p>

      <button
        type="button"
        className="retry-button"
        onClick={() => {
          setResult(null);
          setMessage("");
        }}
      >
        {language === "Hinglish"
          ? "Dobara batane ki kosis karein"
          : "Try describing it again"}
      </button>
    </div>
  )}
      {canContinue && (
  <div className="ai-result matched" role="status">
    <b>
      {language === "Hinglish"
        ? `Humein sabse relevant guide mili: ${matchedTitle}`
        : `We found the closest guide: ${matchedTitle}`}
    </b>

    <p>{matchedExplanation}</p>

    <button
      type="button"
      className="text-button"
      onClick={() => {
        if (result.category !== "unknown") {
          onUseCategory(result.category);
        }
      }}
    >
      {language === "Hinglish"
        ? "Is guide ke saath aage badhein"
        : "Continue with this guide"}{" "}
      <span aria-hidden="true">→</span>
    </button>
  </div>
)}
    </section>
  );
}
