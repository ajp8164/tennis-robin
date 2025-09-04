import React, { ReactElement, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  InputMethods,
  ListItemInput as RNHListItemInput,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { Eye, EyeOff, Pencil } from 'lucide-react-native';

export type ListItemInputMethods = InputMethods;

interface ListItemInput extends RNHListItemInput {
  actionsContent?: ReactElement;
}

const ListItemInput = React.forwardRef<ListItemInputMethods, ListItemInput>(
  (props, ref) => {
    const { actionsContent, ...rest } = props;

    const theme = useTheme();
    const s = useStyles();

    const [secureVisible, setSecureVisible] = useState(false);

    return (
      <RNHListItemInput
        ref={ref}
        {...rest}
        inputProps={{
          returnKeyType: 'done',
          ...rest.inputProps,
          secureTextEntry: rest.inputProps.secureTextEntry && !secureVisible,
          ComponentRight: (
            <View style={s.rightContentContainer}>
              {rest.inputProps.secureTextEntry ? (
                <Pressable
                  style={{
                    height: rest.inputProps.inputStyle?.height || 48,
                    paddingHorizontal: 5,
                    justifyContent: 'center',
                  }}
                  onPress={() => setSecureVisible(prev => !prev)}>
                  {secureVisible ? (
                    <Eye color={theme.colors.listItemIcon} size={22} />
                  ) : (
                    <EyeOff color={theme.colors.listItemIcon} size={22} />
                  )}
                </Pressable>
              ) : null}
              {actionsContent ? (
                <View style={s.actionsContent}>{actionsContent}</View>
              ) : null}
              {rest.inputProps.editable === false ? null : (
                <Pencil color={theme.colors.lightGray} size={18} />
              )}
              {rest.rightContent ? (
                <View style={s.rightContent}>{rest.rightContent}</View>
              ) : null}
            </View>
          ),
        }}
      />
    );
  },
);

const useStyles = ThemeManager.createStyleSheet(() => ({
  actionsContent: {
    marginRight: 5,
  },
  rightContent: {
    marginLeft: 5,
  },
  rightContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
}));

export { ListItemInput };
