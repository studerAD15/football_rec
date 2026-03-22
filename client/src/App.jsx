import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Linkedin, Lock, Moon, RefreshCcw, SunMedium, Trophy, Users } from "lucide-react";
import { AdminPage } from "./components/AdminPage";
import { DraftBoard } from "./components/DraftBoard";
import { apiUrl } from "./lib/api";

function buildInitialDraftState(players) {
  return {
    pool: players,
    availablePlayers: players,
    teams: {
      A: [],
      B: [],
    },
    turn: "A",
  };
}

export default function App() {
  const [players, setPlayers] = useState([]);
  const [draftState, setDraftState] = useState(buildInitialDraftState([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("ftb-theme") || "light");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const isAdminRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("ftb-theme", theme);
  }, [theme]);

  function buildTodayPool(sourcePlayers, selectedIds = selectedPlayerIds) {
    const picked = new Set(selectedIds);
    return sourcePlayers.filter((player) => picked.has(player.id));
  }

  async function loadPlayers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiUrl("/api/players"));

      if (!response.ok) {
        throw new Error("Unable to load players from the API.");
      }

      const data = await response.json();
      setPlayers(data);
      setSelectedPlayerIds(data.map((player) => player.id));
      setDraftState(buildInitialDraftState(data));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  function handlePick(playerId) {
    setDraftState((current) => {
      const selectedPlayer = current.availablePlayers.find((player) => player.id === playerId);

      if (!selectedPlayer) {
        return current;
      }

      return {
        ...current,
        teams: {
          ...current.teams,
          [current.turn]: [...current.teams[current.turn], selectedPlayer],
        },
        availablePlayers: current.availablePlayers.filter((player) => player.id !== playerId),
        turn: current.turn === "A" ? "B" : "A",
      };
    });
  }

  function resetDraft() {
    setDraftState(buildInitialDraftState(buildTodayPool(players)));
  }

  function togglePlayerSelection(playerId) {
    setSelectedPlayerIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId],
    );
  }

  function selectAllPlayers() {
    setSelectedPlayerIds(players.map((player) => player.id));
  }

  function clearSelections() {
    setSelectedPlayerIds([]);
    setDraftState(buildInitialDraftState([]));
  }

  function startDraftWithSelectedPlayers() {
    setDraftState(buildInitialDraftState(buildTodayPool(players)));
  }

  const todayPlayersCount = selectedPlayerIds.length;

  if (isAdminRoute) {
    return <AdminPage theme={theme} setTheme={setTheme} />;
  }

  return (
    <main className="min-h-screen text-[color:var(--text-main)]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-6 shadow-[var(--shadow)] backdrop-blur xl:p-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--badge)] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[color:var(--accent)]">
                  <Activity size={14} />
                  Matchday Draft
                </p>
                <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  Football Team Balancer
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-soft)] sm:text-lg">
                  Build balanced football squads with a live captain draft, real-time strength tracking,
                  and smart recommendations that keep every match competitive.
                </p>
              </div>

              <button
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-3 text-sm font-medium text-[color:var(--text-main)] transition hover:border-[color:var(--line-strong)]"
              >
                {theme === "light" ? <Moon size={16} /> : <SunMedium size={16} />}
                {theme === "light" ? "Dark theme" : "Light theme"}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel-muted)] p-4">
                <p className="font-section text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">All Players</p>
                <p className="mt-2 text-3xl font-black">{players.length}</p>
              </div>
              <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel-muted)] p-4">
                <p className="font-section text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Playing Today</p>
                <p className="mt-2 text-3xl font-black">{todayPlayersCount}</p>
              </div>
              <div className="flex flex-wrap gap-3 rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel-muted)] p-4 md:justify-end">
                <button
                  onClick={loadPlayers}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-3 text-sm font-medium transition hover:border-[color:var(--line-strong)]"
                >
                  <RefreshCcw size={16} />
                  Reload Players
                </button>
                <button
                  onClick={resetDraft}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-[color:var(--accent-text)] transition hover:bg-[color:var(--accent-strong)]"
                >
                  <Trophy size={16} />
                  Reset Draft
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-8">
          <div className="mx-auto w-full max-w-[1180px] space-y-4">
            {error ? (
              <div className="rounded-3xl border border-[color:var(--danger-line)] bg-[color:var(--danger)] px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
            <DraftBoard
              players={{
                ...draftState,
                onPick: handlePick,
              }}
            />
          </div>

          <div className="mx-auto grid w-full max-w-[1180px] gap-6 xl:grid-cols-[320px_1fr]">
            <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-6 shadow-[var(--shadow)] backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] p-3 text-[color:var(--accent)]">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="font-section text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    Owner Control
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-[color:var(--text-main)]">Roster is locked on public view</h2>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
                    Adding and deleting players is no longer available on the main website. Only protected backend
                    admin endpoints can change the roster.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-[color:var(--line)] bg-[color:var(--panel-soft)] p-4 text-sm text-[color:var(--text-soft)]">
                <p className="font-section text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                  Admin API
                </p>
                <p className="mt-3">Create player: <code>POST /api/admin/players</code></p>
                <p className="mt-2">Delete player: <code>DELETE /api/admin/players/:id</code></p>
                <p className="mt-2">Required header: <code>x-admin-key: your-secret-key</code></p>
              </div>
            </section>
            <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-6 shadow-[var(--shadow)] backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="font-section text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    Pre-Draft Selector
                  </p>
                  <h2 className="font-display mt-3 text-2xl font-black sm:text-3xl">Choose Today&apos;s Players</h2>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)] sm:text-base">
                    You can keep 20 or more players in the full roster, then select only the players who are
                    playing today. The draft arena will use only this selected group.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={selectAllPlayers}
                    className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-3 text-sm font-medium transition hover:border-[color:var(--line-strong)]"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelections}
                    className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-3 text-sm font-medium transition hover:border-[color:var(--line-strong)]"
                  >
                    Clear
                  </button>
                  <button
                    onClick={startDraftWithSelectedPlayers}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-[color:var(--accent-text)] transition hover:bg-[color:var(--accent-strong)]"
                  >
                    <CheckCircle2 size={16} />
                    Start Draft
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {players.map((player) => {
                  const selected = selectedPlayerIds.includes(player.id);

                  return (
                    <button
                      key={player.id}
                      onClick={() => togglePlayerSelection(player.id)}
                      className={`rounded-[1.2rem] border px-3 py-3 text-left transition ${
                        selected
                          ? "border-[color:var(--line-strong)] bg-[color:var(--badge)]"
                          : "border-[color:var(--line)] bg-[color:var(--panel-soft)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-section text-sm font-semibold text-[color:var(--text-main)] sm:text-base">
                            {player.name}
                          </p>
                          <p className="mt-1 text-xs text-[color:var(--text-soft)] sm:text-sm">{player.position} - {player.skillLevel}</p>
                        </div>
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                            selected
                              ? "border-[color:var(--line-strong)] bg-[color:var(--accent)] text-[color:var(--accent-text)]"
                              : "border-[color:var(--line)] text-[color:var(--text-muted)]"
                          }`}
                        >
                          {selected ? "OK" : ""}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel-muted)] p-4 text-sm text-[color:var(--text-soft)]">
                <div className="flex flex-wrap items-center gap-3">
                  <Users size={16} className="text-[color:var(--accent)]" />
                  Selected today: <span className="font-semibold text-[color:var(--text-main)]">{todayPlayersCount}</span>
                  <span>Draft pool updates when you press <strong>Start Draft</strong>.</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="mx-auto mt-10 flex max-w-[1180px] flex-col items-center justify-between gap-3 rounded-[1.75rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-4 text-center text-sm text-[color:var(--text-soft)] shadow-[var(--shadow)] backdrop-blur sm:flex-row sm:text-left">
          <p className="font-section uppercase tracking-[0.18em]">
            Created / Developed By Aditya Chhikara
          </p>
          <a
            href="https://www.linkedin.com/in/aditya-chhikara-9a7453306"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-4 py-2 font-medium text-[color:var(--text-main)] transition hover:border-[color:var(--line-strong)]"
          >
            <Linkedin size={16} />
            LinkedIn
          </a>
        </footer>
      </div>
    </main>
  );
}
