import { TeamSides } from 'types/sportEvent';

type SetState = 'home-wins' | 'away-wins' | 'in-progress' | 'not-started';

const home = TeamSides.indexOf('Home');
const away = TeamSides.indexOf('Away');

export const getSetState = (
  maxGames: number,
  gameTeamScores?: number[][][],
): SetState => {
  // Must have scores for game and team otherwise the set has not yet started.
  if (!gameTeamScores || !gameTeamScores[0] || !gameTeamScores[0][0]) {
    return 'not-started';
  }

  // Get index of last game score in the set.
  const lastGameInSetIndex = gameTeamScores[0][0].length - 1;
  const gamesPlayed = gameTeamScores.length;
  let homeTeamWins = 0;
  let awayTeamWins = 0;
  let homeWinsSet = false;
  let awayWinsSet = false;

  // Home wins game if...
  // Home score > away score AND
  // Home score is at least away score + 20 (win by 2 where score differential is 10) AND
  // Home score is >= 50 (50 is win in 3 serves - 0,15,30,40)
  for (let g = 0; g < gamesPlayed; g++) {
    const homeScore = gameTeamScores[g][home][lastGameInSetIndex];
    const awayScore = gameTeamScores[g][away][lastGameInSetIndex];

    // Check if home team is winner.
    if (
      homeScore > awayScore &&
      homeScore - awayScore >= 20 &&
      homeScore >= 50
    ) {
      homeTeamWins += 1;
    }

    // Check if away team is winner.
    if (
      awayScore > homeScore &&
      awayScore - homeScore >= 20 &&
      awayScore >= 50
    ) {
      awayTeamWins += 1;
    }
  }

  // Home wins set if...
  // Home wins > away wins AND
  // Home wins is at least 2 more than away wins AND (win by 2)
  // Home wins is greater than 50% of max games (majority of games won)
  if (
    homeTeamWins > awayTeamWins &&
    homeTeamWins - awayTeamWins >= 2 &&
    homeTeamWins > maxGames * 0.5
  ) {
    homeWinsSet = true;
  }

  // Check for away wins set
  if (
    awayTeamWins > homeTeamWins &&
    awayTeamWins - homeTeamWins >= 2 &&
    awayTeamWins > maxGames * 0.5
  ) {
    awayWinsSet = true;
  }

  return homeWinsSet ? 'home-wins' : awayWinsSet ? 'away-wins' : 'in-progress';
};
