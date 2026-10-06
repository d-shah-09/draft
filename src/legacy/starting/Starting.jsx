import { useEffect, useRef } from "react";
import "./style.css";

export default function Starting({ onComplete }) {
  const shipRef = useRef(null);
  const eggsRef = useRef(null);

  useEffect(() => {
    const ship = shipRef.current;
    const eggs = eggsRef.current;
    if (!ship || !eggs) return undefined;
    let exitTimer;
    let finishTimer;
    let finished = false;
    const complete = () => {
      if (finished) return;
      finished = true;
      finishTimer = window.setTimeout(onComplete, 500);
    };
    const startExit = () => {
      ship.classList.remove("hovering");
      ship.style.animation = "none";
      ship.style.transform = "translate3d(-50%, 0, 0)";
      ship.getBoundingClientRect();
      const animation = ship.animate(
        [{ transform: "translate3d(-50%, 0, 0)" }, { transform: "translate3d(calc(120vw - 50%), 0, 0)" }],
        { duration: 4500, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)", fill: "forwards" },
      );
      animation.onfinish = complete;
    };
    const entranceDone = (event) => {
      if (event.animationName !== "shipEnter") return;
      ship.classList.add("hovering");
      window.setTimeout(() => eggs.classList.add("reacting"), 200);
      window.setTimeout(() => {
        eggs.classList.remove("reacting");
        void eggs.offsetWidth;
        eggs.classList.add("stealing");
      }, 850);
      exitTimer = window.setTimeout(startExit, 3350);
    };
    ship.addEventListener("animationend", entranceDone);
    return () => {
      ship.removeEventListener("animationend", entranceDone);
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <section className="intro-section" aria-label="Event intro">
      <div ref={shipRef} className="ship-wrapper"><img src="/starting/assets/pig-ship.png" alt="Pig Airship" className="pig-ship" /></div>
      <div className="nest-container">
        <img src="/starting/assets/nest-back.png" alt="" className="nest-back" />
        <div ref={eggsRef} className="eggs">
          <img src="/starting/assets/egg.png" alt="Egg" className="egg egg-left" />
          <img src="/starting/assets/egg.png" alt="Egg" className="egg egg-center" />
          <img src="/starting/assets/egg.png" alt="Egg" className="egg egg-right" />
        </div>
        <img src="/starting/assets/nest-front.png" alt="" className="nest-front" />
      </div>
      <button className="intro-skip" onClick={onComplete}>Skip animation</button>
    </section>
  );
}
