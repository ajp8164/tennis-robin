import { useTheme } from '@react-native-hello/ui';
import { IconName } from 'components/EnumPickerScreen';
import { PlayerStatus } from 'types/player';

type Decoration = {
  label: string;
  color: string;
  icon: IconName;
  userSettable: boolean;
};

export const usePlayerStatusDecoration = (): Record<
  PlayerStatus,
  Decoration
> => {
  const theme = useTheme();
  return {
    [PlayerStatus.Active]: {
      label: 'Active',
      color: theme.colors.success,
      icon: 'Smile',
      userSettable: true,
    },
    [PlayerStatus.Inactive]: {
      label: 'Inactive',
      color: theme.colors.assertive,
      icon: 'Ban',
      userSettable: true,
    },
    [PlayerStatus.Invited]: {
      label: 'Invited',
      color: theme.colors.info,
      icon: 'Mail',
      userSettable: false,
    },
    [PlayerStatus.OutSick]: {
      label: 'Out Sick',
      color: theme.colors.info,
      icon: 'Frown',
      userSettable: true,
    },
    [PlayerStatus.Vacation]: {
      label: 'Vacation',
      color: theme.colors.info,
      icon: 'Palmtree',
      userSettable: true,
    },
  };
};
