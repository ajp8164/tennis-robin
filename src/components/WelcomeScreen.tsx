import React, { useRef } from 'react';
import { Platform, ScrollView, StatusBar, Text } from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { useSelector } from 'react-redux';

import {
  CheckBox,
  ThemeManager,
  useDevice,
  useTheme,
} from '@react-native-hello/ui';
import { useFocusEffect } from '@react-navigation/native';
import { LegalModal } from 'components/modals/LegalModal';
import { dispatch } from 'store';
import { selectTou } from 'store/selectors/appSettingsSelectors';
import { saveAcceptTou } from 'store/slices/appSettings';

const WelcomeScreen = () => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();
  const visibleHeight =
    device.screen.height -
    device.insets.top -
    device.insets.bottom -
    (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);

  const legalModalRef = useRef<LegalModal>(null);
  const tou = useSelector(selectTou);

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(theme.colors.brandSecondary);
        SystemNavigationBar.setNavigationColor(
          theme.colors.brandPrimary,
          'light',
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const agreement = () => {
    return (
      <CheckBox
        center
        title={
          <Text style={s.termsTextContainer}>
            {'I accept the '}
            <Text
              style={s.termsText}
              suppressHighlighting={true}
              onPress={legalModalRef.current?.present}>
              {'Terms of Service'}
            </Text>
          </Text>
        }
        containerStyle={s.checkboxContainer}
        iconType={'ionicon'}
        checkedIcon={'checkbox-outline'}
        uncheckedIcon={'square-outline'}
        checkedColor={theme.colors.stickyWhite}
        uncheckedColor={
          ThemeManager.name === 'light'
            ? theme.colors.whiteTransparentMid
            : theme.colors.blackTransparentMid
        }
        checked={tou.accepted !== undefined}
        onPress={() => {
          const accepted =
            tou.accepted === undefined ? new Date().toISOString() : undefined;
          dispatch(saveAcceptTou({ tou: { accepted } }));
        }}
      />
    );
  };

  return (
    <>
      <ScrollView
        style={theme.styles.viewInv}
        contentInsetAdjustmentBehavior={'always'}
        overScrollMode={'always'}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ height: visibleHeight }}>
        {agreement()}
      </ScrollView>
      <LegalModal ref={legalModalRef} />
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  checkboxContainer: {
    backgroundColor: theme.colors.transparent,
    alignSelf: 'flex-start',
  },
  termsTextContainer: {
    ...theme.text.small,
    color: theme.colors.textInv,
    left: 5,
  },
  termsText: {
    ...theme.text.small,
    ...theme.styles.textLink,
    color: theme.colors.textInv,
  },
}));

export default WelcomeScreen;
