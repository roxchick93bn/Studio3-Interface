import React, { FC } from 'react';

import styles from './index.module.scss';

interface IGalleryHeading {
  title: string;
}

const GalleryHeading: FC<IGalleryHeading> = ({ title }) => {
  return (
    <div className={styles.inner}>
      <div className={styles.title}>{title}</div>
    </div>
  );
};

export default GalleryHeading;
