import { Player } from 'types/player';
import { SportEvent } from 'types/sportEvent';

import { getMatchState } from './index';

export type RoundStatus = 'not-started' | 'in-progress' | 'ended';

type RoundStateResult = {
  roundStatus: RoundStatus;
  matchCount: number;
};
export const getRoundState = (
  sportEvent: SportEvent,
  round: Player[][][],
  roundIndex: number,
) => {
  const matches = round.filter(court => {
    return court.flat().every(p => p.firstName !== '(Bye)');
  });

  const allRoundStatus = new Set<RoundStatus>();

  matches.forEach((_, c) => {
    const matchState = getMatchState(
      sportEvent.numberOfSetsPerMatch,
      sportEvent.numberOfGamesPerSet,
      sportEvent.schedule?.scores[roundIndex]?.[c],
      sportEvent.schedule?.matchDetails[roundIndex]?.[c],
    );
    console.log(
      matchState,
      sportEvent.schedule?.matchDetails[roundIndex]?.[c],
      sportEvent.schedule?.scores[roundIndex]?.[c],
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

  let roundStatus: RoundStatus;
  if (allRoundStatus.size > 1) {
    roundStatus = 'in-progress';
  } else if (allRoundStatus.has('not-started')) {
    roundStatus = 'not-started';
  } else if (allRoundStatus.has('ended')) {
    roundStatus = 'ended';
  } else {
    roundStatus = 'in-progress';
  }

  return {
    roundStatus,
    matchCount: matches.length,
  } as RoundStateResult;
};
