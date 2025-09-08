import { useActionSheet } from '@expo/react-native-action-sheet';

export const useConfirmAction = () => {
  const { showActionSheetWithOptions } = useActionSheet();

  return (
    opts: {
      label: string;
      title?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    },
    onConfirm?: () => void,
  ): Promise<boolean> => {
    return new Promise(resolve => {
      showActionSheetWithOptions(
        {
          options: [opts.label, 'Cancel'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
          title: opts.title,
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            if (onConfirm) {
              setTimeout(() => {
                onConfirm();
              }, 1000);
            }
            resolve(true);
          } else {
            resolve(false);
          }
        },
      );
    });
  };
};
