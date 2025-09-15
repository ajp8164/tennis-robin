import { SportEvent, SportEventEncoded } from 'types/sportEvent';

export const decodeSportEvent = (sportEventEncoded?: SportEventEncoded) => {
  if (!sportEventEncoded?.schedule) return sportEventEncoded as SportEvent;

  const decoded: SportEvent = {
    ...sportEventEncoded,
    schedule: {
      ...sportEventEncoded.schedule,
      allRounds: JSON.parse(sportEventEncoded.schedule?.allRounds || '[]'),
      playableRounds: JSON.parse(
        sportEventEncoded.schedule?.playableRounds || '[]',
      ),
      byes: JSON.parse(sportEventEncoded.schedule?.byes || '[]'),
      scores: JSON.parse(sportEventEncoded.schedule?.scores || '[]'),
    },
  };

  return decoded;
};
