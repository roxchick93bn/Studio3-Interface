import React, { FC } from 'react';
import {
  StandardTextFieldProps,
  default as MUITextField,
} from '@mui/material/TextField';
import clsx from 'clsx';

import styles from './index.module.scss';

interface ITextField extends StandardTextFieldProps {
  className?: string;
}

const TextField: FC<ITextField> = ({ className, ...props }) => {
  const classes = clsx(styles.textField, className);

  return <MUITextField className={classes} {...props} />;
};

export default TextField;
