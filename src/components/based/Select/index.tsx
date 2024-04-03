import React, { FC, ReactNode } from 'react';
import clsx from 'clsx';
import { SelectProps, default as MUISelect } from '@mui/material/Select';
import KeyboardArrowDownSharpIcon from '@mui/icons-material/KeyboardArrowDownSharp';
import MenuItem from '@mui/material/MenuItem';

import styles from './index.module.scss';

type OptionValueType = string | number;
type OptionDataType = string | number | ReactNode;
type OptionType = {
  value: OptionValueType;
  data: OptionDataType;
};

interface ISelect extends SelectProps {
  className?: string;
  options: OptionType[];
}

const Select: FC<ISelect> = ({ className, options, ...props }) => {
  const classes = clsx(styles.select, className);

  return (
    <MUISelect
      className={classes}
      {...props}
      IconComponent={KeyboardArrowDownSharpIcon}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.data}
        </MenuItem>
      ))}
    </MUISelect>
  );
};

export default Select;
