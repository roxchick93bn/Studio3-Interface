import React, { FC } from 'react';
import multiavatar from '@multiavatar/multiavatar';
import parse from 'html-react-parser';

import styles from './index.module.scss';

interface IAvatar {
  title: string;
}

const Avatar: FC<IAvatar> = ({ title }) => {
  return <div className={styles.wrapper}>{parse(multiavatar(title))}</div>;
};

export default Avatar;
