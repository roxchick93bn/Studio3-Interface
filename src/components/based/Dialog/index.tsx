import React, { FC } from 'react';
import clsx from 'clsx';
import { DialogProps, default as MUIDialog } from '@mui/material/Dialog';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';

import IconButton from '../IconButton';

import styles from './index.module.scss';

interface IDialog extends DialogProps {
  className?: string;
  title?: string;
  showClose?: boolean;
}

const Dialog: FC<IDialog> = ({
  className,
  title = '',
  children,
  onClose,
  showClose = true,
  ...props
}) => {
  const classes = clsx(styles.dialog, className);

  return (
    <MUIDialog className={classes} onClose={onClose} {...props}>
      <section className={styles.heading}>
        <div className={styles.title}>{title}</div>
        {onClose && showClose && (
          <IconButton
            size="small"
            className={styles.close}
            onClick={() => onClose({}, 'escapeKeyDown')}
          >
            <CloseSharpIcon />
          </IconButton>
        )}
      </section>
      <section className={styles.content}>{children}</section>
    </MUIDialog>
  );
};

export default Dialog;
