import { ISODateString } from '@react-native-hello/common';

export type Player = {
  id?: string;
  createdOn?: ISODateString;
  firstName: string;
  lastName: string;
  email: string;
  status: PlayerStatus;
};

export enum PlayerStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}
