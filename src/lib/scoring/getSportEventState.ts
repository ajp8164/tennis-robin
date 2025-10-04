import { mapToArray } from 'lib/utils';
import { Match } from 'types/match';
import { SportEvent, SportEventStatus } from 'types/sportEvent';

import { getRoundState } from './index';

type SportEventStateResult = {
  status: SportEventStatus;
};

export const getSportEventState = (
  sportEvent: SportEvent,
  matches: Match[],
) => {
  const allSportEventStatus = new Set<SportEventStatus>();

  mapToArray(sportEvent.schedule?.rounds).forEach((round, r) => {
    const roundState = getRoundState(
      round,
      matches.filter(m => m.roundNumber === r),
      sportEvent.numberOfSetsPerMatch,
      sportEvent.numberOfGamesPerSet,
    );

    if (roundState.status === 'ended') {
      allSportEventStatus.add('ended');
    }

    if (roundState.status === 'not-started') {
      allSportEventStatus.add('not-started');
    }

    if (roundState.status === 'in-progress') {
      allSportEventStatus.add('in-progress');
    }
  });

  let sportEventStatus: SportEventStatus;
  if (allSportEventStatus.size > 1) {
    sportEventStatus = 'in-progress';
  } else if (allSportEventStatus.has('not-started')) {
    sportEventStatus = 'not-started';
  } else if (allSportEventStatus.has('ended')) {
    sportEventStatus = 'ended';
  } else {
    sportEventStatus = 'in-progress';
  }

  return {
    status: sportEventStatus,
  } as SportEventStateResult;
};
