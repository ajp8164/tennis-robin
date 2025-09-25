import { getSetState } from './index';

export type MatchStatus =
  | 'home-wins'
  | 'away-wins'
  | 'in-progress'
  | 'not-started';

type MatchStateResult = {
  status: MatchStatus;
  setScores: number[]; // [home, away]
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

  let homeTeamWins = 0;
  let awayTeamWins = 0;
  let homeWinsMatch = false;
  let awayWinsMatch = false;

  // For each set in the match count up the number of wins for each team.
  for (let s = 0; s < maxSetsPerMatch; s++) {
    const setState = getSetState(maxGamesPerSet, setGameTeamScores[s]);

    if (setState.status === 'home-wins') {
      homeTeamWins = homeTeamWins + 1;
    }

    if (setState.status === 'away-wins') {
      awayTeamWins = awayTeamWins + 1;
    }
  }

  const setsPlayed = homeTeamWins + awayTeamWins;

  // Home wins if...
  // Home set wins > away set wins AND
  // Home set wins is greater than 50% of max sets (majority of sets won)
  if (
    homeTeamWins > awayTeamWins &&
    setsPlayed > maxSetsPerMatch * 0.5 // Best n of m (e.g. 3 of 5)
  ) {
    homeWinsMatch = true;
  }

  // Away wins if...
  // Awy set wins > away set wins AND
  // Away set wins is greater than 50% of max sets (majority of sets won)
  if (
    awayTeamWins > homeTeamWins &&
    setsPlayed > maxSetsPerMatch * 0.5 // Best n of m (e.g. 3 of 5)
  ) {
    awayWinsMatch = true;
  }

  const status: MatchStatus = homeWinsMatch
    ? 'home-wins'
    : awayWinsMatch
      ? 'away-wins'
      : 'in-progress';

  return {
    status,
    setScores: [homeTeamWins, awayTeamWins],
  } as MatchStateResult;
};
