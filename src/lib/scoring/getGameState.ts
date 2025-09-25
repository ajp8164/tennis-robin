import { TeamSides } from 'types/sportEvent';

type GameStatus = 'team1-wins' | 'team2-wins' | 'in-progress' | 'not-started';

type GameStateResult = {
  status: GameStatus;
  scores: number[]; // [team1, team2]
};

const team1 = TeamSides.indexOf('Team1');
const team2 = TeamSides.indexOf('Team2');

export const getGameState = (teamScores?: number[][]): GameStateResult => {
  if (!teamScores) {
    return {
      status: 'not-started',
      scores: [0, 0], // No score for either team
    };
  }

  // Get index of last game score in the set.
  const lastScoreInGameIndex = teamScores[0].length - 1;
  let team1WinsGame = false;
  let team2WinsGame = false;

  // Team 1 wins game if...
  // Team 1 score > team 2 score AND
  // Team 1 score is at least team 2 score + 20 (win by 2 where score differential is 10) AND
  // Team 1 score is >= 50 (50 is win in 3 serves - 0,15,30,40)
  const team1Score = teamScores[team1][lastScoreInGameIndex];
  const team2Score = teamScores[team2][lastScoreInGameIndex];

  // Check if team 1 is winner.
  if (
    team1Score > team2Score &&
    team1Score - team2Score >= 20 &&
    team1Score >= 50
  ) {
    team1WinsGame = true;
  }

  // Check if team 2 is winner.
  if (
    team2Score > team1Score &&
    team2Score - team1Score >= 20 &&
    team2Score >= 50
  ) {
    team2WinsGame = true;
  }

  const status: GameStatus = team1WinsGame
    ? 'team1-wins'
    : team2WinsGame
      ? 'team2-wins'
      : 'in-progress';

  return {
    status,
    scores: [team1Score, team2Score],
  } as GameStateResult;
};
