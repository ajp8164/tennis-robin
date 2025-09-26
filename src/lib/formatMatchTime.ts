import { MatchTimer } from 'types/sportEvent';

export const formatMatchTime = (timer?: MatchTimer) => {
  return `${timer?.hours || 0}h ${timer?.minutes || 0}m`;
};
