import React, { useImperativeHandle, useRef } from 'react';
import { Text, View } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Divider, Modal, ThemeManager, useTheme } from '@react-native-hello/ui';
import { Info } from 'lucide-react-native';

import { InfoModalMethods, InfoModalProps } from './types';

type InfoModal = InfoModalMethods;

const InfoModal = React.forwardRef<InfoModal, InfoModalProps>((props, ref) => {
  const { snapPoints = ['50%'], title, text, values } = props;

  const theme = useTheme();
  const s = useStyles();

  const innerRef = useRef<BottomSheetModalMethods>(null);

  useImperativeHandle(ref, () => ({
    // These functions exposed to the parent component through the ref.
    present,
  }));

  const present = () => {
    innerRef.current?.present();
  };

  return (
    <BottomSheetModalProvider>
      <Modal
        ref={innerRef}
        snapPoints={snapPoints}
        backgroundStyle={s.modalBackground}
        enableDynamicSizing={false}
        handleIndicatorStyle={
          ThemeManager.name === 'dark'
            ? { backgroundColor: 'white' }
            : { backgroundColor: 'black' }
        }>
        <View style={[theme.styles.view, s.container]}>
          <View style={s.titleContainer}>
            <Info color={theme.colors.listItemIcon} />
            <Text style={s.title}>{title}</Text>
          </View>
          {text?.map((paragraph, index) => {
            values?.forEach((v, index) => {
              paragraph = paragraph.replaceAll(`{${index}}`, v);
            });
            return (
              <Text key={`${index}`} style={s.text}>
                {paragraph}
              </Text>
            );
          })}
          <Divider />
        </View>
      </Modal>
    </BottomSheetModalProvider>
  );
});

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    paddingHorizontal: 15,
    width: '100%',
  },
  modalBackground: {
    backgroundColor: theme.colors.viewBackground,
  },
  text: {
    ...theme.text.normal,
    marginBottom: 15,
  },
  title: {
    ...theme.text.h5,
    marginLeft: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
}));

export { InfoModal };
