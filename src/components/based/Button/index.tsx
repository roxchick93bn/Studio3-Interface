import React, { FC } from 'react';
import { ButtonProps, default as MUIButton } from '@mui/material/Button';
import clsx from 'clsx';

import styles from './index.module.scss';

interface IButton extends ButtonProps {
  className?: string;
}

const Button: FC<IButton> = ({ className, children, size, ...props }) => {
  const classes = clsx(styles.button, className, styles[size as string]);

  return (
    <MUIButton className={classes} {...props}>
      {children}
    </MUIButton>
  );
};

export default Button;
