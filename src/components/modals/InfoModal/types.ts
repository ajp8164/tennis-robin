import React from 'react';

export declare type InfoModal = InfoModalMethods;

declare const InfoModal: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<InfoModalProps & React.RefAttributes<InfoModalMethods>>
>;

export interface InfoModalProps {
  snapPoints?: (string | number)[];
  text?: string[];
  title?: string;
  values?: string[];
}

export interface InfoModalMethods {
  present: () => void;
}
