"use client";

import { useState } from "react";
import JourneyModal from "./components/JourneyModal";
import ProblemUnderstanding from "./components/ProblemUnderstanding";
import { CATEGORY_TO_PROBLEM_INDEX, JOURNEY_CONTENT, JourneyContent, ProblemCategory, SupportedProblemCategory } from "./lib/problem-categories";

type Screen = "welcome" | "problem" | "questions" | "plan" | "tracker";
type ModalKind = "help" | "status" | "grievance" | "completion" | null;

const problems = [
  { category: "claim_delayed", icon: "⏳", title: "My PF claim is delayed", text: "I have submitted a claim but it has not moved forward." },
  { category: "payment_not_received", icon: "₹", title: "I have not received my money", text: "My claim shows settled, but the amount is not in my bank." },
  { category: "details_need_correction", icon: "✎", title: "My details need correction", text: "I need help updating my name, bank or KYC details." },
] as const;

function Arrow() { return <span aria-hidden="true" className="arrow">→</span>; }
function Brand() { return <div className="brand"><span className="brand-mark">✦</span><span>PF Sahayak</span><em>prototype</em></div>; }

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selected, setSelected] = useState(0);
  const [firstAnswer, setFirstAnswer] = useState(JOURNEY_CONTENT.claim_delayed.questionOne.options[0]);
  const [secondAnswer, setSecondAnswer] = useState(JOURNEY_CONTENT.claim_delayed.questionTwo.options[2]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [statusComplete, setStatusComplete] = useState(false);
  const [trackerStep, setTrackerStep] = useState(0);
  const [modal, setModal] = useState<ModalKind>(null);

  const go = (next: Screen) => { window.scrollTo({ top: 0, behavior: "smooth" }); setScreen(next); };
  const back = () => {
    const previous: Record<Screen, Screen> = { welcome: "welcome", problem: "welcome", questions: "problem", plan: "questions", tracker: "plan" };
    go(previous[screen]);
  };
  const category = problems[selected].category;
  const journey = JOURNEY_CONTENT[category];
  const completeStatusCheck = () => {
  if (!acknowledged) return;

  if (trackerStep < 2) {
    setTrackerStep((current) => current + 1);
    setAcknowledged(false);
    setModal("completion");
    return;
  }

  setStatusComplete(true);
  setModal("completion");
};
  const selectProblem = (categoryToUse: SupportedProblemCategory) => {
    const nextJourney = JOURNEY_CONTENT[categoryToUse];
    setSelected(CATEGORY_TO_PROBLEM_INDEX[categoryToUse]);
    setFirstAnswer(nextJourney.questionOne.options[0]);
    setSecondAnswer(nextJourney.questionTwo.options[nextJourney.questionTwo.options.length - 1]);
    setAcknowledged(false);
    setStatusComplete(false);
    setTrackerStep(0);
  };
  const useAiCategory = (categoryToUse: Exclude<ProblemCategory, "unknown">) => {
    selectProblem(categoryToUse);
    go("questions");
  };

  return (
    <main className="shell">
      <section className="phone" aria-live="polite">
        {screen !== "welcome" && <header className="topbar"><button className="icon-button" onClick={back} aria-label="Go back">←</button><Brand /><button className="help" onClick={() => setModal("help")} aria-label="About this prototype">?</button></header>}

        {screen === "welcome" && <Welcome onStart={() => go("problem")} />}
        {screen === "problem" && <ProblemScreen selected={selected} onSelect={(index) => selectProblem(problems[index].category)} onContinue={() => go("questions")} onUseAiCategory={useAiCategory} />}
        {screen === "questions" && <QuestionScreen journey={journey} firstAnswer={firstAnswer} secondAnswer={secondAnswer} onFirstAnswer={setFirstAnswer} onSecondAnswer={setSecondAnswer} onContinue={() => go("plan")} />}
        {screen === "plan" && <PlanScreen category={category} journey={journey} firstAnswer={firstAnswer} secondAnswer={secondAnswer} onStatusGuide={() => setModal("status")} onGrievanceGuide={() => setModal("grievance")} onContinue={() => go("tracker")} />}
        {screen === "tracker" && <TrackerScreen category={category} journey={journey} acknowledged={acknowledged} complete={statusComplete} trackerStep={trackerStep} onAcknowledge={setAcknowledged} onComplete={completeStatusCheck} onOpenGuide={(kind) => setModal(kind)} />}
      </section>
      <ModalContent kind={modal} category={category} journey={journey} bankDetailsContext={secondAnswer} onClose={() => setModal(null)} />
    </main>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return <div className="welcome screen"><div className="welcome-top"><Brand /><span className="language">English⌄</span></div><div className="hero-art" aria-hidden="true"><div className="sun" /><div className="leaf leaf-one" /><div className="leaf leaf-two" /><div className="paper"><span /><span /><span /></div><div className="person"><div className="head" /><div className="body" /></div></div><div className="welcome-copy"><p className="eyebrow">A calm guide for your next step</p><h1>PF help,<br /><i>made simple.</i></h1><p className="lede">Tell us what is worrying you. We’ll help you understand what to do next.</p></div><button className="primary" onClick={onStart}>Get started <Arrow /></button><p className="privacy">No login. No personal details needed.</p><Disclaimer /></div>;
}

function ProblemScreen({ selected, onSelect, onContinue, onUseAiCategory }: { selected: number; onSelect: (index: number) => void; onContinue: () => void; onUseAiCategory: (category: Exclude<ProblemCategory, "unknown">) => void }) {
  return <div className="screen content-screen problem-screen"><Progress current={1} /><p className="eyebrow">Let’s start here</p><h2>What do you need help with?</h2><p className="muted">Choose an option, or describe it in your own words.</p><ProblemUnderstanding onUseCategory={onUseAiCategory} /><div className="choice-divider"><span>or choose an option</span></div><div className="choice-list">{problems.map((problem, index) => <button key={problem.title} onClick={() => onSelect(index)} className={`choice ${selected === index ? "chosen" : ""}`} aria-pressed={selected === index}><span className="choice-icon">{problem.icon}</span><span><b>{problem.title}</b><small>{problem.text}</small></span><span className="radio">{selected === index && "✓"}</span></button>)}</div><button className="primary fixed-bottom" onClick={onContinue}>Continue <Arrow /></button></div>;
}

function QuestionScreen({ journey, firstAnswer, secondAnswer, onFirstAnswer, onSecondAnswer, onContinue }: { journey: JourneyContent; firstAnswer: string; secondAnswer: string; onFirstAnswer: (value: string) => void; onSecondAnswer: (value: string) => void; onContinue: () => void }) {
  return <div className="screen content-screen"><Progress current={2} /><p className="eyebrow">A few quick questions</p><h2>Help us narrow it down.</h2><p className="muted">Your answers stay on this device and are only used to tailor this guide.</p><OptionGroup label={journey.questionOne.label} items={journey.questionOne.options} value={firstAnswer} onChange={onFirstAnswer} /><OptionGroup label={journey.questionTwo.label} items={journey.questionTwo.options} value={secondAnswer} onChange={onSecondAnswer} /><div className="tip"><span>💡</span><p>{journey.tip}</p></div><button className="primary fixed-bottom" onClick={onContinue}>See my action plan <Arrow /></button></div>;
}

function PlanScreen({ category, journey, firstAnswer, secondAnswer, onStatusGuide, onGrievanceGuide, onContinue }: { category: SupportedProblemCategory; journey: JourneyContent; firstAnswer: string; secondAnswer: string; onStatusGuide: () => void; onGrievanceGuide: () => void; onContinue: () => void }) {
  return <div className="screen content-screen plan-screen"><Progress current={3} /><div className="plan-heading"><span className="check-orb">✓</span><p className="eyebrow">Your personalised next steps</p><h2>Here’s a clear way forward.</h2><p className="muted">Based on {firstAnswer.toLowerCase()} and {secondAnswer.toLowerCase()} for {category.replaceAll("_", " ")}.</p></div><Action number="1" tag="Do this first" urgent title={journey.firstAction.title} text={journey.firstAction.text} button={journey.firstAction.button} onClick={onStatusGuide} /><Action number="2" tag="If needed next" title={journey.secondAction.title} text={journey.secondAction.text} button={journey.secondAction.button} onClick={onGrievanceGuide} /><div className="reassure"><span>♡</span><p>You do not need to pay anyone to understand your next step or prepare a follow-up.</p></div><button className="primary fixed-bottom" onClick={onContinue}>Start my resolution tracker <Arrow /></button></div>;
}

function TrackerScreen({
  category,
  journey,
  acknowledged,
  complete,
  trackerStep,
  onAcknowledge,
  onComplete,
  onOpenGuide,
}: {
  category: SupportedProblemCategory;
  journey: JourneyContent;
  acknowledged: boolean;
  complete: boolean;
  trackerStep: number;
  onAcknowledge: (value: boolean) => void;
  onComplete: () => void;
  onOpenGuide: (kind: "status" | "grievance") => void;
}) {
  const steps = [
    {
      title: journey.trackerStep,
      note: "Do this first",
    },
    {
      title: journey.nextStep,
      note: journey.nextStepNote,
    },
    {
      title: "Follow up",
      note:
        category === "details_need_correction"
          ? "Keep your acknowledgement"
          : "Keep your acknowledgement and follow up if needed",
    },
  ];

  const currentStep = complete ? 3 : trackerStep;
  const activeStep = steps[Math.min(trackerStep, steps.length - 1)];

  const guideKind =
    trackerStep === 0
      ? "status"
      : trackerStep === 1
        ? "grievance"
        : null;

  return (
    <div className="screen content-screen tracker-screen">
      <Progress current={4} />

      <p className="eyebrow">Your resolution tracker</p>

      <h2>
        {complete
          ? "You’re all set."
          : trackerStep === 0
            ? "One step at a time."
            : "Good progress."}
      </h2>

      <p className="muted">
        {complete
          ? "You have worked through the main steps of this guide."
          : "Complete each step and keep your acknowledgement for reference."}
      </p>

      {!complete && (
        <>
          <div className="status-card">
            <div>
              <span className="tag pending">Next up</span>
              <h3>{activeStep.title}</h3>
              <p>{activeStep.note}</p>
            </div>

            <span className="calendar">
              {trackerStep === 2 ? "✓" : "◷"}
            </span>
          </div>
        </>
      )}

      {complete && (
        <div className="inline-success" role="status">
          <span>✓</span>
          <p>
            <b>Journey completed</b>
            <br />
            You now have a clear record of the steps to take next.
          </p>
        </div>
      )}

      <div className="timeline">
  {steps.map((step, index) => {
    const isDone = complete || index < trackerStep;
    const isCurrent = !complete && index === trackerStep;

    const showGuide = isCurrent && (index === 0 || index === 1);

    return (
      <div className="tracker-step-row" key={step.title}>
        <div className="tracker-step-content">
          <Timeline
            state={isDone ? "done" : isCurrent ? "current" : ""}
            number={isDone ? "✓" : String(index + 1)}
            title={step.title}
            note={isDone ? "Completed" : step.note}
          />
        </div>

        {showGuide && guideKind && (
          <button
            className="text-button tracker-step-action"
            onClick={() => onOpenGuide(guideKind)}
          >
            {index === 0 ? "How to review" : "See what to write"}{" "}
            <Arrow />
          </button>
        )}
      </div>
    );
  })}
</div>

      {!complete && (
        <label
          className={`acknowledge ${
            acknowledged ? "acknowledged" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => onAcknowledge(event.target.checked)}
          />

          <span>{acknowledged ? "✓" : ""}</span>

          {trackerStep === 0
            ? `I’ve completed: ${journey.trackerStep}`
            : trackerStep === 1
              ? `I’ve prepared: ${journey.nextStep}`
              : "I’ve completed the follow-up step"}
        </label>
      )}

      <button
        className="primary fixed-bottom"
        onClick={onComplete}
        disabled={!acknowledged || complete}
      >
        {complete
          ? "Journey complete"
          : trackerStep === 0
            ? "Mark step complete"
            : trackerStep === 1
              ? "Mark step complete"
              : "Finish journey"}{" "}
        <Arrow />
      </button>

      <Disclaimer />
    </div>
  );
}

function Progress({ current }: { current: number }) { return <div className="stepper" aria-label={`Step ${current} of 4`}>{[1, 2, 3, 4].map((step) => <span className={step <= current ? "active" : ""} key={step} />)}</div>; }
function OptionGroup({ label, items, value, onChange }: { label: string; items: string[]; value: string; onChange: (value: string) => void }) { return <div className="question"><label>{label}</label><div className="pills">{items.map((item) => <button key={item} onClick={() => onChange(item)} className={value === item ? "pill selected" : "pill"} aria-pressed={value === item}>{item}</button>)}</div></div>; }
function Action({ number, tag, urgent, title, text, button, onClick }: { number: string; tag: string; urgent?: boolean; title: string; text: string; button: string; onClick: () => void }) { return <div className="action-card"><div className="number">{number}</div><div><span className={`tag ${urgent ? "urgent" : ""}`}>{tag}</span><h3>{title}</h3><p>{text}</p><button className="text-button" onClick={onClick}>{button} <Arrow /></button></div></div>; }
function Timeline({ state = "", number, title, note }: { state?: string; number: string; title: string; note: string }) { return <div className={`timeline-item ${state}`}><span>{number}</span><div><b>{title}</b><small>{note}</small></div></div>; }
function Disclaimer() { return <p className="disclaimer">PF Sahayak is an independent hackathon prototype. It is not affiliated with, endorsed by, or an official service of EPFO. No live services are connected.</p>; }

function ModalContent({ kind, category, journey, bankDetailsContext, onClose }: { kind: ModalKind; category: SupportedProblemCategory; journey: JourneyContent; bankDetailsContext: string; onClose: () => void }) {
  if (!kind) return null;
  if (kind === "help") return <JourneyModal title="About this prototype" onClose={onClose}><p>This is an independent hackathon prototype that uses sample information only.</p><p>It does not connect to EPFO, any government portal, or any live service. Do not enter personal information here.</p></JourneyModal>;
  if (kind === "status") return <JourneyModal title={`How to ${journey.firstAction.title.toLowerCase()}`} onClose={onClose}><p className="modal-intro">Use this as a simple demo checklist. PF Sahayak does not open or connect to any real portal.</p><ol className="guide-list"><li>Visit the official member service you normally use, directly in your own browser.</li><li>Sign in only on the official site using your own details.</li><li>{category === "details_need_correction" ? "Review the name, bank, or KYC detail that needs attention." : "Find your submitted claim and note the status shown."}</li><li>Save the acknowledgement or a screenshot for your records. Do not share it in this prototype.</li></ol><div className="modal-note"><b>What to look for</b><br />{category === "details_need_correction" ? "Note which detail needs correction so you can explain it clearly in the next step." : "Note whether the claim is under process, needs attention, or is settled. This helps you decide the next step."}</div></JourneyModal>;
  if (kind === "grievance") return <JourneyModal title="Example: what to write" onClose={onClose}><p className="modal-intro">Adapt this template on the official channel you choose. The examples below use mock information only.</p><div className="template">{category === "details_need_correction" ? <CorrectionTemplate context={bankDetailsContext} /> : <><p><b>Subject:</b> Follow-up on {category === "payment_not_received" ? "settled claim payment" : "pending PF claim"}</p><p>Hello,<br />I submitted my PF claim on [date]. My sample claim reference is <b>DEMO-2026-0042</b>. The claim currently shows as [status].</p><p>Please let me know if any action or document is needed from me. I have kept my acknowledgement for reference.</p></>}<p>Thank you,<br />[Your name]</p></div><div className="modal-note"><b>Include only what is needed</b><br />{category === "details_need_correction" ? "Describe the member/KYC detail, claim context, or bank account/IFSC detail you identified. Never add OTPs, passwords, payment details, or identity numbers." : "Use your claim reference, submission date, and the status you saw. Never add OTPs, passwords, payment details, or identity numbers."}</div></JourneyModal>;
  return <JourneyModal title="Tracker updated" onClose={onClose}><div className="completion-message"><span>✓</span><p><b>Nice work — you completed: {journey.trackerStep.toLowerCase()}.</b><br />Your tracker now points to the next step: {journey.nextStep.toLowerCase()}.</p></div></JourneyModal>;
}

function CorrectionTemplate({ context }: { context: string }) {
  if (context === "A PF claim or settlement") return <><p><b>Subject:</b> Request to review bank details for a PF claim</p><p>Hello,<br />I noticed an issue with my bank details while reviewing a PF claim or settlement. My sample claim reference is <b>DEMO-2026-0042</b>.</p><p>Please let me know if any action is needed to review the bank detail connected to this claim.</p></>;
  if (context === "My EPFO/UAN profile") return <><p><b>Subject:</b> Request to review bank KYC/member detail</p><p>Hello,<br />I noticed that the bank detail in my member/KYC profile may need correction.</p><p>Please let me know how I can review the relevant member or KYC detail. I have not included any sensitive information here.</p></>;
  if (context === "My bank account") return <><p><b>Subject:</b> Request to correct bank account or IFSC detail</p><p>Hello,<br />I need to review the bank account or IFSC detail connected to my PF records.</p><p>Please let me know how I can correct the relevant bank detail. I have not included any sensitive information here.</p></>;
  return <><p><b>Subject:</b> Help identifying a bank-detail correction</p><p>Hello,<br />I am not sure where the incorrect bank detail appears.</p><p>I will first check whether it is in my member/KYC profile or relates to a PF claim or settlement, then provide the relevant context.</p></>;
}
