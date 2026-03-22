import { useState } from "react";
import { levels, positions } from "../lib/constants";

const initialForm = {
  name: "",
  photoUrl: "",
  position: "Midfielder",
  skillLevel: "Intermediate",
};

export function PlayerForm({ onPlayerAdded, loading }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("http://localhost:4000/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Unable to save player.");
      }

      const player = await response.json();
      onPlayerAdded(player);
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-5 shadow-[var(--shadow)] backdrop-blur xl:sticky xl:top-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Roster Setup</p>
          <h2 className="mt-2 text-2xl font-black text-[color:var(--text-main)]">Player Management</h2>
          <p className="mt-2 text-sm text-[color:var(--text-soft)]">Register players before the draft starts.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
        <label className="text-sm text-[color:var(--text-soft)]">
          Name
          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-3 text-[color:var(--text-main)] outline-none transition focus:border-[color:var(--line-strong)]"
            placeholder="Alex Morgan"
          />
        </label>

        <label className="text-sm text-[color:var(--text-soft)]">
          Photo URL
          <input
            name="photoUrl"
            value={form.photoUrl}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-3 text-[color:var(--text-main)] outline-none transition focus:border-[color:var(--line-strong)]"
            placeholder="https://..."
          />
        </label>

        <label className="text-sm text-[color:var(--text-soft)]">
          Position
          <select
            name="position"
            value={form.position}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-3 text-[color:var(--text-main)] outline-none transition focus:border-[color:var(--line-strong)]"
          >
            {positions.map((position) => (
              <option key={position.value} value={position.value}>
                {position.value}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-[color:var(--text-soft)]">
          Skill Level
          <select
            name="skillLevel"
            value={form.skillLevel}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-3 text-[color:var(--text-main)] outline-none transition focus:border-[color:var(--line-strong)]"
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading || saving}
        className="mt-5 w-full rounded-2xl bg-[color:var(--accent)] px-4 py-3 font-semibold text-[color:var(--accent-text)] transition hover:bg-[color:var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : "Add Player"}
      </button>
    </form>
  );
}
