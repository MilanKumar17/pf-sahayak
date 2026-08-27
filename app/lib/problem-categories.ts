export const PROBLEM_CATEGORIES = [
  "claim_delayed",
  "payment_not_received",
  "details_need_correction",
  "unknown",
] as const;

export type ProblemCategory = (typeof PROBLEM_CATEGORIES)[number];
export type ProblemConfidence = "high" | "medium" | "low";

export type ProblemAnalysis = {
  category: ProblemCategory;
  confidence: ProblemConfidence;
  needs_clarification: boolean;
  clarifying_question: string;
  explanation: string;
};

export const CATEGORY_TO_PROBLEM_INDEX: Record<Exclude<ProblemCategory, "unknown">, number> = {
  claim_delayed: 0,
  payment_not_received: 1,
  details_need_correction: 2,
};

export const CATEGORY_LABELS: Record<ProblemCategory, string> = {
  claim_delayed: "My PF claim is delayed",
  payment_not_received: "I have not received my money",
  details_need_correction: "My details need correction",
  unknown: "An issue we do not yet support",
};

export type SupportedProblemCategory = Exclude<ProblemCategory, "unknown">;

export type JourneyContent = {
  questionOne: { label: string; options: string[] };
  questionTwo: { label: string; options: string[] };
  tip: string;
  firstAction: { title: string; text: string; button: string };
  secondAction: { title: string; text: string; button: string };
  trackerStep: string;
  nextStep: string;
  nextStepNote: string;
};

export const JOURNEY_CONTENT: Record<SupportedProblemCategory, JourneyContent> = {
  claim_delayed: {
    questionOne: { label: "What kind of claim did you submit?", options: ["Final settlement", "Partial withdrawal", "Pension claim"] },
    questionTwo: { label: "When did you submit the claim?", options: ["Less than 10 days ago", "10–20 days ago", "More than 20 days ago"] },
    tip: "Most claims are processed in about 20 days. A delay does not always mean there is a problem.",
    firstAction: { title: "Check your claim status", text: "Use the member service you normally use to see whether it is under process, needs attention, or has been settled.", button: "How to check" },
    secondAction: { title: "Raise a grievance", text: "If it is still pending, include your claim reference and submission date in a follow-up.", button: "See what to write" },
    trackerStep: "Check claim status",
    nextStep: "Raise a grievance if needed",
    nextStepNote: "Only if the claim is still pending",
  },
  payment_not_received: {
    questionOne: { label: "What does your claim currently show?", options: ["Settled", "Processed", "I’m not sure"] },
    questionTwo: { label: "When did you expect the payment?", options: ["Less than 10 days ago", "10–20 days ago", "More than 20 days ago"] },
    tip: "A claim status and a payment reaching your bank can be separate steps. Save the status you see for your records.",
    firstAction: { title: "Review the settlement status", text: "Use the member service you normally use to note the status shown and keep the acknowledgement.", button: "How to review" },
    secondAction: { title: "Prepare a follow-up", text: "If it shows settled and money has not arrived, include the status and claim reference in your follow-up.", button: "See what to write" },
    trackerStep: "Review settlement status",
    nextStep: "Prepare a payment follow-up",
    nextStepNote: "If money has not arrived",
  },
  details_need_correction: {
    questionOne: { label: "Which detail needs correction?", options: ["Name", "Bank details", "KYC detail"] },
    questionTwo: { label: "Where did you notice the incorrect bank details?", options: ["My EPFO/UAN profile", "A PF claim or settlement", "My bank account", "I’m not sure"] },
    tip: "Review the detail you want to correct before taking the next step. Do not enter any personal information in this prototype.",
    firstAction: { title: "Review the detail to correct", text: "Use the member service you normally use to identify the detail that needs attention.", button: "How to review" },
    secondAction: { title: "Prepare a correction request", text: "Note the detail that needs correction and keep any acknowledgement for your records.", button: "See what to write" },
    trackerStep: "Review the detail to correct",
    nextStep: "Prepare a correction request",
    nextStepNote: "After reviewing the detail",
  },
};
