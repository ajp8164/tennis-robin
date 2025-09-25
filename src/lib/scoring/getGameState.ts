import { TeamSides } from 'types/sportEvent';

type GameStatus = 'home-wins' | 'away-wins' | 'in-progress' | 'not-started';

type GameStateResult = {
  status: GameStatus;
  scores: number[]; // [home, away]
};

const home = TeamSides.indexOf('Home');
const away = TeamSides.indexOf('Away');

export const getGameState = (teamScores?: number[][]): GameStateResult => {
  if (!teamScores) {
    return {
      status: 'not-started',
      scores: [0, 0], // No score for either team
    };
  }

  // Get index of last game score in the set.
  const lastScoreInGameIndex = teamScores[0].length - 1;
  let homeWinsGame = false;
  let awayWinsGame = false;

  // Home wins game if...
  // Home score > away score AND
  // Home score is at least away score + 20 (win by 2 where score differential is 10) AND
  // Home score is >= 50 (50 is win in 3 serves - 0,15,30,40)
  const homeScore = teamScores[home][lastScoreInGameIndex];
  const awayScore = teamScores[away][lastScoreInGameIndex];

  // Check if home team is winner.
  if (homeScore > awayScore && homeScore - awayScore >= 20 && homeScore >= 50) {
    homeWinsGame = true;
  }

  // Check if away team is winner.
  if (awayScore > homeScore && awayScore - homeScore >= 20 && awayScore >= 50) {
    awayWinsGame = true;
  }

  const status: GameStatus = homeWinsGame
    ? 'home-wins'
    : awayWinsGame
      ? 'away-wins'
      : 'in-progress';

  return {
    status,
    scores: [homeScore, awayScore],
  } as GameStateResult;
};
