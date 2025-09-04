import { Platform } from 'react-native';

import { IStyles, type IBaseThemeSchema } from '@react-native-hello/ui';

export const createElementsStyles = ({
  theme,
}: {
  theme: IBaseThemeSchema;
}): Partial<IStyles> => ({
  /**
   * Divider
   */

  dividerIconButton: {
    backgroundColor: theme.colors.transparent,
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'flex-start',
  },
  dividerTextButton: {
    backgroundColor: theme.colors.transparent,
    paddingHorizontal: 10,
    paddingVertical: 0,
    justifyContent: 'flex-start',
  },
  dividerTextButtonDisabled: {
    backgroundColor: theme.colors.transparent,
    paddingHorizontal: 10,
    paddingVertical: 0,
    justifyContent: 'flex-start',
    opacity: 0.4,
  },

  /**
   * List
   */

  listSectionHeader: {
    backgroundColor: theme.colors.viewBackground,
  },

  /**
   * List Item
   */

  listItemButtonTitle: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.clearButtonText,
  },
  listItemButtonDisabled: {
    opacity: 0.3,
  },
  swipeableListItemContainer: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },

  /**
   * Button
   */

  buttonContainer: {
    marginHorizontal: 15,
  },
  button: {
    backgroundColor: theme.colors.button,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 15,
    width: '100%',
    alignSelf: 'center',
  },
  buttonTitle: {
    fontSize: theme.fontSize.normal,
    fontFamily: theme.fonts.regular,
    color: theme.colors.buttonText,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        marginTop: 0,
      },
      android: {
        marginTop: -2,
      },
    }),
  },
  buttonOutline: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.button,
    borderWidth: 2,
  },
  buttonOutlineTitle: {
    fontSize: theme.fontSize.normal,
    fontWeight: '400',
    fontFamily: theme.fonts.regular,
    color: theme.colors.button,
  },
  buttonOutlineAssertive: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.assertive,
    borderWidth: 2,
  },
  buttonOutlineAssertiveTitle: {
    fontSize: theme.fontSize.normal,
    fontWeight: '400',
    fontFamily: theme.fonts.regular,
    color: theme.colors.assertive,
  },
  buttonOutlineLight: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.lightGray,
    borderWidth: 2,
  },
  buttonOutlineLightTitle: {
    fontSize: theme.fontSize.normal,
    fontWeight: '400',
    fontFamily: theme.fonts.regular,
    color: theme.colors.lightGray,
  },
  buttonScreenHeaderTitle: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: theme.fontSize.normal,
    fontFamily: theme.fonts.regular,
    ...Platform.select({
      ios: {
        marginTop: 0,
      },
      android: {
        marginTop: -2,
      },
    }),
  },

  /**
   * Text
   */

  textDim: {
    opacity: 0.6,
  },

  textPlaceholder: {
    opacity: 0.4,
  },
  textScreenTitle: {
    color: theme.colors.black,
    fontSize: 17,
    fontFamily: theme.fonts.regular,
    fontWeight: '600',
  },

  /**
   * View
   */

  view: {
    height: '100%',
    paddingHorizontal: 7,
    backgroundColor: theme.colors.viewBackground,
  },
  viewAlt: {
    height: '100%',
    paddingHorizontal: 7,
    backgroundColor: theme.colors.viewAltBackground,
  },
  viewInv: {
    height: '100%',
    paddingHorizontal: 7,
    backgroundColor: theme.colors.viewInvBackground,
  },
});
