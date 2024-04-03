import React, { FC } from 'react';
import { TabsProps, default as MUITabs } from '@mui/material/Tabs';
import clsx from 'clsx';

import styles from './index.module.scss';

interface ITabs extends TabsProps {
  className?: string;
}

const Tabs: FC<ITabs> = ({ className, children, ...props }) => {
  const classes = clsx(styles.tabs, className);

  return (
    <MUITabs className={classes} {...props}>
      {children}
    </MUITabs>
  );
};

export default Tabs;
