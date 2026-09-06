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
    questionTwo: { label: "Where did you notice the incorrect detail?", options: ["My EPFO/UAN profile", "A PF claim or settlement", "My bank account", "I’m not sure"] },
    tip: "Review the detail you want to correct before taking the next step. Do not enter any personal information in this prototype.",
    firstAction: { title: "Review the detail to correct", text: "Use the member service you normally use to identify the detail that needs attention.", button: "How to review" },
    secondAction: { title: "Prepare a correction request", text: "Note the detail that needs correction and keep any acknowledgement for your records.", button: "See what to write" },
    trackerStep: "Review the detail to correct",
    nextStep: "Prepare a correction request",
    nextStepNote: "After reviewing the detail",
  },
};
export const HINGLISH_JOURNEY_CONTENT: Record<
  SupportedProblemCategory,
  JourneyContent
> = {
  claim_delayed: {
    questionOne: {
      label: "Aapne kis type ka claim submit kiya hai?",
      options: [
        "Final settlement",
        "Partial withdrawal",
        "Pension claim",
      ],
    },
    questionTwo: {
      label: "Aapne claim kab submit kiya tha?",
      options: [
        "10 din se kam pehle",
        "10–20 din pehle",
        "20 din se zyada pehle",
      ],
    },
    tip: "Agar claim kaafi time se pending hai, status check karke agla step decide karein.",
    firstAction: {
      title: "Apna claim status check karein",
      text: "Pehle dekhein ki aapka claim abhi kis status mein hai.",
      button: "Kaise check karein",
    },
    secondAction: {
      title: "Zaroorat ho to grievance raise karein",
      text: "Agar claim abhi bhi pending hai, follow-up ke liye grievance prepare karein.",
      button: "Kya likhna hai",
    },
    trackerStep: "Claim status check karein",
    nextStep: "Zaroorat ho to grievance raise karein",
    nextStepNote: "Sirf tab jab claim abhi bhi pending ho",
  },

  payment_not_received: {
    questionOne: {
      label: "Aapke claim ka current status kya dikh raha hai?",
      options: [
        "Settled",
        "Processed",
        "Mujhe sure nahi hai",
      ],
    },
    questionTwo: {
      label: "Aap payment kab tak expect kar rahe the?",
      options: [
        "10 din se kam pehle",
        "10–20 din pehle",
        "20 din se zyada pehle",
      ],
    },
    tip: "Agar claim settled ya processed dikh raha hai lekin payment nahi aayi, pehle settlement status review karein.",
    firstAction: {
      title: "Settlement status review karein",
      text: "Pehle confirm karein ki claim ka settlement status kya dikh raha hai.",
      button: "Kaise review karein",
    },
    secondAction: {
      title: "Payment follow-up ke liye prepare karein",
      text: "Agar payment abhi tak nahi aayi hai, ek simple follow-up prepare karein.",
      button: "Kya likhna hai",
    },
    trackerStep: "Settlement status review karein",
    nextStep: "Payment follow-up prepare karein",
    nextStepNote: "Agar payment abhi tak nahi aayi hai",
  },

  details_need_correction: {
    questionOne: {
      label: "Kaunsi detail mein correction chahiye?",
      options: [
        "Name",
        "Bank details",
        "KYC detail",
      ],
    },
    questionTwo: {
      label: "Aapne yeh incorrect detail kahan notice ki?",
      options: [
        "Mere EPFO/UAN profile mein",
        "PF claim ya settlement mein",
        "Mere bank account mein",
        "Mujhe sure nahi hai",
      ],
    },
    tip: "Pehle identify karein ki kaunsi detail galat hai aur aapne usse kahan notice kiya.",
    firstAction: {
      title: "Correction wali detail review karein",
      text: "Pehle us detail ko review karein jisme correction ki zaroorat hai.",
      button: "Kaise review karein",
    },
    secondAction: {
      title: "Correction request prepare karein",
      text: "Review karne ke baad official channel ke liye correction request prepare karein.",
      button: "Kya likhna hai",
    },
    trackerStep: "Correction wali detail review karein",
    nextStep: "Correction request prepare karein",
    nextStepNote: "Detail review karne ke baad",
  },
};
