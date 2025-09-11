import React from 'react';

export declare type InviteRedemptionModal = InviteRedemptionModalMethods;

declare const InviteRedemptionModal: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    InviteRedemptionModalProps &
      React.RefAttributes<InviteRedemptionModalMethods>
  >
>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InviteRedemptionModalProps {
  snapPoints?: (string | number)[];
  onAccepted: () => void;
}

export interface InviteRedemptionModalMethods {
  dismiss: () => void;
  present: (tokenId: string) => void;
}
