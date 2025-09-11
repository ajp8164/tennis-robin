import { ISODateString } from '@react-native-hello/common';

export type Token = {
  type: 'player-invitation';
  value: string;
  expiration: ISODateString;
  firstName?: string;
  lastName?: string;
  email?: string;
  teamId?: string;
};
