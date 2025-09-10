import { ISODateString } from '@react-native-hello/common';

export type Team = {
  id?: string;
  createdOn?: ISODateString;
  updatedOn?: ISODateString;
  archivedOn?: ISODateString;
  name: string;
  owners: string[];
  users: string[];
  groups: string[];
  defaultTeam: boolean;
};
