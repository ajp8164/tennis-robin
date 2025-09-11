import { ISODateString } from '@react-native-hello/common';

export type Tournament = {
  id?: string;
  createdOn?: ISODateString;
  updatedOn?: ISODateString;
  archivedOn?: ISODateString;
  name: string;
  owners: string[];
  players: string[];
};
