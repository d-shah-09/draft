import { useCallback, useEffect, useRef, useState } from "react";
import Starting from "./legacy/starting/Starting.jsx";
import Home from "./legacy/home/App.jsx";
import Timeline from "./legacy/timeline/App.jsx";
import Prize from "./legacy/prize/Prize.jsx";
import { KingPigFaq } from "./legacy/faq/KingPigFaq.jsx";
import Registration from "./legacy/registration/Registration.jsx";

const sections = ["home", "timeline", "prizes", "faqs", "registration"];

export default function App() {
  const scrollerRef = useRef(null);
  const [intro, setIntro] = useState(true);
  const [active, setActive] = useState("home");
  const [themeOn, setThemeOn] = useState(false);
  const themeMusicRef = useRef(null);

  const goTo = useCallback((id) => {
    scrollerRef.current
      ?.querySelector(`#${id}`)
      ?.scrollIntoView({ behavior: "smooth", inline: "start" });
    setActive(id);
  }, []);

  const toggleThemeMusic = useCallback(() => {
    const music = themeMusicRef.current;
    if (!music) return;
    if (music.paused) {
      music
        .play()
        .then(() => setThemeOn(true))
        .catch(() => setThemeOn(false));
    } else {
      music.pause();
      setThemeOn(false);
    }
  }, []);

  useEffect(() => {
    if (intro) return undefined;
    const music = new Audio("/audio/Bad%20Piggies%20Theme.mp3");
    music.loop = true;
    music.volume = 0.65;
    themeMusicRef.current = music;
    music
      .play()
      .then(() => setThemeOn(true))
      .catch(() => {});
    return () => {
      music.pause();
      music.src = "";
      themeMusicRef.current = null;
    };
  }, [intro]);

  useEffect(() => {
    const onFlowBoundary = (event) => {
      const direction = event.detail === "previous" ? -1 : 1;
      const currentIndex = sections.indexOf(active);
      const next =
        sections[
          Math.max(0, Math.min(sections.length - 1, currentIndex + direction))
        ];
      if (next) goTo(next);
    };
    window.addEventListener("flow-next", onFlowBoundary);
    return () => window.removeEventListener("flow-next", onFlowBoundary);
  }, [active, goTo]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return undefined;
    const onWheel = (event) => {
      const section = event.target.closest?.(".flow-section");
      if (!section || section.id === "timeline") return;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      root.scrollBy({
        left: delta > 0 ? window.innerWidth : -window.innerWidth,
        behavior: "smooth",
      });
    };
    root.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => root.removeEventListener("wheel", onWheel, true);
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { root, threshold: [0.55, 0.75] },
    );
    root
      .querySelectorAll(".flow-section")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [intro]);

  if (intro) return <Starting onComplete={() => setIntro(false)} />;

  return (
    <div className="site-shell">
      <header className="site-header">
        {/* <button className="site-brand" onClick={() => goTo("home")} aria-label="Go to home">CODE BOUNTY 2.0</button> */}
        <nav aria-label="Main navigation">
          {sections.map((id) => (
            <button
              key={id}
              className={active === id ? "active" : ""}
              onClick={() => goTo(id)}
            >
              {id === "prizes"
                ? "Prize Pool"
                : id[0].toUpperCase() + id.slice(1)}
            </button>
          ))}
        </nav>
      </header>
      <main ref={scrollerRef} className="horizontal-flow">
        <section id="home" className="flow-section home-section">
          <Home themeOn={themeOn} onThemeToggle={toggleThemeMusic} />
        </section>
        <section id="timeline" className="flow-section timeline-section">
          <Timeline />
        </section>
        <section id="prizes" className="flow-section prize-section">
          <Prize />
        </section>
        <section id="faqs" className="flow-section faq-section-shell">
          <KingPigFaq />
        </section>
        <section
          id="registration"
          className="flow-section registration-section"
        >
          <Registration />
        </section>
      </main>
    </div>
  );
}
