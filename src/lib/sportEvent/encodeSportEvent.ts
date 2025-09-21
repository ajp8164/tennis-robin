import { SportEvent, SportEventEncoded } from 'types/sportEvent';

export const encodeSportEvent = (sportEvent: SportEvent) => {
  if (!sportEvent?.schedule) return sportEvent as SportEventEncoded;

  const encoded: SportEventEncoded = {
    ...sportEvent,
    schedule: {
      ...sportEvent.schedule,
      rounds: JSON.stringify(sportEvent.schedule?.rounds || []),
      byes: JSON.stringify(sportEvent.schedule?.byes || []),
      scores: JSON.stringify(sportEvent.schedule?.scores || []),
    },
  };

  return encoded;
};
