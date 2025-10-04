import { Player } from 'types/player';

export * from './useMyPlayer';
export * from './usePlayerStatusDecoration';

export const flattenPlayers = (
  teams: Record<string, { players: Record<string, Player> }>,
) => {
  return Object.values(teams).flatMap(team => Object.values(team.players));
};
