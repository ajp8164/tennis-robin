import { getGameState } from './index';

type SetStatus = 'team1-wins' | 'team2-wins' | 'in-progress' | 'not-started';

type SetStateResult = {
  status: SetStatus;
  gameScores: number[]; // [team1, team2]
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
  let team1TeamWins = 0;
  let team2TeamWins = 0;
  let team1WinsSet = false;
  let team2WinsSet = false;

  // For each game in the set count up the number of wins for each team.
  for (let g = 0; g < gamesPlayed; g++) {
    const gameState = getGameState(gameTeamScores[g]);

    if (gameState.status === 'team1-wins') {
      team1TeamWins += 1;
    }

    if (gameState.status === 'team2-wins') {
      team2TeamWins += 1;
    }
  }

  // Team 1 wins set if...
  // Team 1 wins > team 2 wins AND
  // Team 1 wins is at least 2 more than team 2 wins (win by 2) OR team 1 wins is 7 (tie break set) AND
  // Team 1 wins is greater than 50% of max games (majority of games won)
  if (
    team1TeamWins > team2TeamWins &&
    (team1TeamWins - team2TeamWins >= 2 || team1TeamWins === 7) &&
    // team1TeamWins > maxGamesPerSet * 0.5 // Best n of m (e.g. 3 of 5) NYI
    team1TeamWins >= maxGamesPerSet
  ) {
    team1WinsSet = true;
  }

  // Check for team 2 wins set.
  if (
    team2TeamWins > team1TeamWins &&
    (team2TeamWins - team1TeamWins >= 2 || team2TeamWins === 7) &&
    // team2TeamWins > maxGamesPerSet * 0.5 // Best n of m (e.g. 3 of 5) NYI
    team2TeamWins >= maxGamesPerSet
  ) {
    team2WinsSet = true;
  }

  const status: SetStatus = team1WinsSet
    ? 'team1-wins'
    : team2WinsSet
      ? 'team2-wins'
      : 'in-progress';

  return {
    status,
    gameScores: [team1TeamWins, team2TeamWins],
  } as SetStateResult;
};
