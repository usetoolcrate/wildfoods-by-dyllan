import { useEffect, useRef, useState } from "react";

/* "One plate" gallery. Plates come from /admin/plates (via /api/site); the
   arrows only appear once there are two or more. */
type Plate = { id: number; name: string; image: string | null; alt: string; rows: { label: string; text: string }[] };

export function PlateGallery() {
  const [plates, setPlates] = useState<Plate[]>([]);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/site?action=plates")
      .then((r) => (r.ok ? r.json() : { plates: [] }))
      .then((d) => {
        if (!live) return;
        setPlates(d.plates ?? []);
        for (const p of d.plates ?? []) if (p.image) new Image().src = p.image;
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  if (!plates.length) return null;
  const plate = plates[Math.min(index, plates.length - 1)];
  const many = plates.length > 1;
  const go = (step: number) => setIndex((i) => (i + step + plates.length) % plates.length);

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
        <figure className={`dish-img plate-fade${plate.image ? "" : " slot"}`} key={`img-${plate.id}`}>
          {plate.image ? (
            <img src={plate.image} alt={plate.alt || plate.name} />
          ) : (
            <div className="slot-note">
              <span className="label">Photo coming</span>
            </div>
          )}
        </figure>
        <div>
          <div className="label-row">
            <div className="label">{many ? "Signature plates" : "One plate"}</div>
            {many && (
              <div className="plate-ctrl">
                <span className="plate-count" aria-live="polite">
                  {String(index + 1).padStart(2, "0")} / {String(plates.length).padStart(2, "0")}
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
          <div className="plate-fade" key={`body-${plate.id}`}>
            <h2>{plate.name}</h2>
            <dl>
              {plate.rows.map((r) => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>{r.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
