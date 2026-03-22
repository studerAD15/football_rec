import { AnimatePresence, motion } from "framer-motion";
import { Crown, Sparkles, Users } from "lucide-react";
import { positions } from "../lib/constants";
import {
  getNextCaptain,
  getPlayerWeight,
  getTeamStrength,
  recommendPlayersForCaptain,
} from "../lib/draft";
import { assetUrl } from "../lib/api";

function resolvePhotoUrl(photoUrl) {
  if (!photoUrl) {
    return "";
  }

  return assetUrl(photoUrl);
}

function PositionBadge({ position }) {
  const match = positions.find((item) => item.value === position);
  const Icon = match?.icon ?? Users;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--panel-soft)] px-3 py-1 text-xs text-[color:var(--text-soft)]">
      <Icon size={14} />
      {position}
    </span>
  );
}

function TeamCard({ captain, team, active }) {
  const strength = getTeamStrength(team);

  return (
    <div
      className={`rounded-[1.75rem] border p-5 transition ${
        active
          ? "border-[color:var(--line-strong)] bg-[color:var(--badge)]"
          : "border-[color:var(--line)] bg-[color:var(--panel-soft)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown size={18} className={active ? "text-[color:var(--accent)]" : "text-[color:var(--text-muted)]"} />
          <h3 className="font-semibold text-[color:var(--text-main)]">Captain {captain}</h3>
        </div>
        <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-3 py-1 text-sm text-[color:var(--accent)]">
          Strength {strength}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {team.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[color:var(--line)] px-3 py-4 text-sm text-[color:var(--text-muted)]">
            No players drafted yet.
          </p>
        ) : (
          team.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-3 py-3"
            >
              <div>
                <p className="font-medium text-[color:var(--text-main)]">{player.name}</p>
                <p className="text-xs text-[color:var(--text-muted)]">{player.skillLevel}</p>
              </div>
              <PositionBadge position={player.position} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function DraftBoard({ players }) {
  const teams = players.teams;
  const recommended = recommendPlayersForCaptain(players.turn, teams, players.availablePlayers);
  const recommendedIds = new Set(recommended.slice(0, 3).map((player) => player.id));

  function handlePick(playerId) {
    players.onPick(playerId);
  }

  const strengthGap = Math.abs(getTeamStrength(teams.A) - getTeamStrength(teams.B));
  const nextCaptain = getNextCaptain(players.turn);

  return (
    <div className="grid gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-section text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Main Arena</p>
            <h2 className="font-display mt-2 text-3xl font-black text-[color:var(--text-main)] sm:text-4xl">Draft Arena</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)] sm:text-base">
              Captain {players.turn} picks now. Recommendations now favor Pro players first, then Intermediate, then Beginner.
            </p>
          </div>
          <div className="rounded-full border border-[color:var(--line-strong)] bg-[color:var(--badge)] px-4 py-2 text-sm text-[color:var(--accent)]">
            Current strength gap: {strengthGap}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <TeamCard captain="A" team={teams.A} active={players.turn === "A"} />
          <TeamCard captain="B" team={teams.B} active={players.turn === "B"} />
        </div>
      </div>

      <div className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-6">
        <div className="mb-5 flex items-center gap-2 text-sm text-[color:var(--accent)]">
          <Sparkles size={16} />
          If Captain {players.turn} picks now, Captain {nextCaptain} gets the next turn.
        </div>

        <AnimatePresence>
          <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
            {recommended.length === 0 ? (
              <div className="col-span-full rounded-[1.75rem] border border-dashed border-[color:var(--line)] bg-[color:var(--panel-soft)] p-8 text-center">
                <p className="font-display text-lg font-semibold text-[color:var(--text-main)]">
                  {players.pool.length === 0 ? "No players selected for today" : "Draft complete"}
                </p>
                <p className="mt-2 text-sm text-[color:var(--text-soft)]">
                  {players.pool.length === 0
                    ? "Choose today's playing squad below and start the draft."
                    : "All available players have been assigned to a team."}
                </p>
              </div>
            ) : null}
            {recommended.map((player, index) => (
              <motion.button
                key={player.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.24, delay: index * 0.04 }}
                onClick={() => handlePick(player.id)}
                className={`overflow-hidden rounded-[1.9rem] border text-left transition hover:-translate-y-1 ${
                  recommendedIds.has(player.id)
                    ? "border-[color:var(--line-strong)] bg-[color:var(--badge)]"
                    : "border-[color:var(--line)] bg-[color:var(--panel-soft)] hover:border-[color:var(--line-strong)]"
                }`}
              >
                <div className="relative h-64 bg-gradient-to-br from-emerald-700/70 via-teal-700/40 to-slate-950 sm:h-72">
                  {player.photoUrl ? (
                    <img
                      src={resolvePhotoUrl(player.photoUrl)}
                      alt={player.name}
                      className="h-full w-full object-cover opacity-90"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl font-black text-white/20">
                      {player.name.slice(0, 1)}
                    </div>
                  )}
                  {recommendedIds.has(player.id) ? (
                    <span className="absolute right-3 top-3 rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-text)]">
                      Recommended
                    </span>
                  ) : null}
                </div>

                <div className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-[color:var(--text-main)]">{player.name}</h3>
                      <p className="text-sm text-[color:var(--text-soft)]">{player.skillLevel}</p>
                    </div>
                    <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-3 py-1 text-sm text-[color:var(--text-main)]">
                      +{getPlayerWeight(player)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <PositionBadge position={player.position} />
                    <span className="text-xs text-[color:var(--text-muted)]">
                      Priority {getPlayerWeight(player)} - Balance delta {player.recommendationScore}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
