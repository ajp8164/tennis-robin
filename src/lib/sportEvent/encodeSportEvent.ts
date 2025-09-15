import { SportEvent, SportEventEncoded } from 'types/sportEvent';

export const encodeSportEvent = (sportEvent: SportEvent) => {
  if (!sportEvent?.schedule) return sportEvent as SportEventEncoded;

  const encoded: SportEventEncoded = {
    ...sportEvent,
    schedule: {
      ...sportEvent.schedule,
      allRounds: JSON.stringify(sportEvent.schedule?.allRounds || []),
      playableRounds: JSON.stringify(sportEvent.schedule?.playableRounds || []),
      byes: JSON.stringify(sportEvent.schedule?.byes || []),
    },
  };

  return encoded;
};
