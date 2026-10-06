import { useEffect, useRef } from "react";
import "./style.css";

export default function Prize() {
  const sectionRef = useRef(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.75) section.classList.add("start");
    }, { threshold: [0.75] });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return <section ref={sectionRef} className="prize-page" aria-label="Prize pool">
    <div className="stars">
      <div className="star-slot star-slot-left"><img src="/prize/assets/star-left.png" className="star star-left" alt="" /><span className="star-caption">Rs. 2000<br /><small>(Second)</small></span></div>
      <div className="star-slot star-slot-centre"><img src="/prize/assets/star-centre.png" className="star star-centre" alt="" /><span className="star-caption">Rs. 3000<br /><small>(First)</small></span></div>
      <div className="star-slot star-slot-right"><img src="/prize/assets/star-right.png" className="star star-right" alt="" /><span className="star-caption">Rs. 1000<br /><small>(Third)</small></span></div>
    </div>
    <div className="board-wrapper"><img src="/prize/assets/prize-board.png" className="prize-board" alt="" /><div className="board-content"><strong className="board-amount">Best FE ONLY Team: Rs 1000</strong></div></div>
    <div className="characters-wrapper"><img src="/prize/assets/prize-characters.png" className="prize-characters" alt="Angry Birds Characters" /></div>
  </section>;
}
