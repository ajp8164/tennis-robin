import { SportEvent, SportEventEncoded } from 'types/sportEvent';

export const encodeSportEvent = (sportEvent: SportEvent) => {
  if (!sportEvent?.schedule) return sportEvent as SportEventEncoded;

  const encoded: SportEventEncoded = {
    ...sportEvent,
    schedule: {
      ...sportEvent.schedule,
      allRounds: JSON.stringify(sportEvent.schedule?.allRounds || []),
      byes: JSON.stringify(sportEvent.schedule?.byes || []),
      scores: JSON.stringify(sportEvent.schedule?.scores || []),
    },
  };

  return encoded;
};
