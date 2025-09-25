// import { TeamSides } from 'types/sportEvent';

import { getGameState } from './index';

type SetStatus = 'home-wins' | 'away-wins' | 'in-progress' | 'not-started';

type SetStateResult = {
  status: SetStatus;
  gameScores: number[]; // [home, away]
};

export const getSetState = (
  maxGamesPerSet: number,
  gameTeamScores?: number[][][],
): SetStateResult => {
  // Must have scores for game and team otherwise the set has not yet started.
  if (!gameTeamScores || !gameTeamScores[0] || !gameTeamScores[0][0]) {
    return {
      status: 'not-started',
      gameScores: [0, 0], // No game wins in the set for either team
    };
  }

  const gamesPlayed = gameTeamScores.length;
  let homeTeamWins = 0;
  let awayTeamWins = 0;
  let homeWinsSet = false;
  let awayWinsSet = false;

  // For each game in the set count up the number of wins for each team.
  for (let g = 0; g < gamesPlayed; g++) {
    const gameState = getGameState(gameTeamScores[g]);

    if (gameState.status === 'home-wins') {
      homeTeamWins += 1;
    }

    if (gameState.status === 'away-wins') {
      awayTeamWins += 1;
    }
  }

  // Home wins set if...
  // Home wins > away wins AND
  // Home wins is at least 2 more than away wins (win by 2) OR home team wins is 7 (tie break set) AND
  // Home wins is greater than 50% of max games (majority of games won)
  if (
    homeTeamWins > awayTeamWins &&
    (homeTeamWins - awayTeamWins >= 2 || homeTeamWins === 7) &&
    // homeTeamWins > maxGamesPerSet * 0.5 // Best n of m (e.g. 3 of 5) NYI
    homeTeamWins >= maxGamesPerSet
  ) {
    homeWinsSet = true;
  }

  // Check for away wins set
  if (
    awayTeamWins > homeTeamWins &&
    (awayTeamWins - homeTeamWins >= 2 || awayTeamWins === 7) &&
    // awayTeamWins > maxGamesPerSet * 0.5 // Best n of m (e.g. 3 of 5) NYI
    awayTeamWins >= maxGamesPerSet
  ) {
    awayWinsSet = true;
  }

  const status: SetStatus = homeWinsSet
    ? 'home-wins'
    : awayWinsSet
      ? 'away-wins'
      : 'in-progress';

  return {
    status,
    gameScores: [homeTeamWins, awayTeamWins],
  } as SetStateResult;
};
