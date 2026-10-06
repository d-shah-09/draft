import { useCallback, useEffect, useRef, useState } from "react";

import "./style.css";

/* =========================================================
   SECOND SCENE SETTINGS
========================================================= */

const SCENE_MS = 7200;

const SPRITES = {
  black: "/starting/assets/bomb-shocked.svg",
  white: "/starting/assets/matilda.webp",
  red: "/starting/assets/red-shocked.png",
  blue: "/starting/assets/blue-shocked.png",
  yellow: "/starting/assets/chuck-shocked.svg",
  pigs: "/starting/assets/pigs-pan.png",
};

const SPARKS = [
  [66, 16, 1.6, "3.0s"],
  [61, 25, 1.1, "3.4s"],
  [74, 21, 1.3, "3.8s"],
  [93, 19, 1.5, "3.2s"],
  [97, 27, 1.0, "4.0s"],
];

/* =========================================================
   ACTOR COMPONENT
========================================================= */

function Actor({ name, className = "", style, children }) {
  const [ok, setOk] = useState(true);

  return (
    <div className={`actor actor--${name} ${className}`} style={style}>
      <div className="actor__body">
        <div className="actor__pose">
          {ok ? (
            <img
              className="actor__img"
              src={SPRITES[name]}
              alt=""
              draggable="false"
              onError={() => setOk(false)}
            />
          ) : (
            <span className="actor__blob" />
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

/* =========================================================
   SECOND ANIMATION
========================================================= */

function IntroScene({ onDone }) {
  const [showSkip, setShowSkip] = useState(false);

  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);

  onDoneRef.current = onDone;

  const finish = useCallback(() => {
    if (doneRef.current) return;

    doneRef.current = true;

    /*
      IMPORTANT:

      Do not fade Scene 2 away.

      The main website should replace Starting immediately.

      This prevents Scene 1 appearing again for one frame.
    */

    if (onDoneRef.current) {
      onDoneRef.current();
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setShowSkip(true);
    });

    const endTimer = window.setTimeout(() => {
      finish();
    }, SCENE_MS);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(endTimer);
    };
  }, [finish]);

  return (
    <div className="intro">
      <div className="cutscene" aria-hidden="true">
        <div className="cutscene__stage">
          <div className="cam">
            {/* =====================================
                BACKGROUND
            ===================================== */}

            <div className="bg" />

            {/* =====================================
                SPARKLES
            ===================================== */}

            {SPARKS.map(([x, y, size, delay]) => (
              <span
                key={`${x}-${y}`}
                className="spark"
                style={{
                  "--x": x,
                  "--y": y,
                  "--s": size,
                  "--at": delay,
                }}
              />
            ))}

            {/* =====================================
                BOMB
            ===================================== */}

            <Actor
              name="black"
              style={{
                "--x": 8,
                "--b": 25,
                "--w": 13,
                "--d": "-0.4s",
              }}
            >
              <span
                className="mark mark--q mark--black"
                style={{
                  "--at": "0.2s",
                }}
              >
                ?
              </span>
            </Actor>

            {/* =====================================
                MATILDA
                Behind real nest
            ===================================== */}

            <Actor
              name="white"
              style={{
                "--x": 25,
                "--b": 29,
                "--w": 12.5,
                "--d": "-1.3s",
              }}
            />

            {/* =====================================
                RED
            ===================================== */}

            <Actor
              name="red"
              style={{
                "--x": 41,
                "--b": 26,
                "--w": 12,
                "--d": "-0.9s",
              }}
            >
              <span
                className="mark mark--q mark--red"
                style={{
                  "--at": "2.5s",
                }}
              >
                ??
              </span>
            </Actor>

            {/* =====================================
                REAL NEST

                Same assets as Scene 1.
            ===================================== */}

            <div className="scene-nest" aria-hidden="true">
              <img
                src="/starting/assets/nest-back.png"
                alt=""
                className="scene-nest__back"
              />

              <img
                src="/starting/assets/nest-front.png"
                alt=""
                className="scene-nest__front"
              />
            </div>

            {/* =====================================
                BLUE BIRD SHADOW
            ===================================== */}

            <span
              className="shadow shadow--blue"
              style={{
                "--x": 57,
                "--b": 21,
                "--w": 7,
              }}
            />

            {/* =====================================
                BLUE BIRD
            ===================================== */}

            <Actor
              name="blue"
              style={{
                "--x": 57,
                "--b": 27,
                "--w": 8,
                "--d": "-0.7s",
              }}
            >
              <span
                className="mark mark--q mark--blue"
                style={{
                  "--at": "2s",
                }}
              >
                ?
              </span>
            </Actor>

            {/* =====================================
                CHUCK SHADOW
            ===================================== */}

            <span
              className="shadow shadow--yellow"
              style={{
                "--x": 72,
                "--b": 20,
                "--w": 12,
              }}
            />

            {/* =====================================
                CHUCK
            ===================================== */}

            <Actor
              name="yellow"
              style={{
                "--x": 72,
                "--b": 25,
                "--w": 15,
                "--d": "-1.8s",
              }}
            >
              <span
                className="mark mark--lines"
                style={{
                  "--at": "2.6s",
                }}
              >
                <i />
                <i />
              </span>

              <span
                className="mark mark--hash"
                style={{
                  "--at": "2.8s",
                }}
              >
                #
              </span>
            </Actor>

            {/* =====================================
                LARGE PIG GROUP
            ===================================== */}

            <Actor
              name="pigs"
              style={{
                "--x": 108,
                "--b": 22,
                "--w": 29,
                "--d": "-1.1s",
              }}
            />
          </div>
        </div>
      </div>

      {/* Optional dark cinematic edges */}

      <div className="intro__scrim" />

      {/* =====================================
          SKIP SCENE 2
      ===================================== */}

      <button
        type="button"
        className={`intro__skip ${showSkip ? "show-skip" : ""}`}
        onClick={finish}
        aria-label="Skip intro"
      >
        Skip
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5l7 7-7 7M13 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

/* =========================================================
   MAIN STARTING COMPONENT
========================================================= */

export default function Starting({ onComplete }) {
  const shipRef = useRef(null);
  const eggsRef = useRef(null);

  const [showScene, setShowScene] = useState(false);

  /* =======================================================
     PRELOAD SCENE 2 ASSETS

     This removes the loading delay between animations.
  ======================================================= */

  useEffect(() => {
    const preloadSources = [
      SPRITES.black,
      SPRITES.white,
      SPRITES.red,
      SPRITES.blue,
      SPRITES.yellow,
      SPRITES.pigs,

      "/starting/assets/nest-back.png",
      "/starting/assets/nest-front.png",

      "/starting/assets/background.png",
    ];

    preloadSources.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  /* =======================================================
     SCENE 1
  ======================================================= */

  useEffect(() => {
    const ship = shipRef.current;
    const eggs = eggsRef.current;

    if (!ship || !eggs) {
      return undefined;
    }

    let exitTimer;
    let shipExitAnimation;

    const startExit = () => {
      ship.classList.remove("hovering");

      ship.style.animation = "none";

      ship.style.transform = "translate3d(-50%, 0, 0)";

      /*
        Force browser to commit the above transform
        before Web Animations API starts.
      */

      ship.getBoundingClientRect();

      shipExitAnimation = ship.animate(
        [
          {
            transform: "translate3d(-50%, 0, 0)",
          },

          {
            transform: "translate3d(calc(120vw - 50%), 0, 0)",
          },
        ],
        {
          duration: 4500,

          easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",

          fill: "forwards",
        },
      );

      /*
        CRITICAL:

        Scene 2 starts the exact moment the ship's
        exit animation has completely finished.

        No 500ms delay.
      */

      shipExitAnimation.onfinish = () => {
        setShowScene(true);
      };
    };

    const entranceDone = (event) => {
      if (event.animationName !== "shipEnter") {
        return;
      }

      ship.removeEventListener("animationend", entranceDone);

      ship.classList.add("hovering");

      /* Eggs react */

      window.setTimeout(() => {
        eggs.classList.add("reacting");
      }, 200);

      /* Eggs get stolen */

      window.setTimeout(() => {
        eggs.classList.remove("reacting");

        void eggs.offsetWidth;

        eggs.classList.add("stealing");
      }, 850);

      /* Pig ship begins leaving */

      exitTimer = window.setTimeout(startExit, 3350);
    };

    ship.addEventListener("animationend", entranceDone);

    return () => {
      ship.removeEventListener("animationend", entranceDone);

      window.clearTimeout(exitTimer);

      if (shipExitAnimation) {
        shipExitAnimation.cancel();
      }
    };
  }, []);

  return (
    <section className="intro-section" aria-label="Event intro">
      {/* =====================================
          SCENE 1 PIG SHIP
      ===================================== */}

      <div ref={shipRef} className="ship-wrapper">
        <img
          src="/starting/assets/pig-ship.png"
          alt="Pig Airship"
          className="pig-ship"
        />
      </div>

      {/* =====================================
          SCENE 1 NEST
      ===================================== */}

      <div className="nest-container">
        <img
          src="/starting/assets/nest-back.png"
          alt=""
          className="nest-back"
        />

        <div ref={eggsRef} className="eggs">
          <img
            src="/starting/assets/egg.png"
            alt="Egg"
            className="egg egg-left"
          />

          <img
            src="/starting/assets/egg.png"
            alt="Egg"
            className="egg egg-center"
          />

          <img
            src="/starting/assets/egg.png"
            alt="Egg"
            className="egg egg-right"
          />
        </div>

        <img
          src="/starting/assets/nest-front.png"
          alt=""
          className="nest-front"
        />
      </div>

      {/* =====================================
          SKIP EVERYTHING
      ===================================== */}

      {!showScene && (
        <button className="intro-skip" onClick={onComplete}>
          Skip animation
        </button>
      )}

      {/* =====================================
          SCENE 2

          It covers Scene 1 completely.
      ===================================== */}

      {showScene && <IntroScene onDone={onComplete} />}
    </section>
  );
}
