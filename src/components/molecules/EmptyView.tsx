import React, { ReactNode, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemeManager, useDevice, useTheme } from '@react-native-hello/ui';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { Button } from 'components/atoms/Button';
import { Info, Search, TriangleAlert } from 'lucide-react-native';

interface EmptyViewInterface {
  type?: 'error' | 'info' | 'search' | 'loading' | 'none';
  message?: string;
  details?: string;
  buttonTitle?: string;
  positionTop?: boolean;
  style?: StyleProp<ViewStyle>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  waitFor?: any;
  minWait?: number;
  fadeIn?: boolean;
  children?: ReactNode;
  onButtonPress?: () => void;
}

export const EmptyView = ({
  type = 'search',
  message,
  details,
  buttonTitle,
  positionTop,
  style,
  waitFor,
  minWait = 0,
  fadeIn,
  children,
  onButtonPress,
}: EmptyViewInterface) => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();

  const tabBarHeight = useContext(BottomTabBarHeightContext) || 0;
  const bottom = device.screen.height * 0.6 - tabBarHeight;
  const [height, setHeight] = useState(0);

  const [showEmpty, setShowEmpty] = useState(!waitFor);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!waitFor) {
      setShowEmpty(true);
    } else {
      // Keep showing EmptyView for at least minWait ms.
      timer = setTimeout(() => setShowEmpty(false), minWait);
    }

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitFor]);

  const onLayout = (event: LayoutChangeEvent) => {
    setHeight(event.nativeEvent.layout.height);
  };

  return (
    <>
      {!showEmpty && children ? (
        <Animated.View
          style={{ height: '100%' }}
          entering={fadeIn ? FadeIn : undefined}>
          {children}
        </Animated.View>
      ) : (
        <View style={[s.container, style]}>
          <View
            style={[
              s.items,
              positionTop ? s.positionTop : { bottom: bottom - height },
            ]}
            onLayout={onLayout}>
            {type === 'loading' ? (
              <ActivityIndicator
                size={'large'}
                color={theme.colors.midGray}
                style={s.activityIndicator}
              />
            ) : type === 'error' ? (
              <TriangleAlert
                stroke={theme.colors.viewBackground}
                fill={theme.colors.midGray}
                size={60}
              />
            ) : type === 'info' ? (
              <Info
                stroke={theme.colors.viewBackground}
                fill={theme.colors.midGray}
                size={60}
              />
            ) : type === 'search' ? (
              <Search
                stroke={theme.colors.midGray}
                size={50}
                style={{ marginTop: 10 }}
              />
            ) : null}
            {message ? <Text style={s.message}>{message}</Text> : null}
            {details ? <Text style={s.details}>{details}</Text> : null}
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
      )}
    </>
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
  positionTop: {
    position: undefined,
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
