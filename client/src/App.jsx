import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, Linkedin, Moon, RefreshCcw, SunMedium, Trophy, Users } from "lucide-react";
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
    <main className="relative min-h-screen overflow-hidden text-[color:var(--text-main)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="stadium-spotlight stadium-spotlight-left" />
        <div className="stadium-spotlight stadium-spotlight-right" />
        <div className="pitch-glow" />
        <motion.div
          className="crowd-wave crowd-wave-top"
          animate={{ x: ["-6%", "4%", "-6%"] }}
          transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="crowd-wave crowd-wave-bottom"
          animate={{ x: ["4%", "-5%", "4%"] }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="ball-trail"
          animate={{ x: ["8vw", "82vw", "14vw"], y: ["16vh", "32vh", "58vh"] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <section className="mb-5 overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-4 shadow-[var(--shadow)] backdrop-blur sm:mb-8 sm:p-6 xl:p-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--badge)] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[color:var(--accent)]">
                  <Activity size={14} />
                  Matchday Draft
                </p>
                <h1 className="font-display text-[2.4rem] font-black leading-[0.92] tracking-tight sm:text-5xl lg:text-6xl">
                  Football Team Balancer
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-soft)] sm:mt-4 sm:leading-7 sm:text-lg">
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

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel-muted)] p-3 sm:p-4">
                <p className="font-section text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">All Players</p>
                <p className="mt-1 text-2xl font-black sm:mt-2 sm:text-3xl">{players.length}</p>
              </div>
              <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel-muted)] p-3 sm:p-4">
                <p className="font-section text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Playing Today</p>
                <p className="mt-1 text-2xl font-black sm:mt-2 sm:text-3xl">{todayPlayersCount}</p>
              </div>
              <div className="flex flex-wrap gap-2 rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel-muted)] p-3 sm:gap-3 sm:p-4 lg:justify-end">
                <button
                  onClick={loadPlayers}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-3 py-2.5 text-sm font-medium transition hover:border-[color:var(--line-strong)] sm:px-4 sm:py-3"
                >
                  <RefreshCcw size={16} />
                  Reload Players
                </button>
                <button
                  onClick={resetDraft}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-3 py-2.5 text-sm font-semibold text-[color:var(--accent-text)] transition hover:bg-[color:var(--accent-strong)] sm:px-4 sm:py-3"
                >
                  <Trophy size={16} />
                  Reset Draft
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-5 sm:space-y-8">
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

          <div className="mx-auto w-full max-w-[1180px]">
            <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-4 shadow-[var(--shadow)] backdrop-blur sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="font-section text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    Pre-Draft Selector
                  </p>
                  <h2 className="font-display mt-2 text-2xl font-black sm:mt-3 sm:text-3xl">Choose Today&apos;s Players</h2>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)] sm:mt-3 sm:leading-7 sm:text-base">
                    Keep the full roster above and select only the players who are playing today before you start the draft.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  <button
                    onClick={selectAllPlayers}
                    className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-3 py-2.5 text-sm font-medium transition hover:border-[color:var(--line-strong)] sm:px-4 sm:py-3"
                  >
                    All
                  </button>
                  <button
                    onClick={clearSelections}
                    className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-3 py-2.5 text-sm font-medium transition hover:border-[color:var(--line-strong)] sm:px-4 sm:py-3"
                  >
                    Clear
                  </button>
                  <button
                    onClick={startDraftWithSelectedPlayers}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-3 py-2.5 text-sm font-semibold text-[color:var(--accent-text)] transition hover:bg-[color:var(--accent-strong)] sm:px-4 sm:py-3"
                  >
                    <CheckCircle2 size={16} />
                    Start
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 md:grid-cols-4">
                {players.map((player) => {
                  const selected = selectedPlayerIds.includes(player.id);

                  return (
                    <button
                      key={player.id}
                      onClick={() => togglePlayerSelection(player.id)}
                      className={`rounded-[0.95rem] border px-3 py-2 text-left transition sm:rounded-[1.1rem] sm:px-3.5 sm:py-2.5 ${
                        selected
                          ? "border-[color:var(--line-strong)] bg-[color:var(--badge)]"
                          : "border-[color:var(--line)] bg-[color:var(--panel-soft)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-section truncate text-[13px] font-semibold text-[color:var(--text-main)] sm:text-sm">
                            {player.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[color:var(--text-soft)] sm:text-xs">{player.skillLevel}</p>
                        </div>
                        <span
                          className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-[9px] font-semibold sm:h-6 sm:min-w-6 sm:text-[10px] ${
                            selected
                              ? "border-[color:var(--line-strong)] bg-[color:var(--accent)] text-[color:var(--accent-text)]"
                              : "border-[color:var(--line)] text-[color:var(--text-muted)]"
                          }`}
                        >
                          {selected ? "IN" : ""}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel-muted)] p-3 text-sm text-[color:var(--text-soft)] sm:mt-5 sm:p-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Users size={16} className="text-[color:var(--accent)]" />
                  Selected today: <span className="font-semibold text-[color:var(--text-main)]">{todayPlayersCount}</span>
                  <span>Press <strong>Start</strong> to refresh the draft pool.</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="mx-auto mt-8 flex max-w-[1180px] flex-col items-center justify-between gap-3 rounded-[1.75rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-4 text-center text-sm text-[color:var(--text-soft)] shadow-[var(--shadow)] backdrop-blur sm:mt-10 sm:px-5 sm:text-left">
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
