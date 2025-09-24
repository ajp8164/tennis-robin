import { getSetState } from './index';

export type MatchState =
  | 'home-wins'
  | 'away-wins'
  | 'in-progress'
  | 'not-started';

export const getMatchState = (
  maxSets: number,
  maxGames: number,
  setGameTeamScores?: number[][][][],
): MatchState => {
  // Must have scores for sets, game and team otherwise the set has not yet started.
  if (!setGameTeamScores || !setGameTeamScores[0]) {
    return 'not-started';
  }

  const setsPlayed = setGameTeamScores.length;
  let homeTeamWins = 0;
  let awayTeamWins = 0;

  for (let s = 0; s < maxSets; s++) {
    const setState = getSetState(maxGames, setGameTeamScores[s]);

    if (setState === 'home-wins') homeTeamWins++;
    if (setState === 'away-wins') awayTeamWins++;
    if (setState === 'not-started' && s === 0) return 'not-started';
    if (setState === 'in-progress') return 'in-progress';
  }

  // At this poin the match has ended, there is a winner.

  // Home wins if...
  // Home set wins > away set wins AND
  // Home set wins is greater than 50% of max sets (majority of sets won)
  if (homeTeamWins > awayTeamWins && setsPlayed > maxSets * 0.5) {
    return 'home-wins';
  } else {
    return 'away-wins';
  }
};
