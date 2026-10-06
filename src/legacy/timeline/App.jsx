import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import "./style.css";
const events = [
  {
    id: 1,
    title: "Registration",
    labelImage: "/images/registration.png",
    cardImage: "/images/registration-card.png",
  },
  {
    id: 2,
    title: "Round 1",
    labelImage: "/images/round-1.png",
    cardImage: "/images/round-1-card.png",
  },
  {
    id: 3,
    title: "Round 2",
    labelImage: "/images/round-2.png",
    cardImage: "/images/round-2-card.png",
  },
  {
    id: 4,
    title: "Round 3",
    labelImage: "/images/round-3.png",
    cardImage: "/images/round-3-card.png",
  },
  {
    id: 5,
    title: "Prizes",
    labelImage: "/images/prizes.png",
    cardImage: "/images/prizes-card.png",
  },
];
const NODE_PROGRESS = [0.06, 0.28, 0.5, 0.72, 0.94];
const LEVEL_Y_OFFSETS = [20, 85, 35, 55, -46];

const PATH_CONFIG = {
  width: 2048,
  height: 682,

  d: `
    M 60 270

    C 250 160,
      500 160,
      650 250

    C 760 340,
      650 440,
      850 445

    C 1040 450,
      1050 320,
      1200 310

    C 1400 285,
      1420 460,
      1650 495

    C 1850 525,
      1920 520,
      1990 445
  `,
};

const BIRD_IMAGE = "/images/red-bird.webp";
const BOING_SOUND = "/audio/bird-jump.mp3";
const BOING_START_TIME = 0.74;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function useBirdMovement({ pathRef, birdRef, isMuted }) {
  const animationFrameRef = useRef(null);
  const currentProgressRef = useRef(NODE_PROGRESS[0]);
  const currentOffsetRef = useRef(LEVEL_Y_OFFSETS[0]);
  const isMovingRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const audioRef = useRef(null);
  const timersRef = useRef([]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = media.matches;
    };
    update();
    media.addEventListener?.("change", update);
    return () => {
      media.removeEventListener?.("change", update);
    };
  }, []);
  useEffect(() => {
    if (!BOING_SOUND) {
      return undefined;
    }
    const audio = new Audio(BOING_SOUND);
    audio.preload = "auto";
    audio.volume = 0.7;
    audioRef.current = audio;
    return () => {
      audio.pause();

      audioRef.current = null;
    };
  }, []);

  const playBoing = useCallback(() => {
    const audio = audioRef.current;

    if (isMuted || !audio) return;

    audio.pause();

    audio.currentTime = BOING_START_TIME;

    audio.play().catch(() => {});
  }, [isMuted]);

  const placeBird = useCallback(
    (progress, jumpHeight = 0, levelOffset = 0) => {
      const path = pathRef.current;

      const bird = birdRef.current;

      if (!path || !bird) {
        return;
      }

      const totalLength = path.getTotalLength();

      const point = path.getPointAtLength(totalLength * progress);

      const x = (point.x / PATH_CONFIG.width) * 100;

      const y = (point.y / PATH_CONFIG.height) * 100;

      bird.style.left = `${x}%`;

      bird.style.top = `${y}%`;

      bird.style.transform = `
          translate(-50%, -50%)
          translateY(${levelOffset - jumpHeight}px)
        `;
    },
    [pathRef, birdRef],
  );

  const snapTo = useCallback(
    (progress, index) => {
      const offset = LEVEL_Y_OFFSETS[index] ?? 0;

      currentProgressRef.current = progress;

      currentOffsetRef.current = offset;

      placeBird(progress, 0, offset);
    },
    [placeBird],
  );

  const moveTo = useCallback(
    (targetProgress, targetIndex) =>
      new Promise((resolve) => {
        const path = pathRef.current;

        const bird = birdRef.current;

        if (!path || !bird || isMovingRef.current) {
          resolve(false);

          return;
        }

        const startProgress = currentProgressRef.current;

        const startOffset = currentOffsetRef.current;

        const targetOffset = LEVEL_Y_OFFSETS[targetIndex] ?? 0;

        const distance = targetProgress - startProgress;

        const absoluteDistance = Math.abs(distance);

        /* ---------------------------------
               Clicking current node
               --------------------------------- */

        if (absoluteDistance < 0.001) {
          currentOffsetRef.current = targetOffset;

          placeBird(targetProgress, 0, targetOffset);

          resolve(true);

          return;
        }

        isMovingRef.current = true;

        bird.dataset.direction = distance < 0 ? "backward" : "forward";

        /* ---------------------------------
               Reduced motion
               --------------------------------- */

        if (reducedMotionRef.current) {
          bird.style.opacity = "0";

          const timer = setTimeout(() => {
            placeBird(targetProgress, 0, targetOffset);

            currentProgressRef.current = targetProgress;

            currentOffsetRef.current = targetOffset;

            bird.style.opacity = "1";

            isMovingRef.current = false;

            resolve(true);
          }, 180);

          timersRef.current.push(timer);

          return;
        }

        bird.classList.add("bird-moving");
        playBoing();

        const duration = 650 + absoluteDistance * 650;

        const maxJumpHeight = 90 + absoluteDistance * 50;

        let startTime = null;

        const animate = (timestamp) => {
          if (startTime === null) {
            startTime = timestamp;
          }

          const elapsed = timestamp - startTime;

          const rawProgress = Math.min(elapsed / duration, 1);

          const eased = easeInOutCubic(rawProgress);

          /*
                  Move along SVG path.
                */

          const progress = startProgress + distance * eased;

          /*
                  Smoothly transition between
                  the custom Y offsets.

                  Example:
                  01 -> 02 gradually moves downward.
                */

          const offset = startOffset + (targetOffset - startOffset) * eased;

          /*
                  Exactly ONE jump arc.
                */

          const jump = Math.sin(Math.PI * eased);

          placeBird(progress, jump * maxJumpHeight, offset);

          if (rawProgress < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);

            return;
          }

          /* ---------------------------------
                   Landing
                   --------------------------------- */

          placeBird(targetProgress, 0, targetOffset);

          currentProgressRef.current = targetProgress;

          currentOffsetRef.current = targetOffset;

          bird.classList.remove("bird-moving");
          bird.classList.add("bird-landing");

          const timer = setTimeout(() => {
            bird.classList.remove("bird-landing");
          }, 350);

          timersRef.current.push(timer);

          isMovingRef.current = false;

          resolve(true);
        };

        animationFrameRef.current = requestAnimationFrame(animate);
      }),
    [pathRef, birdRef, placeBird, playBoing],
  );

  /* -----------------------------------------
     Cleanup
     ----------------------------------------- */

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      timersRef.current.forEach((timer) => clearTimeout(timer));

      isMovingRef.current = false;
    };
  }, []);

  return {
    moveTo,
    snapTo,
    isMovingRef,
  };
}

/* =========================================================
   BIRD
   ========================================================= */

const Bird = forwardRef(function Bird({ imageSrc }, ref) {
  return (
    <div ref={ref} className="bird" aria-hidden="true">
      <div className="bird-flipper">
        <img src={imageSrc} alt="" className="bird-image" draggable="false" />
      </div>

      <div className="landing-puff">
        <span>✦</span>

        <span>•</span>

        <span>✦</span>

        <span>•</span>
      </div>
    </div>
  );
});

/* =========================================================
   LEVEL NODE
   ========================================================= */

function LevelNode({
  event,
  index,
  position,
  status,
  onSelect,
  cardVisible,
  onCloseCard,
}) {
  const badgeImage =
    status === "upcoming"
      ? "/images/level-silver.png"
      : "/images/level-gold.png";

  const verticalOffset = LEVEL_Y_OFFSETS[index] ?? 0;

  return (
    <div
      className={`level-wrapper level-${status} level-index-${index} ${cardVisible ? "level-card-open" : ""}`}
      style={{
        left: `${position.x}%`,

        top: `${position.y}%`,

        transform: `
          translate(-50%, -50%)
          translateY(${verticalOffset}px)
        `,
      }}
    >
      <button
        type="button"
        className={`level-button ${status}`}
        aria-label={`Go to ${event.title}`}
        aria-current={status === "current" ? "step" : undefined}
        onClick={() => onSelect(index)}
      >
        <img
          src={badgeImage}
          alt=""
          className="level-badge-image"
          draggable="false"
        />

        <span className="level-number">
          {String(index + 1).padStart(2, "0")}
        </span>
      </button>

      <div className="event-sign-image-wrap">
        <img
          src={event.labelImage}
          alt={event.title}
          className="event-sign-image"
          draggable="false"
        />
      </div>

      <InfoCard event={event} visible={cardVisible} onClose={onCloseCard} />
    </div>
  );
}

/* =========================================================
   EVENT CARD IMAGE MODAL
   ========================================================= */

function InfoCard({ event, visible, onClose }) {
  if (!event) return null;

  return (
    <div
      className={`event-popover ${visible ? "event-popover-visible" : ""}`}
      role="dialog"
      aria-hidden={!visible}
      aria-label={`${event.title} details`}
    >
      <div className="event-card-image-container">
        <img
          src={event.cardImage}
          alt={`${event.title} event details`}
          className="event-card-image"
          draggable="false"
        />

        <button
          type="button"
          className="event-card-close"
          onClick={onClose}
          aria-label="Close event details"
          tabIndex={visible ? 0 : -1}
        >
          ×
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN APP
   ========================================================= */

export default function App() {
  const pathRef = useRef(null);

  const birdRef = useRef(null);

  const [nodePositions, setNodePositions] = useState(
    events.map(() => ({
      x: 50,
      y: 50,
    })),
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const [completed, setCompleted] = useState([]);

  /*
    Change this to false if you DON'T
    want Registration popup open when
    the page first loads.
  */

  const [cardVisible, setCardVisible] = useState(false);

  const [isMuted, setIsMuted] = useState(true);

  const { moveTo, snapTo, isMovingRef } = useBirdMovement({
    pathRef,
    birdRef,
    isMuted,
  });

  /* =======================================================
     CALCULATE NODE POSITIONS
     ======================================================= */

  const calculateNodes = useCallback(() => {
    const path = pathRef.current;

    if (!path) {
      return;
    }

    const totalLength = path.getTotalLength();

    const positions = NODE_PROGRESS.map((progress) => {
      const point = path.getPointAtLength(totalLength * progress);

      return {
        x: (point.x / PATH_CONFIG.width) * 100,

        y: (point.y / PATH_CONFIG.height) * 100,
      };
    });

    setNodePositions(positions);

    /*
        Keeps bird aligned with the
        currently active level.
      */

    snapTo(NODE_PROGRESS[currentIndex], currentIndex);
  }, [currentIndex, snapTo]);

  /* =======================================================
     INITIAL POSITION + RESIZE
     ======================================================= */

  useEffect(() => {
    const frame = requestAnimationFrame(calculateNodes);

    window.addEventListener("resize", calculateNodes);

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener("resize", calculateNodes);
    };
  }, [calculateNodes]);

  /* =======================================================
     LEVEL STATUS
     ======================================================= */

  const getStatus = useCallback(
    (index) => {
      if (index === currentIndex) {
        return "current";
      }

      if (completed.includes(index)) {
        return "completed";
      }

      return "upcoming";
    },
    [currentIndex, completed],
  );

  /* =======================================================
     CLICK LEVEL
     ======================================================= */

  const selectLevel = useCallback(
    async (index) => {
      if (isMovingRef.current) {
        return;
      }

      /*
          Hide previous card while bird moves.
        */

      setCardVisible(false);

      const previousIndex = currentIndex;

      /*
          IMPORTANT:
          index is passed into moveTo so
          level-specific Y offsets work.
        */

      const success = await moveTo(NODE_PROGRESS[index], index);

      if (!success) {
        return;
      }

      setCurrentIndex(index);

      /*
          Mark previous level completed.
        */

      if (previousIndex !== index) {
        setCompleted((old) =>
          old.includes(previousIndex) ? old : [...old, previousIndex],
        );
      }

      /*
          Open corresponding event-card image.
        */

      const timer = setTimeout(() => {
        setCardVisible(true);
      }, 120);

      return () => clearTimeout(timer);
    },
    [currentIndex, isMovingRef, moveTo],
  );
  /* =========================================================
   SCROLL BETWEEN LEVELS
   ========================================================= */

  const scrollLockRef = useRef(false);

  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault();

      if (isMovingRef.current || scrollLockRef.current) {
        return;
      }
      if (Math.abs(event.deltaY) < 35) {
        return;
      }

      let nextIndex = currentIndex;

      if (event.deltaY > 0) {
        nextIndex = Math.min(currentIndex + 1, events.length - 1);
      }

      if (event.deltaY < 0) {
        nextIndex = Math.max(currentIndex - 1, 0);
      }

      if (nextIndex === currentIndex) {
        window.dispatchEvent(new CustomEvent("flow-next", {
          detail: event.deltaY > 0 ? "next" : "previous",
        }));
        return;
      }
      scrollLockRef.current = true;

      selectLevel(nextIndex);

      const timer = setTimeout(() => {
        scrollLockRef.current = false;
      }, 950);

      return () => clearTimeout(timer);
    };

    window.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [currentIndex, selectLevel, isMovingRef]);
  return (
    <main className="game-map">
      {/* SOUND */}

      <header className="game-header">
        <button
          type="button"
          className="sound-button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted((value) => !value);
          }}
          aria-label={isMuted ? "Turn sound on" : "Mute sound"}
        >
          <img
            src={isMuted ? "/images/sound-off.png" : "/images/sound-on.png"}
            alt=""
            className="sound-icon"
            draggable="false"
          />
        </button>
      </header>

      <section className="map-world" aria-label="Event level map">
        <div className="map-path-layer">
          <svg
            className="movement-svg"
            viewBox={`0 0 ${PATH_CONFIG.width} ${PATH_CONFIG.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={pathRef}
              className="movement-path"
              d={PATH_CONFIG.d}
              fill="none"
            />
          </svg>

          {events.map((event, index) => (
            <LevelNode
              key={event.id}
              event={event}
              index={index}
              position={nodePositions[index]}
              status={getStatus(index)}
              onSelect={selectLevel}
              cardVisible={cardVisible && currentIndex === index}
              onCloseCard={() => setCardVisible(false)}
            />
          ))}

          {/* BIRD */}

          <Bird ref={birdRef} imageSrc={BIRD_IMAGE} />
        </div>
      </section>
    </main>
  );
}
