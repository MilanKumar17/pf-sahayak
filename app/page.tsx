"use client";

import { useState } from "react";
import JourneyModal from "./components/JourneyModal";
import ProblemUnderstanding from "./components/ProblemUnderstanding";
import { CATEGORY_TO_PROBLEM_INDEX, JOURNEY_CONTENT, HINGLISH_JOURNEY_CONTENT, JourneyContent, ProblemCategory, SupportedProblemCategory } from "./lib/problem-categories";

type Screen = "welcome" | "problem" | "questions" | "plan" | "tracker";
type ModalKind = "help" | "status" | "grievance" | "completion" | null;
type Language = "English" | "Hinglish";
type CompletionState = {
  completedStep: string;
  nextStep: string | null;
};

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
  const [language, setLanguage] = useState<Language>("English");
  const [firstAnswer, setFirstAnswer] = useState(JOURNEY_CONTENT.claim_delayed.questionOne.options[0]);
  const [secondAnswer, setSecondAnswer] = useState(JOURNEY_CONTENT.claim_delayed.questionTwo.options[2]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [statusComplete, setStatusComplete] = useState(false);
  const [trackerStep, setTrackerStep] = useState(0);
  const [modal, setModal] = useState<ModalKind>(null);
  const [completion, setCompletion] = useState<CompletionState | null>(null);

  const go = (next: Screen) => { window.scrollTo({ top: 0, behavior: "smooth" }); setScreen(next); };
  const back = () => {
    const previous: Record<Screen, Screen> = { welcome: "welcome", problem: "welcome", questions: "problem", plan: "questions", tracker: "plan" };
    go(previous[screen]);
  };
  const category = problems[selected].category;

const journey =
  language === "Hinglish"
    ? HINGLISH_JOURNEY_CONTENT[category]
    : JOURNEY_CONTENT[category];
  const completeStatusCheck = () => {
  if (!acknowledged) return;

  const completedStep =
    trackerStep === 0
      ? journey.trackerStep
      : trackerStep === 1
        ? journey.nextStep
        : "Follow up";

  const nextStep =
    trackerStep === 0
      ? journey.nextStep
      : trackerStep === 1
        ? "Follow up"
        : null;

  setCompletion({
    completedStep,
    nextStep,
  });

  setAcknowledged(false);

  if (trackerStep < 2) {
    setTrackerStep((current) => current + 1);
  } else {
    setStatusComplete(true);
  }

  setModal("completion");
};
  const selectProblem = (categoryToUse: SupportedProblemCategory) => {
  const nextJourney =
    language === "Hinglish"
      ? HINGLISH_JOURNEY_CONTENT[categoryToUse]
      : JOURNEY_CONTENT[categoryToUse];

  setSelected(CATEGORY_TO_PROBLEM_INDEX[categoryToUse]);
  setFirstAnswer(nextJourney.questionOne.options[0]);
  setSecondAnswer(
    nextJourney.questionTwo.options[
      nextJourney.questionTwo.options.length - 1
    ]
  );
  setAcknowledged(false);
  setStatusComplete(false);
  setTrackerStep(0);
  setCompletion(null);
};
  const useAiCategory = (categoryToUse: Exclude<ProblemCategory, "unknown">) => {
    selectProblem(categoryToUse);
    go("questions");
  };

  return (
    <main className="shell">
      <section className="phone" aria-live="polite">
        {screen !== "welcome" && <header className="topbar"><button className="icon-button" onClick={back} aria-label="Go back">←</button><Brand /><button className="help" onClick={() => setModal("help")} aria-label="About this prototype">?</button></header>}

        {screen === "welcome" && (
  <Welcome
    onStart={() => go("problem")}
    language={language}
    onLanguageChange={setLanguage}
  />
)}
        {screen === "problem" && (
  <ProblemScreen
    selected={selected}
    onSelect={(index) => selectProblem(problems[index].category)}
    onContinue={() => go("questions")}
    onUseAiCategory={useAiCategory}
    onAiCategoryDetected={selectProblem}
    language={language}
  />
)}
        {screen === "questions" && (
  <QuestionScreen
    journey={journey}
    firstAnswer={firstAnswer}
    secondAnswer={secondAnswer}
    onFirstAnswer={setFirstAnswer}
    onSecondAnswer={setSecondAnswer}
    onContinue={() => go("plan")}
    language={language}
  />
)}
        {screen === "plan" && (
  <PlanScreen
    category={category}
    journey={journey}
    firstAnswer={firstAnswer}
    secondAnswer={secondAnswer}
    onStatusGuide={() => setModal("status")}
    onGrievanceGuide={() => setModal("grievance")}
    onContinue={() => go("tracker")}
    language={language}
  />
)}
        {screen === "tracker" && (
  <TrackerScreen
    category={category}
    journey={journey}
    acknowledged={acknowledged}
    complete={statusComplete}
    trackerStep={trackerStep}
    onAcknowledge={setAcknowledged}
    onComplete={completeStatusCheck}
    onOpenGuide={(kind) => setModal(kind)}
    language={language}
  />
)}
      </section>
      <ModalContent
      kind={modal}
      category={category}
      journey={journey}
      detailToCorrect={firstAnswer}
      bankDetailsContext={secondAnswer}
      completion={completion}
      language={language}
      onClose={() => setModal(null)}/>
    </main>
  );
}

function Welcome({
  onStart,
  language,
  onLanguageChange,
}: {
  onStart: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const [languageOpen, setLanguageOpen] = useState(false);

  return (
    <div className="welcome screen">
      <div className="welcome-top">
        <Brand />

        <div className="language-selector">
          <button
            type="button"
            className="language"
            onClick={() => setLanguageOpen((open) => !open)}
            aria-expanded={languageOpen}
            aria-haspopup="listbox"
          >
            {language}⌄
          </button>

          {languageOpen && (
            <div className="language-menu" role="listbox">
              {(["English", "Hinglish"] as Language[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={language === option ? "selected" : ""}
                  onClick={() => {
                    onLanguageChange(option);
                    setLanguageOpen(false);
                  }}
                >
                  <span>{option}</span>
                  {language === option && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="hero-art" aria-hidden="true">
        <div className="sun" />
        <div className="leaf leaf-one" />
        <div className="leaf leaf-two" />
        <div className="paper">
          <span />
          <span />
          <span />
        </div>
        <div className="person">
          <div className="head" />
          <div className="body" />
        </div>
      </div>

      <div className="welcome-copy">
  <p className="eyebrow">
    {language === "Hinglish"
      ? "Aapke agle step ke liye ek simple guide"
      : "A calm guide for your next step"}
  </p>

  <h1>
    {language === "Hinglish" ? (
      <>
        PF ki help,
        <br />
        <i>ab simple.</i>
      </>
    ) : (
      <>
        PF help,
        <br />
        <i>made simple.</i>
      </>
    )}
  </h1>

  <p className="lede">
    {language === "Hinglish"
      ? "Apni problem batayein. Hum aapko samjhayenge ki next kya karna hai."
      : "Tell us what is worrying you. We’ll help you understand what to do next."}
  </p>
</div>

<button className="primary" onClick={onStart}>
  {language === "Hinglish" ? "Shuru karein" : "Get started"} <Arrow />
</button>

<p className="privacy">
  {language === "Hinglish"
    ? "Login ki zaroorat nahi. Koi personal details nahi chahiye."
    : "No login. No personal details needed."}
</p>

      <Disclaimer language={language} />
    </div>
  );
}

function ProblemScreen({
  selected,
  onSelect,
  onContinue,
  onUseAiCategory,
  onAiCategoryDetected,
  language,
}: {
  selected: number;
  onSelect: (index: number) => void;
  onContinue: () => void;
  onUseAiCategory: (
    category: Exclude<ProblemCategory, "unknown">
  ) => void;
  onAiCategoryDetected: (
    category: Exclude<ProblemCategory, "unknown">
  ) => void;
  language: Language;
}) {
  return (
    <div className="screen content-screen problem-screen">
      <Progress current={1} />

     <p className="eyebrow">
  {language === "Hinglish" ? "YAHAN SE SHURU KAREIN" : "LET’S START HERE"}
</p>

<h2>
  {language === "Hinglish"
    ? "Aapko kis cheez mein help chahiye?"
    : "What do you need help with?"}
</h2>

<p className="muted">
  {language === "Hinglish"
    ? "Koi option choose karein, ya apni problem apne words mein batayein."
    : "Choose an option, or describe it in your own words."}
</p>

      <ProblemUnderstanding
      onUseCategory={onUseAiCategory}
      onCategoryDetected={onAiCategoryDetected}
      language={language}
      />

      <div className="choice-divider">
        <span>
  {language === "Hinglish"
    ? "ya koi option choose karein"
    : "or choose an option"}
</span>
      </div>

      <div className="choice-list">
        {problems.map((problem, index) => (
          <button
            key={problem.title}
            onClick={() => onSelect(index)}
            className={`choice ${
              selected === index ? "chosen" : ""
            }`}
            aria-pressed={selected === index}
          >
            <span className="choice-icon">
              {problem.icon}
            </span>

            <span>
              <b>
  {language === "Hinglish"
    ? index === 0
      ? "Mera PF claim delayed hai"
      : index === 1
        ? "Mujhe abhi tak payment nahi mili"
        : "Meri details mein correction chahiye"
    : problem.title}
</b>

<small>
  {language === "Hinglish"
    ? index === 0
      ? "Maine claim submit kiya hai, lekin abhi tak aage nahi badha."
      : index === 1
        ? "Mera claim settled dikh raha hai, lekin payment bank mein nahi aayi."
        : "Mujhe name, bank ya KYC details update karne mein help chahiye."
    : problem.text}
</small>
            </span>

            <span className="radio">
              {selected === index && "✓"}
            </span>
          </button>
        ))}
      </div>

      <button
        className="primary fixed-bottom"
        onClick={onContinue}
      >
        {language === "Hinglish" ? "Aage badhein" : "Continue"} <Arrow />
      </button>
    </div>
  );
}

function QuestionScreen({
  journey,
  firstAnswer,
  secondAnswer,
  onFirstAnswer,
  onSecondAnswer,
  onContinue,
  language,
}: { journey: JourneyContent; firstAnswer: string; secondAnswer: string; onFirstAnswer: (value: string) => void; onSecondAnswer: (value: string) => void; onContinue: () => void; language: Language; }) {
  return (
  <div className="screen content-screen">
    <Progress current={2} />

    <p className="eyebrow">
      {language === "Hinglish"
        ? "KUCH QUICK QUESTIONS"
        : "A FEW QUICK QUESTIONS"}
    </p>

    <h2>
      {language === "Hinglish"
        ? "Thoda aur detail mein batayein."
        : "Help us narrow it down."}
    </h2>

    <p className="muted">
      {language === "Hinglish"
        ? "Aapke answers sirf isi device par rahenge aur is guide ko aapke liye relevant banane ke liye use honge."
        : "Your answers stay on this device and are only used to tailor this guide."}
    </p>

    <OptionGroup
      label={journey.questionOne.label}
      items={journey.questionOne.options}
      value={firstAnswer}
      onChange={onFirstAnswer}
    />

    <OptionGroup
      label={journey.questionTwo.label}
      items={journey.questionTwo.options}
      value={secondAnswer}
      onChange={onSecondAnswer}
    />

    <div className="tip">
      <span>💡</span>
      <p>{journey.tip}</p>
    </div>

    <button className="primary fixed-bottom" onClick={onContinue}>
      {language === "Hinglish"
        ? "Mera action plan dekhein"
        : "See my action plan"}{" "}
      <Arrow />
    </button>
  </div>
);
}

function PlanScreen({
  category,
  journey,
  firstAnswer,
  secondAnswer,
  onStatusGuide,
  onGrievanceGuide,
  onContinue,
  language,
}: {
  category: SupportedProblemCategory;
  journey: JourneyContent;
  firstAnswer: string;
  secondAnswer: string;
  onStatusGuide: () => void;
  onGrievanceGuide: () => void;
  onContinue: () => void;
  language: Language;
}) {
  return (
    <div className="screen content-screen plan-screen">
      <Progress current={3} />

      <div className="plan-heading">
        <span className="check-orb">✓</span>

        <p className="eyebrow">
          {language === "Hinglish"
            ? "AAPKE PERSONALISED AGLE STEPS"
            : "Your personalised next steps"}
        </p>

        <h2>
          {language === "Hinglish"
            ? "Yeh raha aage badhne ka simple tareeka."
            : "Here’s a clear way forward."}
        </h2>

        <p className="muted">
          {language === "Hinglish"
            ? `Aapke ${firstAnswer.toLowerCase()} aur ${secondAnswer.toLowerCase()} ke basis par, yeh guide aapke liye next steps batati hai.`
            : `Based on ${firstAnswer.toLowerCase()} and ${secondAnswer.toLowerCase()} for ${category.replaceAll("_", " ")}.`}
        </p>
      </div>

      <Action
        number="1"
        tag={language === "Hinglish" ? "SABSE PEHLE YE KAREIN" : "Do this first"}
        urgent
        title={journey.firstAction.title}
        text={journey.firstAction.text}
        button={journey.firstAction.button}
        onClick={onStatusGuide}
      />

      <Action
        number="2"
        tag={language === "Hinglish" ? "USKE BAAD, ZAROORAT HO TO" : "If needed next"}
        title={journey.secondAction.title}
        text={journey.secondAction.text}
        button={journey.secondAction.button}
        onClick={onGrievanceGuide}
      />

      <div className="reassure">
        <span>♡</span>
        <p>
          {language === "Hinglish"
            ? "Apna next step samajhne ya follow-up prepare karne ke liye aapko kisi ko paise dene ki zaroorat nahi hai."
            : "You do not need to pay anyone to understand your next step or prepare a follow-up."}
        </p>
      </div>

      <button className="primary fixed-bottom" onClick={onContinue}>
        {language === "Hinglish"
          ? "Mera resolution tracker shuru karein"
          : "Start my resolution tracker"}{" "}
        <Arrow />
      </button>
    </div>
  );
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
  language,
}: {
  category: SupportedProblemCategory;
  journey: JourneyContent;
  acknowledged: boolean;
  complete: boolean;
  trackerStep: number;
  onAcknowledge: (value: boolean) => void;
  onComplete: () => void;
  onOpenGuide: (kind: "status" | "grievance") => void;
  language: Language;
}) {
  const steps = [
    {
      title: journey.trackerStep,
      note:
        language === "Hinglish"
          ? "Sabse pehle ye karein"
          : "Do this first",
    },
    {
      title: journey.nextStep,
      note: journey.nextStepNote,
    },
    {
      title:
        language === "Hinglish"
          ? "Follow-up karein"
          : "Follow up",
      note:
        category === "details_need_correction"
          ? language === "Hinglish"
            ? "Apna acknowledgement sambhal kar rakhein"
            : "Keep your acknowledgement"
          : language === "Hinglish"
            ? "Acknowledgement sambhal kar rakhein aur zaroorat ho to follow-up karein"
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

      <p className="eyebrow">
        {language === "Hinglish"
          ? "AAPKA RESOLUTION TRACKER"
          : "Your resolution tracker"}
      </p>

      <h2>
        {complete
          ? language === "Hinglish"
            ? "Aapka kaam ho gaya."
            : "You’re all set."
          : trackerStep === 0
            ? language === "Hinglish"
              ? "Ek-ek step karke."
              : "One step at a time."
            : language === "Hinglish"
              ? "Achha progress hai."
              : "Good progress."}
      </h2>

      <p className="muted">
        {complete
          ? language === "Hinglish"
            ? "Aapne is guide ke main steps complete kar liye hain."
            : "You have worked through the main steps of this guide."
          : language === "Hinglish"
            ? "Har step complete karein aur acknowledgement ko reference ke liye sambhal kar rakhein."
            : "Complete each step and keep your acknowledgement for reference."}
      </p>

      {!complete && (
        <>
          <div className="status-card">
            <div>
              <span className="tag pending">
                {language === "Hinglish" ? "AGLA STEP" : "Next up"}
              </span>

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
            <b>
              {language === "Hinglish"
                ? "Journey complete ho gayi"
                : "Journey completed"}
            </b>

            <br />

            {language === "Hinglish"
              ? "Ab aapke paas next steps ka ek clear record hai."
              : "You now have a clear record of the steps to take next."}
          </p>
        </div>
      )}

      <div className="timeline">
        {steps.map((step, index) => {
          const isDone = complete || index < trackerStep;
          const isCurrent = !complete && index === trackerStep;

          const showGuide =
            isCurrent && (index === 0 || index === 1);

          return (
            <div
              className="tracker-step-row"
              key={step.title}
            >
              <div className="tracker-step-content">
                <Timeline
                  state={
                    isDone
                      ? "done"
                      : isCurrent
                        ? "current"
                        : ""
                  }
                  number={isDone ? "✓" : String(index + 1)}
                  title={step.title}
                  note={
                    isDone
                      ? language === "Hinglish"
                        ? "Complete"
                        : "Completed"
                      : step.note
                  }
                />
              </div>

              {showGuide && guideKind && (
                <button
                  className="text-button tracker-step-action"
                  onClick={() => onOpenGuide(guideKind)}
                >
                  {index === 0
                    ? language === "Hinglish"
                      ? "Kaise review karein"
                      : "How to review"
                    : language === "Hinglish"
                      ? "Kya likhein"
                      : "See what to write"}{" "}
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
            onChange={(event) =>
              onAcknowledge(event.target.checked)
            }
          />

          <span>{acknowledged ? "✓" : ""}</span>

          {trackerStep === 0
            ? language === "Hinglish"
              ? `Maine complete kiya: ${journey.trackerStep}`
              : `I’ve completed: ${journey.trackerStep}`
            : trackerStep === 1
              ? language === "Hinglish"
                ? `Maine prepare kiya: ${journey.nextStep}`
                : `I’ve prepared: ${journey.nextStep}`
              : language === "Hinglish"
                ? "Maine follow-up step complete kar liya"
                : "I’ve completed the follow-up step"}
        </label>
      )}

      <button
        className="primary fixed-bottom"
        onClick={onComplete}
        disabled={!acknowledged || complete}
      >
        {complete
          ? language === "Hinglish"
            ? "Journey complete"
            : "Journey complete"
          : trackerStep === 0
            ? language === "Hinglish"
              ? "Step complete karein"
              : "Mark step complete"
            : trackerStep === 1
              ? language === "Hinglish"
                ? "Step complete karein"
                : "Mark step complete"
              : language === "Hinglish"
                ? "Journey finish karein"
                : "Finish journey"}{" "}
        <Arrow />
      </button>

      <Disclaimer language={language} />
    </div>
  );
}

function Progress({ current }: { current: number }) { return <div className="stepper" aria-label={`Step ${current} of 4`}>{[1, 2, 3, 4].map((step) => <span className={step <= current ? "active" : ""} key={step} />)}</div>; }
function OptionGroup({ label, items, value, onChange }: { label: string; items: string[]; value: string; onChange: (value: string) => void }) { return <div className="question"><label>{label}</label><div className="pills">{items.map((item) => <button key={item} onClick={() => onChange(item)} className={value === item ? "pill selected" : "pill"} aria-pressed={value === item}>{item}</button>)}</div></div>; }
function Action({ number, tag, urgent, title, text, button, onClick }: { number: string; tag: string; urgent?: boolean; title: string; text: string; button: string; onClick: () => void }) { return <div className="action-card"><div className="number">{number}</div><div><span className={`tag ${urgent ? "urgent" : ""}`}>{tag}</span><h3>{title}</h3><p>{text}</p><button className="text-button" onClick={onClick}>{button} <Arrow /></button></div></div>; }
function Timeline({ state = "", number, title, note }: { state?: string; number: string; title: string; note: string }) { return <div className={`timeline-item ${state}`}><span>{number}</span><div><b>{title}</b><small>{note}</small></div></div>; }
function Disclaimer({ language = "English" }: { language?: Language }) {
  return (
    <p className="disclaimer">
      {language === "Hinglish"
        ? "PF Sahayak, BuildWhatMovesIndia hackathon ka ek prototype hai, jo Varun Mayya aur unki Team ne OpenAI ke support ke saath organize kiya hai. Yeh EPFO se affiliated, endorsed ya official service nahi hai. Koi live service connected nahi hai."
        : "PF Sahayak is a BuildWhatMovesIndia hackathon prototype organized by Varun Mayya and his Team backed by OpenAI. It is not affiliated with, endorsed by, or an official service of EPFO. No live services are connected."}
    </p>
  );
}

function ModalContent({
  kind,
  category,
  journey,
  detailToCorrect,
  bankDetailsContext,
  completion,
  language,
  onClose,
}: {
  kind: ModalKind;
  category: SupportedProblemCategory;
  journey: JourneyContent;
  detailToCorrect: string;
  bankDetailsContext: string;
  completion: CompletionState | null;
  language: Language;
  onClose: () => void;
}) {
  if (!kind) return null;
  if (kind === "help") {
  return (
    <JourneyModal
      title={
        language === "Hinglish"
          ? "Is prototype ke baare mein"
          : "About this prototype"
      }
      onClose={onClose}
    >
      <p>
        {language === "Hinglish"
          ? "Yeh BuildWhatMovesIndia hackathon ka prototype hai, jo Varun Mayya aur unki Team ne OpenAI ke support ke saath organize kiya hai. Ismein sirf sample information use hoti hai."
          : "This is a BuildWhatMovesIndia hackathon prototype organized by Varun Mayya and his Team backed by OpenAI that uses sample information only."}
      </p>

      <p>
        {language === "Hinglish"
          ? "Yeh EPFO, kisi government portal ya kisi live service se connect nahi karta. Yahan personal information enter na karein."
          : "It does not connect to EPFO, any government portal, or any live service. Do not enter personal information here."}
      </p>
    </JourneyModal>
  );
}
  if (kind === "status") {
  const statusTitle =
    language === "Hinglish"
      ? category === "details_need_correction"
        ? "Correction wali detail ko kaise review karein?"
        : category === "payment_not_received"
          ? "Settlement status kaise review karein?"
          : "Claim status kaise check karein?"
      : `How to ${journey.firstAction.title.toLowerCase()}`;

  return (
    <JourneyModal title={statusTitle} onClose={onClose}>
      <p className="modal-intro">
        {language === "Hinglish"
          ? "Isse ek simple demo checklist ki tarah use karein. PF Sahayak kisi real portal ko open ya connect nahi karta."
          : "Use this as a simple demo checklist. PF Sahayak does not open or connect to any real portal."}
      </p>

      <ol className="guide-list">
        <li>
          {language === "Hinglish"
            ? "Jo official member service aap normally use karte hain, use apne browser mein directly open karein."
            : "Visit the official member service you normally use, directly in your own browser."}
        </li>

        <li>
          {language === "Hinglish"
            ? "Sirf official website par apni details se sign in karein."
            : "Sign in only on the official site using your own details."}
        </li>

        <li>
          {language === "Hinglish"
            ? category === "details_need_correction"
              ? "Name, bank ya KYC detail mein jo correction chahiye, use review karein."
              : "Apna submitted claim dhoondhein aur jo status dikh raha hai use note karein."
            : category === "details_need_correction"
              ? "Review the name, bank, or KYC detail that needs attention."
              : "Find your submitted claim and note the status shown."}
        </li>

        <li>
          {language === "Hinglish"
            ? "Acknowledgement ya screenshot apne records ke liye save karein. Is prototype mein ise share na karein."
            : "Save the acknowledgement or a screenshot for your records. Do not share it in this prototype."}
        </li>
      </ol>

      <div className="modal-note">
        <b>
          {language === "Hinglish"
            ? "Kya dekhna hai"
            : "What to look for"}
        </b>
        <br />

        {language === "Hinglish"
          ? category === "details_need_correction"
            ? "Note karein ki kaunsi detail mein correction chahiye, taaki next step mein aap ise clearly explain kar sakein."
            : "Note karein ki claim under process hai, attention chahiye, ya settled hai. Isse next step decide karne mein help milegi."
          : category === "details_need_correction"
            ? "Note which detail needs correction so you can explain it clearly in the next step."
            : "Note whether the claim is under process, needs attention, or is settled. This helps you decide the next step."}
      </div>
    </JourneyModal>
  );
}
  if (kind === "grievance") {
  return (
    <JourneyModal
      title={
  language === "Hinglish"
    ? "Authority ko kya likhein?"
    : "Example: what to write"
}
      onClose={onClose}
    >
      <p className="modal-intro">
        {language === "Hinglish"
          ? "Is template ko apne chosen official channel par apne situation ke hisaab se adapt karein. Neeche diye examples mein sirf mock information use ki gayi hai."
          : "Adapt this template on the official channel you choose. The examples below use mock information only."}
      </p>

      <div className="template">
        {category === "details_need_correction" ? (
          <CorrectionTemplate
            detail={detailToCorrect}
            context={bankDetailsContext}
          />
        ) : (
          <>
            <p>
              <b>Subject:</b>{" "}
              {category === "payment_not_received"
  ? "Follow-up on settled claim payment"
  : "Follow-up on pending PF claim"}
            </p>

            <p>
  Hello,
  <br />
  I submitted my PF claim on [date]. My sample claim reference
  is <b>DEMO-2026-0042</b>. The claim currently shows as
  [status].
</p>

            <p>
  Please let me know if any action or document is needed from me.
  I have kept my acknowledgement for reference.
</p>
          </>
        )}

        <p>
  Thank you,
  <br />
  [Your name]
</p>
      </div>

      <div className="modal-note">
        <b>
          {language === "Hinglish"
            ? "Sirf zaroori information include karein"
            : "Include only what is needed"}
        </b>
        <br />

        {language === "Hinglish"
          ? category === "details_need_correction"
            ? "Jo member/KYC detail, claim context, ya bank account/IFSC detail aapne identify ki hai, sirf wahi describe karein. OTP, password, payment details ya identity numbers kabhi share na karein."
            : "Apna claim reference, submission date aur jo status aapne dekha hai wahi use karein. OTP, password, payment details ya identity numbers kabhi share na karein."
          : category === "details_need_correction"
            ? "Describe the member/KYC detail, claim context, or bank account/IFSC detail you identified. Never add OTPs, passwords, payment details, or identity numbers."
            : "Use your claim reference, submission date, and the status you saw. Never add OTPs, passwords, payment details, or identity numbers."}
      </div>
    </JourneyModal>
  );
}
  if (kind === "completion" && completion) {
  return (
    <JourneyModal
      title={
        language === "Hinglish"
          ? "Tracker update ho gaya"
          : "Tracker updated"
      }
      onClose={onClose}
    >
      <div className="completion-message">
        <span>✓</span>

        <p>
          <b>
            {language === "Hinglish"
              ? `Achha kaam — aapne complete kiya: ${completion.completedStep.toLowerCase()}.`
              : `Nice work — you completed: ${completion.completedStep.toLowerCase()}.`}
          </b>

          <br />

          {completion.nextStep
            ? language === "Hinglish"
              ? `Aapka tracker ab next step dikhata hai: ${completion.nextStep.toLowerCase()}.`
              : `Your tracker now points to the next step: ${completion.nextStep.toLowerCase()}.`
            : language === "Hinglish"
              ? "Aapne is guide ke main steps complete kar liye hain."
              : "You have completed the main steps of this guide."}
        </p>
      </div>
    </JourneyModal>
  );
}

return null;
}

function CorrectionTemplate({
  detail,
  context,
}: {
  detail: string;
  context: string;
}) {
  if (detail === "Name") {
    return (
      <>
        <p>
          <b>Subject:</b> Request to review name detail
        </p>
        <p>
          Hello,<br />
          I noticed that the name in my PF/member records may need correction.
        </p>
        <p>
          Please let me know how I can review the relevant name detail and
          request a correction. I have not included any sensitive information
          here.
        </p>
      </>
    );
  }

  if (detail === "KYC detail") {
    return (
      <>
        <p>
          <b>Subject:</b> Request to review KYC detail
        </p>
        <p>
          Hello,<br />
          I noticed that a KYC detail in my PF/member records may need
          correction.
        </p>
        <p>
          Please let me know how I can review the relevant KYC detail and
          request a correction. I have not included any sensitive information
          here.
        </p>
      </>
    );
  }

  if (detail === "Bank details") {
    if (context === "A PF claim or settlement") {
      return (
        <>
          <p>
            <b>Subject:</b> Request to review bank details for a PF claim
          </p>
          <p>
            Hello,<br />
            I noticed an issue with my bank details while reviewing a PF claim
            or settlement. My sample claim reference is{" "}
            <b>DEMO-2026-0042</b>.
          </p>
          <p>
            Please let me know if any action is needed to review the bank
            detail connected to this claim.
          </p>
        </>
      );
    }

    if (context === "My EPFO/UAN profile") {
      return (
        <>
          <p>
            <b>Subject:</b> Request to review bank KYC/member detail
          </p>
          <p>
            Hello,<br />
            I noticed that the bank detail in my member/KYC profile may need
            correction.
          </p>
          <p>
            Please let me know how I can review the relevant member or KYC
            detail. I have not included any sensitive information here.
          </p>
        </>
      );
    }

    if (context === "My bank account") {
      return (
        <>
          <p>
            <b>Subject:</b> Request to correct bank account or IFSC detail
          </p>
          <p>
            Hello,<br />
            I need to review the bank account or IFSC detail connected to my
            PF records.
          </p>
          <p>
            Please let me know how I can correct the relevant bank detail. I
            have not included any sensitive information here.
          </p>
        </>
      );
    }
  }

  return (
    <>
      <p>
        <b>Subject:</b> Help identifying a detail correction
      </p>
      <p>
        Hello,<br />
        I noticed that a detail in my PF/member records may need correction.
      </p>
      <p>
        I will first review the relevant detail and its context, then provide
        the necessary information through the official channel.
      </p>
    </>
  );
}
