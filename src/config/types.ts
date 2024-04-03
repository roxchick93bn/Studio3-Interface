/* eslint-disable @typescript-eslint/ban-types */
import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { ReactNode } from 'react';

export interface RouteType {
  path: string;
  component: ReactNode;
  title: string;
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
    muiName: string;
  };
  isMenuLinked: boolean;
  isDisabled: boolean;
}
