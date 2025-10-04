import { flattenPlayers } from 'lib/player';
import { mapToArray } from 'lib/utils';
import { Match } from 'types/match';
import { Round } from 'types/sportEvent';

import { getMatchState } from './index';

export type RoundStatus = 'not-started' | 'in-progress' | 'ended';

type RoundStateResult = {
  status: RoundStatus;
  matchCount: number;
};
export const getRoundState = (
  round: Round,
  roundMatches: Match[],
  numberOfSetsPerMatch: number,
  numberOfGamesPerSet: number,
) => {
  const courts = mapToArray(round.courts).filter(court => {
    return flattenPlayers(court.teams).every(p => p.firstName !== '(Bye)');
  });

  const allRoundStatus = new Set<RoundStatus>();

  courts.forEach((_court, c) => {
    const match = roundMatches.filter(m => m.courtNumber === c)?.[0];

    const matchState = getMatchState(
      numberOfSetsPerMatch,
      numberOfGamesPerSet,
      match,
    );

    if (matchState.status === 'ended' || matchState.status === 'abandoned') {
      allRoundStatus.add('ended');
    }

    if (matchState.status === 'not-started') {
      allRoundStatus.add('not-started');
    }

    if (matchState.status === 'in-progress') {
      allRoundStatus.add('in-progress');
    }

    if (
      matchState.status === 'team1-wins' ||
      matchState.status === 'team2-wins'
    ) {
      allRoundStatus.add('ended');
    }
  });

  let roundStatus: RoundStatus | undefined = undefined;
  if (allRoundStatus.size > 1) {
    // Matches is multiple states indicates in-progress.
    roundStatus = 'in-progress';
  } else if (allRoundStatus.has('not-started')) {
    roundStatus = 'not-started';
  } else if (allRoundStatus.has('ended')) {
    roundStatus = 'ended';
  } else {
    roundStatus = 'in-progress';
  }

  return {
    status: roundStatus,
    matchCount: courts.length,
  } as RoundStateResult;
};
