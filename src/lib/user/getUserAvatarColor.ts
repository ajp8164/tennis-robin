import { ThemeManager } from '@react-native-hello/ui';
import { hash } from 'lib/utils';

export const getUserAvatarColor = (userId: string) => {
  const colors = ThemeManager.theme.colors.avatarColors as string[];
  return colors[hash(userId) % colors.length];
};
