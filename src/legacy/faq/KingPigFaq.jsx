import { useId, useState } from "react";
import { faqs as defaultFaqs } from "./faqs.js";
import pigIdle from "./assets/king-pig-idle.png";
import pigLecturing from "./assets/king-pig-lecturing.png";
import pigCommanding from "./assets/king-pig-commanding.png";
import pigWhispering from "./assets/king-pig-whispering.png";
import pigDeclaiming from "./assets/king-pig-declaiming.png";
import pigDismissing from "./assets/king-pig-dismissing.png";
import faqBg from "./assets/faq-bg.jpeg";

const PIG_POSES = {
  commanding: pigCommanding,
  lecturing: pigLecturing,
  whispering: pigWhispering,
  declaiming: pigDeclaiming,
  dismissing: pigDismissing,
};

const DEFAULT_POSE_ORDER = [
  "commanding",
  "lecturing",
  "declaiming",
  "whispering",
  "dismissing",
];

export function KingPigFaq({ faqs = defaultFaqs }) {
  const [open, setOpen] = useState(null);
  const baseId = useId();
  const talking = open !== null;
  const currentFaq = open !== null ? faqs[open] : undefined;
  const currentPose =
    open !== null
      ? (currentFaq?.pose ?? DEFAULT_POSE_ORDER[open % DEFAULT_POSE_ORDER.length] ?? "commanding")
      : null;
  const currentPigImg = currentPose !== null ? PIG_POSES[currentPose] : pigIdle;

  return (
    <section
      className="faq-section relative overflow-hidden bg-cover bg-no-repeat bg-[position:70%_bottom] md:bg-bottom"
      style={{ backgroundImage: `url(${faqBg})` }}
      aria-labelledby={`${baseId}-title`}
    >
      <div className="faq-content relative z-10 mx-auto max-w-6xl px-4 pb-56 pt-16 md:pb-72 md:pt-24">
        <header className="faq-header text-center">
          <span className="chip">Code Bounty 2.0 · 3 Rounds · Team Event</span>
          <h2 id={`${baseId}-title`} className="game-title mt-5 text-5xl md:text-7xl">
            Questions for the King?
          </h2>
          <p className="mt-4 text-lg font-bold text-sky-ink md:text-xl">
            Confused about Code Bounty 2.0? King Pig has answers. Probably.
          </p>
        </header>

        <div className="faq-layout mt-12 grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="faq-king flex flex-col items-center md:sticky md:top-6">
            {currentFaq ? (
              <div
                key={`answer-${open}`}
                className="speech-bubble animate-pop text-left"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center justify-between gap-2 border-b-2 border-dashed border-ink/20 pb-2">
                  <span className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wide text-bird-red md:text-sm">
                    <span aria-hidden>👑</span>
                    <span>{currentFaq.reactionTitle ?? "KING PIG'S DECREE"}</span>
                  </span>
                  {currentPose && (
                    <span className="chip px-2.5 py-0.5 text-[10px] uppercase tracking-wider md:text-xs">
                      {currentPose}
                    </span>
                  )}
                </div>
                <p className="mt-2.5 font-display text-base leading-snug text-ink md:text-lg">
                  “{currentFaq.kingPigLine}”
                </p>
                <div className="mt-3 border-t-2 border-dashed border-ink/20 pt-3">
                  {currentFaq.stages ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-bold leading-snug text-ink md:text-base">
                        The competition consists of three stages:
                      </p>
                      <div className="grid gap-2">
                        {currentFaq.stages.map((stg) => (
                          <div
                            key={stg.stage}
                            className="rounded-xl border-2 border-ink/25 bg-white/80 p-2.5 shadow-xs"
                          >
                            <span className="inline-block rounded-md border border-ink bg-bird-yellow px-2 py-0.5 font-display text-xs text-ink">
                              {stg.stage}
                            </span>
                            <p className="mt-1 text-xs font-bold leading-snug text-ink/90 md:text-sm">
                              {stg.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-bold leading-relaxed text-ink/90 md:text-base">
                      {currentFaq.answer}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div
                key="idle"
                className="speech-bubble animate-pop text-center"
                role="status"
                aria-live="polite"
              >
                <p className="font-display text-xl leading-snug text-ink md:text-2xl">
                  “Go on, peasant. Ask the King anything.”
                </p>
                <p className="mt-2 text-sm font-bold text-sky-ink">
                  Click any question on the right to hear the King speak the answer!
                </p>
              </div>
            )}
            <div className="faq-pig-wrap relative mt-5 h-60 w-60 md:h-72 md:w-72">
              <img
                src={currentPigImg}
                alt={currentPose ? `King Pig reacting (${currentPose})` : "King Pig waiting smugly"}
                className={`faq-pig pig-float h-full w-full object-contain drop-shadow-xl ${talking ? "pig-wobble" : ""}`}
                key={currentPose ? `pose-${currentPose}-${open}` : "idle"}
              />
            </div>
            <div className="plank mt-2">KING PIG</div>
          </div>

          <ul className="faq-list flex flex-col gap-3.5">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              const btnId = `${baseId}-q-${i}`;
              return (
                <li
                  key={f.question}
                  className={`faq-card transition-all duration-200 ${isOpen ? "faq-card-open ring-4 ring-bird-yellow scale-[1.015]" : "hover:translate-x-1"}`}
                >
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="faq-question-button flex w-full cursor-pointer items-center gap-3.5 px-4.5 py-4 text-left md:px-5 md:py-4.5"
                    >
                      <span
                        className={`faq-num transition-colors ${isOpen ? "!bg-pig shadow-xs" : ""}`}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 font-display text-base leading-snug text-ink md:text-lg">
                        {f.question}
                      </span>
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border-3 border-ink font-display text-sm shadow-xs transition-transform duration-200 ${isOpen ? "bg-grass-dark text-panel rotate-12 scale-110" : "bg-bird-yellow text-ink"}`}
                        aria-hidden
                      >
                        {isOpen ? "🐷" : "➜"}
                      </span>
                    </button>
                  </h3>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
