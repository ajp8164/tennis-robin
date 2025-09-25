import { getSetState } from './index';

export type MatchStatus =
  | 'team1-wins'
  | 'team2-wins'
  | 'in-progress'
  | 'not-started';

type MatchStateResult = {
  status: MatchStatus;
  setScores: number[]; // [team1, team2]
};

export const getMatchState = (
  maxSetsPerMatch: number,
  maxGamesPerSet: number,
  setGameTeamScores?: number[][][][],
): MatchStateResult => {
  // Must have scores for sets, game and team otherwise the set has not yet started.
  if (!setGameTeamScores || !setGameTeamScores[0]) {
    return {
      status: 'not-started',
      setScores: [0, 0], // No set wins in the match for either team
    };
  }

  let team1TeamWins = 0;
  let team2TeamWins = 0;
  let team1WinsMatch = false;
  let team2WinsMatch = false;

  // For each set in the match count up the number of wins for each team.
  for (let s = 0; s < maxSetsPerMatch; s++) {
    const setState = getSetState(maxGamesPerSet, setGameTeamScores[s]);

    if (setState.status === 'team1-wins') {
      team1TeamWins = team1TeamWins + 1;
    }

    if (setState.status === 'team2-wins') {
      team2TeamWins = team2TeamWins + 1;
    }
  }

  const setsPlayed = team1TeamWins + team2TeamWins;

  // Team 1 wins if...
  // Team 1 set wins > team 2 set wins AND
  // Team 1 set wins is greater than 50% of max sets (majority of sets won)
  if (
    team1TeamWins > team2TeamWins &&
    setsPlayed > maxSetsPerMatch * 0.5 // Best n of m (e.g. 3 of 5)
  ) {
    team1WinsMatch = true;
  }

  // Check team 2.
  if (
    team2TeamWins > team1TeamWins &&
    setsPlayed > maxSetsPerMatch * 0.5 // Best n of m (e.g. 3 of 5)
  ) {
    team2WinsMatch = true;
  }

  const status: MatchStatus = team1WinsMatch
    ? 'team1-wins'
    : team2WinsMatch
      ? 'team2-wins'
      : 'in-progress';

  return {
    status,
    setScores: [team1TeamWins, team2TeamWins],
  } as MatchStateResult;
};
