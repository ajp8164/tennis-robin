import '@react-native-hello/ui';

import {
  IShadow,
  IStyle,
  IThemeManagerTextStyle,
} from '@react-native-hello/ui';

declare module '@react-native-hello/ui' {
  interface IColor {
    assertiveMuted: string;
    avatarColors: string | string[];
    brandPrimary: string;
    brandSecondary: string;
    deckCardDinnBack: string;
    deckCardDinnBackIcon: string;
    deckCardDinnBackListItem: string;
    deckCardDinnBackListItemIcon: string;
    deckCardDinnBackText: string;
    disabled: string;
    listItemBackgroundAlt: string;
    listItemIcon: string;
    listItemIconNav: string;
    screenHeaderButtonText: string;
    stickyText: string;
    tabBarActiveTint: string;
    tabBarBackgroundActive: string;
    tabBarBackgroundInactive: string;
    tabBarBorder: string;
    tabBarInactiveTint: string;
    clearButtonText: string;
    switchOffThumb: string;
    switchOnThumb: string;
    switchOffTrack: string;
    switchOnTrack: string;
  }

  interface IFonts {
    SFUITextRegular: string;
    SFUITextBold: string;
    SFUITextLight: string;
    SFUITextMedium: string;
    SFUITextSemiBold: string;
  }

  interface IFontSizes {
    giant: number;
    medium: number;
    micro: number;
  }

  interface ILineHeights {
    giant: number;
    medium: number;
    micro: number;
  }

  interface IPalette {
    black: string;
    white: string;
    transparent: string;
    primary: string;
    secondary: string;
  }

  interface IRadius {}

  interface IShadows {
    light: IShadow;
  }

  interface ISpacings {}

  interface IStyles {
    dividerIconButton: IStyle;
    dividerTextButton: IStyle;
    dividerTextButtonDisabled: IStyle;
    listItemButtonTitle: IStyle;
    listItemButtonDisabled: IStyle;
    listSectionHeader: IStyle;
    swipeableListItemContainer: IStyle;
    buttonOutlineAssertive: IStyle;
    buttonOutlineAssertiveTitle: IStyle;
    buttonOutlineLight: IStyle;
    buttonOutlineLightTitle: IStyle;
    buttonContainer: IStyle;
    textPlaceholder: IStyle;
    textScreenTitle: IStyle;
    view: IStyle;
    viewAlt: IStyle;
    viewInv: IStyle;
  }

  interface ITexts {
    giant: IThemeManagerTextStyle;
    medium: IThemeManagerTextStyle;
    micro: IThemeManagerTextStyle;
  }
}
