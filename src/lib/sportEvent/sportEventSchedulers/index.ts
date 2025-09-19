import { Player } from 'types/player';
import { EventCategory, MatchType, Schedule } from 'types/sportEvent';

import { uniquePartnerDoubles } from './uniquePartnerDoubles';

export * from './uniquePartnerDoubles';

export type Scheduler = {
  id: string;
  name: string;
  description: string;
  typeOfMatch: MatchType;
  eventCategory: EventCategory;
  icon: string;
  fn: (players: Player[], courts: number) => Schedule | undefined;
};

export const schedulers: Scheduler[] = [
  {
    id: 'singles',
    name: 'Singles',
    description: 'One player each team.',
    typeOfMatch: MatchType.Singles,
    eventCategory: EventCategory.Match,
    icon: 'Users',
    fn: uniquePartnerDoubles,
  },
  {
    id: 'unique-partner-doubles',
    name: 'Unique Partner Doubles',
    description:
      'Players are grouped into pairs. Each player partners with every other player exactly once. No pair repeats.',
    typeOfMatch: MatchType.Doubles,
    eventCategory: EventCategory.RoundRobin,
    icon: 'Users',
    fn: uniquePartnerDoubles,
  },
];
