import React, { FC } from 'react';
import { TabProps, default as MUITab } from '@mui/material/Tab';
import clsx from 'clsx';

import styles from './index.module.scss';

interface ITab extends TabProps {
  className?: string;
}

const Tab: FC<ITab> = ({ className, children, ...props }) => {
  const classes = clsx(styles.tab, className);

  return (
    <MUITab className={classes} {...props}>
      {children}
    </MUITab>
  );
};

export default Tab;
