import { useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, KeyRound, Moon, ShieldCheck, SunMedium, Trash2, Upload } from "lucide-react";
import { levels, positions } from "../lib/constants";

const initialForm = {
  name: "",
  position: "Midfielder",
  skillLevel: "Intermediate",
  photo: null,
};

function resolvePhotoUrl(photoUrl) {
  if (!photoUrl) {
    return "";
  }

  return photoUrl.startsWith("/uploads/") ? `http://localhost:4000${photoUrl}` : photoUrl;
}

export function AdminPage({ theme, setTheme }) {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem("ftb-admin-key") || "");
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("ftb-admin-key", adminKey);
  }, [adminKey]);

  async function loadPlayers() {
    const response = await fetch("http://localhost:4000/api/players");
    const data = await response.json();
    setPlayers(data);
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  function handleChange(event) {
    const { name, value, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: files ? files[0] ?? null : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("position", form.position);
      body.append("skillLevel", form.skillLevel);

      if (form.photo) {
        body.append("photo", form.photo);
      }

      const response = await fetch("http://localhost:4000/api/admin/players", {
        method: "POST",
        headers: {
          "x-admin-key": adminKey,
        },
        body,
      });

      if (!response.ok) {
        throw new Error("Failed to create player. Check your admin key.");
      }

      setStatus("Player created.");
      setForm(initialForm);
      await loadPlayers();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(playerId) {
    setError("");
    setStatus("");

    try {
      const response = await fetch(`http://localhost:4000/api/admin/players/${playerId}`, {
        method: "DELETE",
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete player. Check your admin key.");
      }

      setStatus("Player deleted.");
      await loadPlayers();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="min-h-screen text-[color:var(--text-main)]">
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-6 shadow-[var(--shadow)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--badge)] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[color:var(--accent)]">
                <ShieldCheck size={14} />
                Owner Admin
              </p>
              <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">Manage Roster</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-soft)] sm:text-lg">
                This page is for you only. Add players with image uploads and remove players from the roster without exposing controls on the public site.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-3 text-sm font-medium transition hover:border-[color:var(--line-strong)]"
              >
                <ArrowLeft size={16} />
                Back To Draft
              </a>
              <button
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-3 text-sm font-medium transition hover:border-[color:var(--line-strong)]"
              >
                {theme === "light" ? <Moon size={16} /> : <SunMedium size={16} />}
                {theme === "light" ? "Dark theme" : "Light theme"}
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-6 shadow-[var(--shadow)] backdrop-blur"
          >
            <div className="space-y-4">
              <div>
                <p className="font-section text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Access Key</p>
                <label className="mt-2 block text-sm text-[color:var(--text-soft)]">
                  Admin key
                  <div className="relative mt-1">
                    <KeyRound size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
                    <input
                      type="password"
                      value={adminKey}
                      onChange={(event) => setAdminKey(event.target.value)}
                      className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] py-3 pl-11 pr-4 text-[color:var(--text-main)] outline-none transition focus:border-[color:var(--line-strong)]"
                      placeholder="Enter admin key"
                    />
                  </div>
                </label>
              </div>

              <div>
                <p className="font-section text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">New Player</p>
                <div className="mt-3 grid gap-3">
                  <label className="text-sm text-[color:var(--text-soft)]">
                    Name
                    <input
                      required
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-3 text-[color:var(--text-main)] outline-none transition focus:border-[color:var(--line-strong)]"
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

                  <label className="text-sm text-[color:var(--text-soft)]">
                    Player image
                    <div className="mt-1 rounded-2xl border border-dashed border-[color:var(--line-strong)] bg-[color:var(--panel-soft)] p-4">
                      <div className="mb-3 flex items-center gap-2 text-[color:var(--accent)]">
                        <ImagePlus size={16} />
                        Upload from your computer
                      </div>
                      <input
                        type="file"
                        name="photo"
                        accept="image/*"
                        onChange={handleChange}
                        className="block w-full text-sm text-[color:var(--text-soft)] file:mr-4 file:rounded-xl file:border-0 file:bg-[color:var(--accent)] file:px-4 file:py-2 file:font-medium file:text-[color:var(--accent-text)]"
                      />
                    </div>
                  </label>
                </div>
              </div>

              {error ? <p className="text-sm text-rose-400">{error}</p> : null}
              {status ? <p className="text-sm text-[color:var(--accent)]">{status}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-3 font-semibold text-[color:var(--accent-text)] transition hover:bg-[color:var(--accent-strong)] disabled:opacity-60"
              >
                <Upload size={16} />
                {loading ? "Saving..." : "Create Player"}
              </button>
            </div>
          </form>

          <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-6 shadow-[var(--shadow)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-section text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Roster</p>
                <h2 className="font-display mt-2 text-2xl font-black">Current Players</h2>
              </div>
              <button
                onClick={loadPlayers}
                className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-3 text-sm font-medium transition hover:border-[color:var(--line-strong)]"
              >
                Refresh
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="overflow-hidden rounded-[1.5rem] border border-[color:var(--line)] bg-[color:var(--panel-soft)]"
                >
                  <div className="h-44 bg-gradient-to-br from-emerald-700/60 via-teal-600/30 to-slate-900">
                    {player.photoUrl ? (
                      <img src={resolvePhotoUrl(player.photoUrl)} alt={player.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl font-black text-white/20">
                        {player.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="font-section text-lg font-semibold">{player.name}</h3>
                      <p className="mt-1 text-sm text-[color:var(--text-soft)]">
                        {player.position} - {player.skillLevel}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(player.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-400/15"
                    >
                      <Trash2 size={16} />
                      Delete Player
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
