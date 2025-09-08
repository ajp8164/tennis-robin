import { TextStyle } from 'react-native';

import { useTheme } from '@react-native-hello/ui';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { MultipleNavigatorParamList } from 'types/navigation';

export type ScreenEditHeaderAction = {
  action?: () => void;
  enabled?: boolean;
  label?: string;
  visible?: boolean;
  style?: TextStyle;
};

/**
 * Provides a common screen edit header for the "cancel or done" pattern.
 * Accepts an additional navigation screen options for convenience.
 *
 * Left button is typically 'Cancel' and defaults to shown.
 * Right button is typically 'Done' and defaults to hidden.
 */
export const useScreenEditHeader = () => {
  const theme = useTheme();
  const navigation: NavigationProp<MultipleNavigatorParamList> =
    useNavigation();

  const setScreenEditHeader = (
    rightButton?: ScreenEditHeaderAction,
    leftButton?: ScreenEditHeaderAction,
    navigationOpts?: NativeStackNavigationOptions,
  ) => {
    const options = navigationOpts || {};

    options.headerLeft = () => {
      if (leftButton?.visible !== undefined ? leftButton.visible : true) {
        return (
          <Button
            title={leftButton?.label || 'Cancel'}
            titleStyle={{
              ...theme.styles.buttonScreenHeaderTitle,
              ...leftButton?.style,
            }}
            buttonStyle={theme.styles.buttonScreenHeader}
            disabled={
              leftButton?.enabled !== undefined ? !leftButton.enabled : false
            }
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            onPress={() =>
              leftButton?.action ? leftButton.action() : navigation.goBack()
            }
          />
        );
      }
    };

    options.headerRight = () => {
      if (rightButton?.visible !== undefined ? rightButton.visible : true) {
        return (
          <Button
            title={rightButton?.label || 'Save'}
            titleStyle={{
              ...theme.styles.buttonScreenHeaderTitle,
              ...rightButton?.style,
            }}
            buttonStyle={theme.styles.buttonScreenHeader}
            disabled={
              rightButton?.enabled !== undefined ? !rightButton.enabled : false
            }
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            onPress={() =>
              rightButton?.action
                ? rightButton.action()
                : () => {
                    return;
                  }
            }
          />
        );
      }
    };

    navigation.setOptions(options);
  };

  return setScreenEditHeader;
};
