import React, { useImperativeHandle, useRef, useState } from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Modal, useTheme } from '@react-native-hello/ui';

import InviteRedemptionView from '../../views/InviteRedemptionView';
import {
  InviteRedemptionModalMethods,
  InviteRedemptionModalProps,
} from './types';

type InviteRedemptionModal = InviteRedemptionModalMethods;

const InviteRedemptionModal = React.forwardRef<
  InviteRedemptionModal,
  InviteRedemptionModalProps
>((props, ref) => {
  const { snapPoints = ['92%'], onAccepted } = props;

  const theme = useTheme();
  const [tokenId, setTokenId] = useState<string>();

  const innerRef = useRef<BottomSheetModalMethods>(null);

  useImperativeHandle(ref, () => ({
    //  These functions exposed to the parent component through the ref.
    dismiss,
    present,
  }));

  const dismiss = () => {
    innerRef.current?.dismiss();
  };

  const present = (tokenId: string) => {
    setTokenId(tokenId);
    // Wait for the token to be set.
    setTimeout(() => innerRef.current?.present());
  };

  if (!tokenId) return null;

  return (
    <Modal
      ref={innerRef}
      snapPoints={snapPoints}
      enableGestureBehavior={false}
      backgroundStyle={{ backgroundColor: theme.colors.viewAltBackground }}>
      <InviteRedemptionView
        tokenId={tokenId}
        onAccepted={teamName => {
          onAccepted(teamName);
          dismiss();
        }}
        onDeclined={() => dismiss()}
        onCanceled={() => dismiss()}
      />
    </Modal>
  );
});

export { InviteRedemptionModal };
