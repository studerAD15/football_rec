import { levelWeights } from "./constants";

export function getPlayerWeight(player) {
  return levelWeights[player.skillLevel] ?? 0;
}

export function getTeamStrength(team) {
  return team.reduce((sum, player) => sum + getPlayerWeight(player), 0);
}

export function getNextCaptain(turn) {
  return turn === "A" ? "B" : "A";
}

export function recommendPlayersForCaptain(targetCaptain, teams, availablePlayers) {
  const targetTeam = teams[targetCaptain];
  const rivalTeam = teams[targetCaptain === "A" ? "B" : "A"];
  const rivalStrength = getTeamStrength(rivalTeam);
  const targetStrength = getTeamStrength(targetTeam);

  return [...availablePlayers]
    .map((player) => {
      const projectedStrength = targetStrength + getPlayerWeight(player);
      const projectedGap = Math.abs(rivalStrength - projectedStrength);

      return {
        ...player,
        recommendationScore: projectedGap,
      };
    })
    .sort((left, right) => {
      const rightWeight = getPlayerWeight(right);
      const leftWeight = getPlayerWeight(left);

      if (rightWeight !== leftWeight) {
        return rightWeight - leftWeight;
      }

      return left.recommendationScore - right.recommendationScore;
    });
}
