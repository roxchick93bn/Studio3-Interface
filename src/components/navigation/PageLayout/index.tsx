import React, { FC, ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import styles from './index.module.scss';

import Sidebar from '@/components/navigation/Sidebar';
import { APP_ROUTES } from '@/config/routes';

interface IPageLayout {
  children: ReactNode;
}

const PageLayout: FC<IPageLayout> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Routes>
        {APP_ROUTES.map(
          (route) =>
            route.path != '/editor' && (
              <Route
                key={route.path}
                path={route.path}
                element={<Sidebar></Sidebar>}
              />
            )
        )}
        <Route key="/upload" path="/upload" element={<Sidebar></Sidebar>} />
      </Routes>
      <div className={styles.inner}>{children}</div>
    </div>
  );
};

export default PageLayout;
