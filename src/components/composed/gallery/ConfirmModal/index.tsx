import React, { FC, ReactNode } from 'react';

import styles from './index.module.scss';

import Dialog from '@/components/based/Dialog';
import Button from '@/components/based/Button';

interface IConfirmModal {
  title: string;
  content: string | ReactNode;
  submitText?: string;
  open: boolean;
  onClose: (_: any, reason: string) => void;
  onConfirm: () => void;
}

const ConfirmModal: FC<IConfirmModal> = ({
  open,
  title,
  content,
  submitText = 'OK',
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      className={styles.modal}
      open={open}
      onClose={onClose}
      title={title}
    >
      <div className={styles.content}>{content}</div>
      <div className={styles.actions}>
        <Button
          size="medium"
          className={styles.button}
          onClick={() => onClose(null, 'cancel')}
        >
          Cancel
        </Button>
        <Button size="medium" className={styles.submit} onClick={onConfirm}>
          {submitText}
        </Button>
      </div>
    </Dialog>
  );
};

export default ConfirmModal;
