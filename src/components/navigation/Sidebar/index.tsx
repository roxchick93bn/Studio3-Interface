import React, { SyntheticEvent, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UploadIcon from '@mui/icons-material/Upload';

import styles from './index.module.scss';

import { useAuth } from '@/context/AuthContext';
import { APP_ROUTES } from '@/config/routes';
import LogoImage from '@/assets/images/logo-svg.svg';
import Tabs from '@/components/based/Tabs';
import Tab from '@/components/based/Tab';
import AccountIndicator from '@/components/navigation/AccountIndicator';
import {
  usePreviewSelectedId,
  useUpdatePreviewSelectedId,
} from '@/state/gallery/hooks';

const Sidebar = () => {
  const { isVerified } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const previewSelectId = usePreviewSelectedId();
  const updatePreviewSelectId = useUpdatePreviewSelectedId();
  const pathIndex = useMemo(
    () =>
      APP_ROUTES.filter(
        (route) => route.isMenuLinked && !route.isDisabled
      ).findIndex((route) => location.pathname.startsWith(route.path)),
    [location]
  );
  const [value, setValue] = React.useState(pathIndex);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (previewSelectId) updatePreviewSelectId(previewSelectId);
  };

  useEffect(() => {
    setValue(pathIndex == -1 ? 3 : pathIndex);
  }, [pathIndex]);

  const a11yProps = (index: number) => {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`,
    };
  };

  return (
    <div className={styles.sidebar}>
      <section className={styles.topSection}>
        <img className={styles.logo} src={LogoImage} />
        <Tabs
          className={styles.navMenus}
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs"
          sx={{ borderRight: 1, borderColor: 'divider' }}
        >
          {APP_ROUTES.filter(
            (route) => route.isMenuLinked && !route.isDisabled
          ).map((route, idx) => (
            <Tab
              key={route.path}
              disabled={route.isDisabled}
              label={
                <div className={styles.menu}>
                  <route.Icon />
                  {route.title}
                </div>
              }
              onClick={() => navigate(route.path)}
              {...a11yProps(idx)}
            />
          ))}
          {isVerified == true ? (
            <Tab
              disabled={false}
              label={
                <div className={styles.menu}>
                  <UploadIcon />
                  Upload
                </div>
              }
              onClick={() => navigate('/upload')}
            />
          ) : (
            <></>
          )}
        </Tabs>
      </section>
    </div>
  );
};

export default Sidebar;
