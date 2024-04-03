import React, { FC, useMemo, useState } from 'react';

import styles from './index.module.scss';

import Dialog from '@/components/based/Dialog';
import PlaceholderImage from '@/assets/images/placeholder.png';
import Select from '@/components/based/Select';
import { useTokenMap } from '@/state/solana/hooks';
import { TOKEN_LIST } from '@/global/constants';
import TextField from '@/components/based/TextField';
import Button from '@/components/based/Button';

interface IExportModal {
  open: boolean;
  onClose: () => void;
}

const ExportModal: FC<IExportModal> = ({ open, onClose }) => {
  const tokenMap = useTokenMap();
  const tokens = useMemo(() => {
    return TOKEN_LIST.map((address) => {
      const token = tokenMap.get(address);

      return {
        value: address,
        data: (
          <>
            <img
              className={styles.logo}
              src={token?.logoURI}
              alt="token-logo"
            />
            <span>{token?.symbol}</span>
          </>
        ),
      };
    });
  }, [tokenMap]);
  const [selectedToken, setSelectedToken] = useState<string>(TOKEN_LIST[0]);

  return (
    <Dialog
      className={styles.modal}
      open={open}
      onClose={onClose}
      title="Export Design"
    >
      <div className={styles.imageWrapper}>
        <img src={PlaceholderImage} />
      </div>
      <div className={styles.watermark}>
        Export design without watermark:
        <div className={styles.controls}>
          <TextField className={styles.amount} defaultValue="100" />
          <Select
            options={tokens}
            value={selectedToken}
            onChange={(ev) => setSelectedToken(ev.target.value as string)}
          />
        </div>
      </div>
      <div className={styles.actions}>
        <Button size="medium" className={styles.button}>
          Cancel
        </Button>
        <Button size="medium" className={styles.button}>
          Export
        </Button>
      </div>
    </Dialog>
  );
};

export default ExportModal;
