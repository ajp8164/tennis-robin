import { Player } from 'types/player';
import { Schedule } from 'types/sportEvent';

export const simpleMatchSingles = (
  players: Player[],
  _courts?: number,
): Schedule | undefined => {
  // One round on one court. Each team has one player.
  const r = [
    // Round
    [
      // Court
      [
        // Team
        [
          // Player
          players[0],
        ],
      ],
      [
        // Team
        [
          // Player
          players[1],
        ],
      ],
    ],
  ];

  return {
    schedulerId: 'simple-match-singles',
    numberOfRounds: 1,
    numberOfCourtsUsed: 1,
    rounds: r,
    byes: [],
    scores: [],
  };
};
