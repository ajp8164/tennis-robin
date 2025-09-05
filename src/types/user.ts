import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { ISODateString } from '@react-native-hello/common';

export enum UserRole {
  Owner = 'Owner',
  Admin = 'Administrator',
  User = 'User',
}

export enum UserStatus {
  Active = 'Active',
  Disabled = 'Disabled',
}

export type UserProfile = {
  id?: string;
  createdOn: ISODateString;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
  photoUrlDefault: string;
  avatar: {
    color: string;
    title: string;
  };
  role: UserRole;
  status: UserStatus;
  groups: string[];
  notifications: {
    badgeCount: number;
    pushTokens: string[];
  };
};

export type User = {
  credentials: FirebaseAuthTypes.User;
  profile: UserProfile;
};

// Used to pass data collected during use of the email/password signin provider.
export type EmailPasswordAuthData = {
  firstName: string;
  lastName: string;
};
