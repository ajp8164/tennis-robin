import { ElapsedTime } from 'types/sportEvent';

export const formatMatchTime = (time?: ElapsedTime) => {
  return `${time?.hours || 0}h ${time?.minutes || 0}m`;
};
