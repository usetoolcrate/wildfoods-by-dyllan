import { useCallback, useEffect, useState } from "react";
import { SITE_STYLES } from "@/pages/site-shared";
import {
  LoginForm,
  buttonStyle,
  labelStyle,
  secondaryButtonStyle,
  wrapStyle,
} from "@/pages/site/AdminRecipesPage";

type ApiAnswer = { n: number; title: string; picked: string[]; note: string };

type ApiResponse = {
  id: number;
  form: string;
  submission_id: string;
  answers: ApiAnswer[];
  created_at: string;
  updated_at: string;
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ResponseCard({
  r,
  onDelete,
}: {
  r: ApiResponse;
  onDelete: (id: number) => void;
}) {
  const answered = r.answers.filter(a => a.picked.length > 0 || a.note).length;
  const edited = r.updated_at !== r.created_at;
  return (
    <article
      style={{
        border: "1px solid var(--line)",
        background: "#fff",
        padding: "22px 22px 8px",
        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 18px",
          alignItems: "baseline",
          marginBottom: 14,
        }}
      >
        <span style={labelStyle}>Response #{r.id}</span>
        <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>
          Sent {formatWhen(r.created_at)}
          {edited ? ` · updated ${formatWhen(r.updated_at)}` : ""} · {answered}{" "}
          of {r.answers.length} answered
        </span>
      </div>
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {r.answers.map(a => {
          const skipped = a.picked.length === 0 && !a.note;
          return (
            <li
              key={a.n}
              style={{
                display: "grid",
                gridTemplateColumns: "2.2em minmax(0,1fr)",
                gap: "0 10px",
                padding: "12px 0",
                borderTop: "1px dashed var(--line)",
              }}
            >
              <span style={{ ...labelStyle, marginBottom: 0, paddingTop: 3 }}>
                {String(a.n).padStart(2, "0")}
              </span>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--pine)",
                    marginBottom: 4,
                  }}
                >
                  {a.title}
                </div>
                {skipped ? (
                  <div
                    style={{ color: "var(--ink-soft)", fontStyle: "italic" }}
                  >
                    Skipped
                  </div>
                ) : null}
                {a.picked.map(p => (
                  <div key={p}>{p}</div>
                ))}
                {a.note ? (
                  <div
                    style={{
                      marginTop: a.picked.length ? 6 : 0,
                      whiteSpace: "pre-wrap",
                      color: "var(--ink-soft)",
                    }}
                  >
                    “{a.note}”
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
      <div style={{ padding: "14px 0", borderTop: "1px dashed var(--line)" }}>
        <button
          type="button"
          style={{ ...secondaryButtonStyle, padding: "6px 12px", fontSize: 11 }}
          onClick={() => onDelete(r.id)}
        >
          Delete response
        </button>
      </div>
    </article>
  );
}

export function AdminQuestionsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [responses, setResponses] = useState<ApiResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Questionnaire answers — Wild Foods by Dyllan";
    fetch("/api/admin/session")
      .then(r => r.json())
      .then(d => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false));
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/questions");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResponses(data.responses ?? []);
    } catch {
      setError("Couldn't load answers. Refresh to try again.");
    }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  async function handleDelete(id: number) {
    await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
    setConfirmId(null);
    load();
  }

  if (authed === null) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
        <div style={wrapStyle}>Loading…</div>
      </>
    );
  }

  if (!authed) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
        <LoginForm
          title="Questionnaire Answers"
          onLoggedIn={() => setAuthed(true)}
        />
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
      <div style={wrapStyle}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <h1 style={{ fontSize: 28, margin: 0 }}>Questionnaire answers</h1>
          <button type="button" style={buttonStyle} onClick={load}>
            Refresh
          </button>
        </div>
        <p style={{ color: "var(--ink-soft)", marginBottom: 30 }}>
          Answers sent from <a href="/questions">/questions</a>. If the same
          person sends again from the same device, their response updates in
          place.
        </p>

        {error ? <p style={{ color: "var(--rust-deep)" }}>{error}</p> : null}
        {responses === null && !error ? <p>Loading…</p> : null}
        {responses && responses.length === 0 ? <p>No answers yet.</p> : null}

        {confirmId !== null ? (
          <div
            style={{
              border: "1px solid var(--rust-deep)",
              padding: 16,
              marginBottom: 24,
              background: "#fff",
            }}
          >
            <p style={{ margin: "0 0 12px" }}>
              Delete response #{confirmId}? This can't be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                style={buttonStyle}
                onClick={() => handleDelete(confirmId)}
              >
                Delete
              </button>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => setConfirmId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {(responses ?? []).map(r => (
          <ResponseCard key={r.id} r={r} onDelete={setConfirmId} />
        ))}
      </div>
    </>
  );
}
