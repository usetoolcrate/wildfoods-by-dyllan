import { useEffect, useState } from "react";

/* "From the table": reviews Dyllan chose to show in /admin/reviews, plus a
   link to his Google profile when he's added it there. */

type Review = { id: number; name: string; text: string; rating: number | null; source: string };

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [googleUrl, setGoogleUrl] = useState("");

  useEffect(() => {
    let live = true;
    fetch("/api/site?action=reviews")
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((d) => {
        if (!live) return;
        setReviews(d.reviews ?? []);
        setGoogleUrl(d.googleUrl ?? "");
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  if (!reviews.length) return null;

  return (
    <section className="sec s-sage">
      <div className="c">
        <div className="qmark" aria-hidden="true">
          “
        </div>
        <div className="label center">From the table</div>
        <div className="quotes">
          {reviews.slice(0, 4).map((r) => (
            <blockquote key={r.id}>
              {r.rating ? (
                <div className="stars" role="img" aria-label={`${r.rating} out of 5 stars`}>
                  {"★".repeat(r.rating)}
                </div>
              ) : null}
              <p>“{r.text}”</p>
              <cite>
                {r.name}
                {r.source === "google" ? " · Google review" : ""}
              </cite>
            </blockquote>
          ))}
        </div>
        {googleUrl ? (
          <div className="center" style={{ marginTop: 52 }}>
            <a className="tlink" href={googleUrl} target="_blank" rel="noopener">
              Read all reviews on Google
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
