import { useTheme } from '@react-native-hello/ui';
import { Ban, Frown, Mail, Palmtree, Smile } from 'lucide-react-native';
import { PlayerStatus } from 'types/player';

export const usePlayerStatusDecoration = () => {
  const theme = useTheme();
  return {
    [PlayerStatus.Active]: {
      label: 'Active',
      color: theme.colors.success,
      icon: Smile,
      userSettable: true,
    },
    [PlayerStatus.Inactive]: {
      label: 'Inactive',
      color: theme.colors.assertive,
      icon: Ban,
      userSettable: true,
    },
    [PlayerStatus.Invited]: {
      label: 'Invited',
      color: theme.colors.info,
      icon: Mail,
      userSettable: false,
    },
    [PlayerStatus.OutSick]: {
      label: 'Out Sick',
      color: theme.colors.info,
      icon: Frown,
      userSettable: true,
    },
    [PlayerStatus.Vacation]: {
      label: 'Vacation',
      color: theme.colors.info,
      icon: Palmtree,
      userSettable: true,
    },
  };
};
