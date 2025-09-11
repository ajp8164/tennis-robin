import React, { useImperativeHandle, useRef } from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Modal, ModalHeader, useTheme } from '@react-native-hello/ui';
import IconCloseX from 'components/atoms/IconCloseX';
import { PlayerStatus } from 'types/player';

import MyStatusView from '../../views/MyStatusView';
import { MyStatusModalMethods, MyStatusModalProps } from './types';

type MyStatusModal = MyStatusModalMethods;

const MyStatusModal = React.forwardRef<MyStatusModal, MyStatusModalProps>(
  (props, ref) => {
    const { snapPoints = ['40%'] } = props;

    const theme = useTheme();

    const innerRef = useRef<BottomSheetModalMethods>(null);

    useImperativeHandle(ref, () => ({
      //  These functions exposed to the parent component through the ref.
      dismiss,
      present,
    }));

    const dismiss = () => {
      innerRef.current?.dismiss();
    };

    const present = () => {
      innerRef.current?.present();
    };

    const onChangeStatus = (_status: PlayerStatus) => {
      dismiss();
    };

    return (
      <Modal
        ref={innerRef}
        snapPoints={snapPoints}
        enableGestureBehavior={true}
        backgroundStyle={{ backgroundColor: theme.colors.viewAltBackground }}>
        <ModalHeader
          size={'small'}
          title={'Set Your Status'}
          containerStyle={{ backgroundColor: theme.colors.viewAltBackground }}
          rightButtonIcon={<IconCloseX />}
          onRightButtonPress={dismiss}
        />
        <MyStatusView onChangeStatus={onChangeStatus} />
      </Modal>
    );
  },
);

export { MyStatusModal };
