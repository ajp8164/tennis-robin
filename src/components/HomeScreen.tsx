import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {  Text, View } from 'react-native';
import {
  HomeNavigatorParamList,
  MainNavigatorParamList,
} from 'types/navigation';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeNavigatorParamList, 'Home'>,
  NativeStackScreenProps<MainNavigatorParamList>
>;

const HomeScreen = () => {
  const theme = useTheme();
  const s = useStyles();

  return (
    <View style={theme.styles.view}>
      <Text style={theme.text.normal}>{"Hello World!"}</Text>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
}));

export default HomeScreen;
