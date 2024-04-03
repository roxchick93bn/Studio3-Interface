import React, { FC, ReactNode } from 'react';

import DeleteSVG from '../../../../Icons/modal-delete.svg';

import styles from './index.module.scss';

import Dialog from '@/components/based/Dialog';
import Button from '@/components/based/Button';

interface IDeleteModal {
  open: boolean;
  onClose: (_: any, reason: string) => void;
  onConfirm: () => void;
  type: boolean;
  filename?: string;
}

const DeleteModal: FC<IDeleteModal> = ({
  open,
  type,
  filename,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      className={styles.modal}
      open={open}
      onClose={onClose}
      showClose={false}
    >
      <img src={DeleteSVG} />
      <div className={styles.description}>
        <div className={styles.title}>
          Are you sure want to delete{' '}
          {type == true ? 'this file' : 'selected files'}
        </div>
        {type == true ? (
          <div className={styles.filename}>
            <br />
            {filename}
          </div>
        ) : (
          <></>
        )}
        <div className={styles.actions}>
          <Button
            size="medium"
            className={styles.button}
            onClick={() => onClose(null, 'cancel')}
          >
            Cancel
          </Button>
          <Button size="medium" className={styles.submit} onClick={onConfirm}>
            Delete{' '}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteModal;
