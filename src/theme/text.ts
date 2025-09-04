import { IBaseThemeSchema, ITexts } from '@react-native-hello/ui';

export const createTextStyles = ({
  theme,
}: {
  theme: IBaseThemeSchema;
}): Partial<ITexts> => ({
  giant: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.giant,
    letterSpacing: theme.letterSpacing.giant,
    lineHeight: theme.lineHeight.giant,
  },
  medium: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.medium,
    letterSpacing: theme.letterSpacing.medium,
    lineHeight: theme.lineHeight.medium,
  },
  micro: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.micro,
    letterSpacing: theme.letterSpacing.micro,
    lineHeight: theme.lineHeight.micro,
  },
});
