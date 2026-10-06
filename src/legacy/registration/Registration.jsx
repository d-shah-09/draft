import { useEffect, useState } from "react";
import pig from "./assets/king-pig-transparent.png";
import bg from "./assets/bg.jpg";

// Replace with your Unstop registration link.
const UNSTOP_URL = "https://unstop.com/";
// Replace with your real registration count (or a live source).
const REGISTRATION_COUNT = 0;

export default function Registration() {
  const [stage, setStage] = useState("idle");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (stage !== "zoom") return;
    const t = setTimeout(() => setStage("register"), 1050);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "register") return;
    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 1200);
      setCount(Math.round(REGISTRATION_COUNT * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  return (
    <main
      className="fixed inset-0 overflow-hidden bg-cover bg-center font-game"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {stage !== "register" ? (
        <div className="flex h-full flex-col items-center justify-center gap-8">
          <h1
            className={`text-game-stroke text-center text-5xl text-cream md:text-7xl transition-opacity ${stage === "zoom" ? "opacity-0" : ""}`}
          >
            Tap the King!
          </h1>
          <button
            aria-label="Tap King Pig"
            onClick={() => setStage("zoom")}
            disabled={stage === "zoom"}
            className={stage === "zoom" ? "relative z-10 animate-pig-zoom" : "animate-pig-bob cursor-pointer"}
          >
            <img src={pig} alt="King Pig" className="block w-48 select-none drop-shadow-2xl md:w-64" draggable={false} />
          </button>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center bg-pig">
          <div className="flex flex-col items-center gap-10 px-6 text-center">
            <div className="animate-pop-in">
              <div className="text-game-stroke text-7xl text-cream md:text-9xl">{count.toLocaleString()}</div>
              <div className="mt-2 flex items-center justify-center gap-2 text-xl tracking-wide text-pig-dark md:text-2xl">
                <span className="h-3 w-3 animate-pulse rounded-full bg-destructive" /> Live registrations
              </div>
            </div>
            <a
              href={UNSTOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="animate-pop-in btn-wood rounded-2xl border-4 border-wood-dark bg-wood px-12 py-5 text-3xl text-cream transition-transform hover:scale-105 active:translate-y-1 md:text-4xl"
              style={{ animationDelay: "0.2s" }}
            >
              Register Now
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
