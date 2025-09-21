import { SportEvent, SportEventEncoded } from 'types/sportEvent';

export const decodeSportEvent = (sportEventEncoded?: SportEventEncoded) => {
  if (!sportEventEncoded?.schedule) return sportEventEncoded as SportEvent;

  const decoded: SportEvent = {
    ...sportEventEncoded,
    schedule: {
      ...sportEventEncoded.schedule,
      rounds: JSON.parse(sportEventEncoded.schedule?.rounds || '[]'),
      byes: JSON.parse(sportEventEncoded.schedule?.byes || '[]'),
      scores: JSON.parse(sportEventEncoded.schedule?.scores || '[]'),
    },
  };

  return decoded;
};
