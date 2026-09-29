import { useEffect, useRef, useState } from "react";

/* "One plate" gallery. Each entry is one dish Dyllan has told us about; the
   arrows only appear once there are two or more. Rows marked todo are still
   waiting on his details. */
type Plate = {
  name: string;
  image?: { src: string; alt: string; position?: string };
  slot?: string; // shown until the photo arrives
  rows: { label: string; text: string; todo?: boolean }[];
};

const PLATES: Plate[] = [
  {
    name: "Seared duck, wild rice & mugolio apple chutney",
    image: { src: "/images/g-duck.jpg", alt: "Sliced seared duck breast over wild rice with apple chutney, sage, daikon, and baby chard" },
    rows: [
      {
        label: "The farms",
        text: "Duck breast from Redbud Duck Co. in Ava. Wild rice with oyster mushrooms from Mo' Mushrooms and onions from Ozarks Farm Stop. Seared daikon radish with a coconut cream reduction, and baby chard.",
      },
      { label: "The chutney", text: "Apple chutney made with mugolio, a syrup of young pine cones — two years in the making." },
      {
        label: "The plate",
        text: "Dyllan worked on this dish for a year before the plating finally came together. “Duck is a delicate protein to work with, because every cut has to be done just right.”",
      },
    ],
  },
  {
    name: "Chicken roulade, chanterelle & pawpaw",
    image: { src: "/images/dish-chanterelle-pawpaw.webp", alt: "Chicken roulade with chanterelle mushrooms and a pawpaw glaze", position: "center 45%" },
    rows: [
      { label: "The wild", text: "Chanterelles from summer hardwoods, and pawpaw — the Ozarks' native fruit, with a season only a few weeks long." },
      { label: "The farm", text: "Which farm raised the chicken, and why Dyllan cooks with them.", todo: true },
      { label: "The plate", text: "How long the dish took to get right, and what makes it hard to do well.", todo: true },
    ],
  },
];

export function PlateGallery() {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const plate = PLATES[index];
  const many = PLATES.length > 1;
  const go = (step: number) => setIndex((i) => (i + step + PLATES.length) % PLATES.length);

  useEffect(() => {
    PLATES.forEach((p) => {
      if (p.image) new Image().src = p.image.src;
    });
  }, []);

  return (
    <section
      className="sec s-white"
      aria-roledescription={many ? "carousel" : undefined}
      aria-label="Signature plates"
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (!many || touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="c dish">
        <figure className={`dish-img plate-fade${plate.image ? "" : " slot"}`} key={`img-${index}`}>
          {plate.image ? (
            <img
              src={plate.image.src}
              alt={plate.image.alt}
              style={plate.image.position ? { objectPosition: plate.image.position } : undefined}
            />
          ) : (
            <div className="slot-note">
              <span className="label">Photo coming</span>
              {plate.slot}
            </div>
          )}
        </figure>
        <div>
          <div className="label-row">
            <div className="label">{many ? "Signature plates" : "One plate"}</div>
            {many && (
              <div className="plate-ctrl">
                <span className="plate-count" aria-live="polite">
                  {String(index + 1).padStart(2, "0")} / {String(PLATES.length).padStart(2, "0")}
                </span>
                <button type="button" onClick={() => go(-1)} aria-label="Previous plate">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next plate">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="plate-fade" key={`body-${index}`}>
            <h2>{plate.name}</h2>
            <dl>
              {plate.rows.map((r) => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd className={r.todo ? "todo" : undefined}>{r.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
