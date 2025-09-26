import { Player } from 'types/player';
import { Schedule } from 'types/sportEvent';

export const simpleMatchDoubles = (
  players: Player[],
  _courts?: number,
): Schedule | undefined => {
  // One round on one court. Each team has two players.
  const r = [
    // Round
    [
      // Court
      [
        // Team
        [
          // Player
          players[0],
          players[1],
        ],
        [
          // Player
          players[2],
          players[3],
        ],
      ],
    ],
  ];

  return {
    schedulerId: 'simple-match-doubles',
    numberOfRounds: 1,
    numberOfCourtsUsed: 1,
    rounds: r,
    byes: [],
    scores: [],
    matchDetails: [],
  };
};
