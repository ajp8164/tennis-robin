import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { LucideIcon, LucideProps } from 'lucide-react-native';

interface DynamicIconInterface extends LucideProps {
  icon?: LucideIcon;
}

export const DynamicIcon = (props: DynamicIconInterface) => {
  const { icon, ...rest } = props;

  const theme = useTheme();

  return icon
    ? React.createElement(icon, {
        color: theme.colors.listItemIcon,
        ...rest,
      })
    : null;
};
