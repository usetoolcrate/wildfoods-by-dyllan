import { useEffect, useState } from "react";
import { SITE_STYLES } from "@/pages/site-shared";

type ApiRecipe = {
  id: number;
  slug: string;
  title: string;
  tag: string;
  time: string;
  teaser: string;
  ingredients: string[];
  steps: string[];
  image_url: string | null;
  published: boolean;
};

type FormState = {
  id: number | null;
  title: string;
  tag: string;
  time: string;
  teaser: string;
  ingredients: string; // newline-separated in the form
  steps: string; // newline-separated in the form
  imageUrl: string | null;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  tag: "",
  time: "",
  teaser: "",
  ingredients: "",
  steps: "",
  imageUrl: null,
  published: true,
};

export const wrapStyle: React.CSSProperties = {
  maxWidth: 880,
  margin: "0 auto",
  padding: "48px 24px 80px",
  fontFamily: "Georgia, serif",
  color: "var(--ink)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--paper-dark)",
  background: "#fff",
  fontFamily: "Georgia, serif",
  fontSize: 15,
  marginBottom: 14,
};

export const labelStyle: React.CSSProperties = {
  fontFamily: "'Courier New', monospace",
  fontSize: 11,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--ink-soft)",
  display: "block",
  marginBottom: 4,
};

export const buttonStyle: React.CSSProperties = {
  fontFamily: "'Courier New', monospace",
  fontSize: 12,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  padding: "10px 20px",
  background: "var(--pine)",
  color: "var(--paper)",
  border: "none",
  cursor: "pointer",
};

export const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "transparent",
  color: "var(--ink)",
  border: "1px solid var(--ink)",
};

export function LoginForm({ onLoggedIn, title = "Recipe Admin" }: { onLoggedIn: () => void; title?: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Wrong password.");
        return;
      }
      onLoggedIn();
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ ...wrapStyle, maxWidth: 380 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>{title}</h1>
      <form onSubmit={submit}>
        <label style={labelStyle}>Password</label>
        <input
          type="password"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error ? <p style={{ color: "var(--rust-deep)", fontSize: 13 }}>{error}</p> : null}
        <button type="submit" style={buttonStyle} disabled={busy}>
          {busy ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}

function RecipeForm({
  form,
  setForm,
  onCancel,
  onSaved,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, filename: file.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm({ ...form, imageUrl: data.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      title: form.title,
      tag: form.tag,
      time: form.time,
      teaser: form.teaser,
      ingredients: form.ingredients.split("\n").map((s) => s.trim()).filter(Boolean),
      steps: form.steps.split("\n").map((s) => s.trim()).filter(Boolean),
      imageUrl: form.imageUrl,
      published: form.published,
    };
    try {
      const url = form.id ? `/api/recipes/${form.id}` : "/api/recipes";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ border: "1px solid var(--paper-dark)", padding: 24, marginBottom: 32 }}>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>{form.id ? "Edit recipe" : "Add a new recipe"}</h2>

      <label style={labelStyle}>Title</label>
      <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Category</label>
          <input style={inputStyle} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="e.g. Foraged Fruit" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Time</label>
          <input style={inputStyle} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="e.g. 45 min" />
        </div>
      </div>

      <label style={labelStyle}>Short description</label>
      <textarea
        style={{ ...inputStyle, minHeight: 60 }}
        value={form.teaser}
        onChange={(e) => setForm({ ...form, teaser: e.target.value })}
      />

      <label style={labelStyle}>Ingredients (one per line)</label>
      <textarea
        style={{ ...inputStyle, minHeight: 120, fontFamily: "monospace", fontSize: 13 }}
        value={form.ingredients}
        onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
      />

      <label style={labelStyle}>Steps (one per line)</label>
      <textarea
        style={{ ...inputStyle, minHeight: 120, fontFamily: "monospace", fontSize: 13 }}
        value={form.steps}
        onChange={(e) => setForm({ ...form, steps: e.target.value })}
      />

      <label style={labelStyle}>Photo</label>
      <div style={{ marginBottom: 14 }}>
        {form.imageUrl ? (
          <img src={form.imageUrl} alt="" style={{ maxWidth: 200, display: "block", marginBottom: 8 }} />
        ) : null}
        <input type="file" accept="image/*" onChange={handleImagePick} disabled={uploading} />
        {uploading ? <span style={{ fontSize: 12, marginLeft: 8 }}>Uploading…</span> : null}
      </div>

      <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
        />
        Published (visible on the live site)
      </label>

      {error ? <p style={{ color: "var(--rust-deep)", fontSize: 13 }}>{error}</p> : null}

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button type="submit" style={buttonStyle} disabled={saving || uploading}>
          {saving ? "Saving…" : "Save recipe"}
        </button>
        <button type="button" style={secondaryButtonStyle} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function AdminRecipesPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [recipes, setRecipes] = useState<ApiRecipe[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    document.title = "Recipe Admin — Wild Foods by Dyllan";
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false));
  }, []);

  async function loadRecipes() {
    setLoadingList(true);
    try {
      const res = await fetch("/api/recipes");
      const data = await res.json();
      setRecipes(data.recipes || []);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    if (authed) loadRecipes();
  }, [authed]);

  async function seedIfEmpty() {
    await fetch("/api/admin/seed", { method: "POST" });
    loadRecipes();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this recipe? This can't be undone.")) return;
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    loadRecipes();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
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
        <LoginForm onLoggedIn={() => setAuthed(true)} />
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
      <div style={wrapStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28 }}>Recipe Admin</h1>
          <button type="button" style={secondaryButtonStyle} onClick={handleLogout}>
            Log out
          </button>
        </div>

        {form ? (
          <RecipeForm
            form={form}
            setForm={setForm}
            onCancel={() => setForm(null)}
            onSaved={() => {
              setForm(null);
              loadRecipes();
            }}
          />
        ) : (
          <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
            <button type="button" style={buttonStyle} onClick={() => setForm({ ...EMPTY_FORM })}>
              + Add a recipe
            </button>
            {recipes.length === 0 ? (
              <button type="button" style={secondaryButtonStyle} onClick={seedIfEmpty}>
                Load starter recipes
              </button>
            ) : null}
          </div>
        )}

        {loadingList ? (
          <p>Loading recipes…</p>
        ) : recipes.length === 0 ? (
          <p>No recipes yet. Add your first one above.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--ink)" }}>
                <th style={{ ...labelStyle, textAlign: "left", padding: "8px 6px" }}>Title</th>
                <th style={{ ...labelStyle, textAlign: "left", padding: "8px 6px" }}>Category</th>
                <th style={{ ...labelStyle, textAlign: "left", padding: "8px 6px" }}>Status</th>
                <th style={{ ...labelStyle, textAlign: "left", padding: "8px 6px" }}></th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--paper-dark)" }}>
                  <td style={{ padding: "8px 6px" }}>{r.title}</td>
                  <td style={{ padding: "8px 6px" }}>{r.tag}</td>
                  <td style={{ padding: "8px 6px" }}>{r.published ? "Published" : "Hidden"}</td>
                  <td style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>
                    <button
                      type="button"
                      style={{ ...secondaryButtonStyle, padding: "4px 10px", marginRight: 8 }}
                      onClick={() =>
                        setForm({
                          id: r.id,
                          title: r.title,
                          tag: r.tag,
                          time: r.time,
                          teaser: r.teaser,
                          ingredients: r.ingredients.join("\n"),
                          steps: r.steps.join("\n"),
                          imageUrl: r.image_url,
                          published: r.published,
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      style={{ ...secondaryButtonStyle, padding: "4px 10px" }}
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
