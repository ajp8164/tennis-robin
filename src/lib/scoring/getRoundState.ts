import { Player } from 'types/player';
import { SportEvent } from 'types/sportEvent';

import { getMatchState } from './index';

export type RoundState = 'not-started' | 'in-progress' | 'ended';

export const getRoundState = (
  sportEvent: SportEvent,
  round: Player[][][],
  roundIndex: number,
) => {
  const matches = round.filter(court => {
    return court.flat().every(p => p.firstName !== '(Bye)');
  });

  let roundState: RoundState = 'ended';
  let roundStateLabel = 'Ended';

  matches.forEach((_, c) => {
    const matchState = getMatchState(
      sportEvent.numberOfSets,
      sportEvent.numberOfGamesPerSet,
      sportEvent.schedule?.scores[roundIndex]?.[c],
    );

    if (matchState === 'not-started') {
      roundState = 'not-started';
      roundStateLabel = 'Not Started';
      return;
    }

    if (matchState === 'in-progress') {
      roundState = 'in-progress';
      roundStateLabel = 'In Progress';
      return;
    }
  });

  return {
    roundState,
    roundStateLabel,
    matchCount: matches.length,
  };
};
