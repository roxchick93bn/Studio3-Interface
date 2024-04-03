import React, { FC } from 'react';
import {
  CircularProgressProps,
  default as MUICircularProgress,
} from '@mui/material/CircularProgress';
import clsx from 'clsx';

import styles from './index.module.scss';

interface ICircularProgress extends CircularProgressProps {
  className?: string;
}

const CircularProgress: FC<ICircularProgress> = ({ className, ...props }) => {
  const classes = clsx(styles.progress, className);

  return <MUICircularProgress className={classes} {...props} />;
};

export default CircularProgress;
