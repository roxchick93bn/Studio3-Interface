import clsx from 'clsx';
import React, { FC, ReactNode } from 'react';

import AccountIndicator from '../AccountIndicator';
import MoodSVG from '../../../Icons/mood.svg';
import SearchSVG from '../../../Icons/search.svg';

import styles from './index.module.scss';

interface IPageContainer {
  children: ReactNode;
  title?: string | ReactNode;
  variant?: string;
  heading?: ReactNode;
  noHeading?: boolean;
  onCreateMeme?: () => void;
}

const PageContainer: FC<IPageContainer> = ({
  title,
  heading,
  children,
  variant = '',
  noHeading = false,
  onCreateMeme,
}) => {
  const containerClasses = clsx(styles.container, { [variant]: noHeading });
  const bodyClasses = clsx(styles.body, { [variant]: !noHeading });

  return (
    <div className={containerClasses}>
      {noHeading ? (
        children
      ) : (
        <>
          <section className={styles.heading}>
            {
              <div className={styles.title}>
                <input className={styles.search} placeholder="Search" />
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <button className={styles.meme} onClick={onCreateMeme}>
                    <img src={MoodSVG} />
                    Create Meme
                  </button>
                  <AccountIndicator />
                </div>
              </div>
            }
          </section>
          <section className={bodyClasses}>{children}</section>
        </>
      )}
    </div>
  );
};

export default PageContainer;
