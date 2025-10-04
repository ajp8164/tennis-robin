import { Match, Point } from 'types/match';
import { TeamSides } from 'types/sportEvent';

type GameStatus = 'team1-wins' | 'team2-wins' | 'in-progress' | 'not-started';

type GameStateResult = {
  status: GameStatus;
  points: Point[]; // [team1, team2]
};

const team1 = TeamSides.indexOf('Team1');
const team2 = TeamSides.indexOf('Team2');

export const getGameState = (
  game: number,
  set: number,
  match?: Match,
): GameStateResult => {
  if (match?.sets?.[`s${set}`]?.games?.[`g${game}`] === undefined) {
    return {
      status: 'not-started',
      points: [{ v: 0 }, { v: 0 }], // No score for either team
    };
  }

  // Get index of last game score in the set.
  const lastScoreInGameIndex =
    match.sets[`s${set}`]?.games?.[`g${game}`].teams?.[`t${0}`].points.length -
    1;
  let team1WinsGame = false;
  let team2WinsGame = false;

  // Team 1 wins game if...
  // Team 1 score > team 2 score AND
  // Team 1 score is at least team 2 score + 20 (win by 2 where score differential is 10) AND
  // Team 1 score is >= 50 (50 is win in 3 serves - 0,15,30,40)
  const team1Point =
    match.sets[`s${set}`]?.games?.[`g${game}`].teams?.[`t${team1}`]?.points[
      lastScoreInGameIndex
    ];
  const team2Point =
    match.sets[`s${set}`]?.games?.[`g${game}`].teams?.[`t${team2}`]?.points[
      lastScoreInGameIndex
    ];

  // Check if team 1 is winner.
  if (
    team1Point.v > team2Point.v &&
    team1Point.v - team2Point.v >= 20 &&
    team1Point.v >= 50
  ) {
    team1WinsGame = true;
  }

  // Check if team 2 is winner.
  if (
    team2Point.v > team1Point.v &&
    team2Point.v - team1Point.v >= 20 &&
    team2Point.v >= 50
  ) {
    team2WinsGame = true;
  }

  const status: GameStatus = team1WinsGame
    ? 'team1-wins'
    : team2WinsGame
      ? 'team2-wins'
      : 'in-progress';

  return {
    status,
    points: [team1Point, team2Point],
  } as GameStateResult;
};
