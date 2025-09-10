import { ISODateString } from '@react-native-hello/common';

export type Player = {
  id?: string;
  createdOn?: ISODateString;
  updatedOn?: ISODateString;
  archivedOn?: ISODateString;
  user: string;
  firstName: string;
  lastName: string;
  email: string;
  status: PlayerStatus;
};

export enum PlayerStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}
