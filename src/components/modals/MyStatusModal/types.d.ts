import React from 'react';

export declare type MyStatusModal = MyStatusModalMethods;

declare const MyStatusModal: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    MyStatusModalProps & React.RefAttributes<MyStatusModalMethods>
  >
>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MyStatusModalProps {
  snapPoints?: (string | number)[];
}

export interface MyStatusModalMethods {
  dismiss: () => void;
  present: () => void;
}
