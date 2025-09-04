import React, { useContext, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, Text, View } from 'react-native';

import { ThemeManager, useDevice, useTheme } from '@react-native-hello/ui';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { Button } from 'components/atoms/Button';
import { Info, Search, TriangleAlert } from 'lucide-react-native';

interface EmptyViewInterface {
  error?: boolean;
  info?: boolean;
  message?: string;
  details?: string;
  isLoading?: boolean;
  buttonTitle?: string;
  positionTop?: boolean;
  onButtonPress?: () => void;
}

export const EmptyView = ({
  info,
  error,
  message = 'Nothing here!',
  details,
  isLoading,
  buttonTitle,
  positionTop,
  onButtonPress,
}: EmptyViewInterface) => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();

  const tabBarHeight = useContext(BottomTabBarHeightContext) || 0;
  const bottom = device.screen.height * 0.6 - tabBarHeight;
  const [height, setHeight] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={s.container}>
      <View
        style={[s.items, { bottom: positionTop ? undefined : bottom - height }]}
        onLayout={onLayout}>
        {isLoading ? (
          <ActivityIndicator
            size={'large'}
            color={theme.colors.midGray}
            style={s.activityIndicator}
          />
        ) : error ? (
          <TriangleAlert
            stroke={theme.colors.viewBackground}
            fill={theme.colors.midGray}
            size={60}
          />
        ) : info ? (
          <Info
            stroke={theme.colors.viewBackground}
            fill={theme.colors.midGray}
            size={60}
          />
        ) : (
          <Search
            stroke={theme.colors.midGray}
            size={50}
            style={{ marginTop: 10 }}
          />
        )}
        <Text style={s.message}>{message}</Text>
        <Text style={s.details}>{details}</Text>
        {buttonTitle && onButtonPress ? (
          <Button
            title={buttonTitle}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonClear}
            containerStyle={s.buttonContainer}
            onPress={() => onButtonPress()}
          />
        ) : null}
      </View>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    ...theme.styles.view,
    height: '100%',
    alignItems: 'center',
  },
  activityIndicator: {
    height: 45,
  },
  items: {
    position: 'absolute',
    alignItems: 'center',
  },
  message: {
    ...theme.text.normal,
    ...theme.styles.textDim,
    fontFamily: theme.fonts.bold,
    marginTop: 10,
    textAlign: 'center',
  },
  details: {
    ...theme.text.normal,
    ...theme.styles.textDim,
    marginTop: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    alignSelf: 'center',
  },
}));
