import React, { FC } from 'react';
import {
  IconButtonProps,
  default as MUIIconButton,
} from '@mui/material/IconButton';
import clsx from 'clsx';

import styles from './index.module.scss';

interface IIconButton extends IconButtonProps {
  className?: string;
}

const IconButton: FC<IIconButton> = ({ className, children, ...props }) => {
  const classes = clsx(styles.button, className);

  return (
    <MUIIconButton className={classes} {...props}>
      {children}
    </MUIIconButton>
  );
};

export default IconButton;
