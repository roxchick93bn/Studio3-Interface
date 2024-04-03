import React, { FC, ReactNode, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import styles from './index.module.scss';

import Dialog from '@/components/based/Dialog';
import Button from '@/components/based/Button';

interface IDownloadModal {
  title: string;
  content: string | ReactNode;
  submitText?: string;
  open: boolean;
  onClose: (_: any, reason: string) => void;
  onConfirm: (option: string, data: any) => void;
  isPending: boolean;
}

const DownloadModal: FC<IDownloadModal> = ({
  open,
  title,
  content,
  submitText = 'OK',
  onClose,
  onConfirm,
  isPending,
}) => {
  const { publicKey } = useWallet();
  const [option, setOption] = useState<string>('1');
  const nameRef = useRef<HTMLInputElement>(null);
  const symbolRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const royaltyRef = useRef<HTMLInputElement>(null);
  const creatorRef = useRef<HTMLInputElement>(null);
  return (
    <Dialog
      className={styles.modal}
      open={open}
      onClose={onClose}
      title={title}
    >
      <div className={styles.content}>
        <div>{content}</div>
        <select
          className={styles.select}
          onChange={(e) => {
            setOption(e.target.value);
          }}
          value={option}
        >
          <option className={styles.option} value="1">
            Download with watermark
          </option>
          <option className={styles.option} value="2">
            Pay 0.25 SOL to download clean image
          </option>
          <option className={styles.option} value="3">
            Pay 0.5 SOL to mint NFT
          </option>
        </select>
        {option === '3' && (
          <>
            <div className={styles.list}>
              <div>Name</div>
              <input ref={nameRef} defaultValue="" />
            </div>
            <div className={styles.list}>
              <div>Symbol</div>
              <input ref={symbolRef} defaultValue="" />
            </div>
            <div className={styles.list}>
              <div>Description</div>
              <textarea ref={descriptionRef} defaultValue="" />
            </div>
            <div className={styles.list}>
              <div>Royalty (%)</div>
              <input ref={royaltyRef} defaultValue="" />
            </div>
            <div className={styles.list}>
              <div>Creator</div>
              <input ref={creatorRef} defaultValue={publicKey?.toString()} />
            </div>
          </>
        )}
      </div>
      <div className={styles.actions}>
        <Button
          size="medium"
          className={styles.button}
          onClick={() => onClose(null, 'cancel')}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          size="medium"
          className={styles.submit}
          onClick={() =>
            onConfirm(option, {
              name: nameRef.current?.value,
              symbol: symbolRef.current?.value,
              description: descriptionRef.current?.value,
              royalty: royaltyRef.current?.value,
              creator: creatorRef.current?.value,
            })
          }
          disabled={isPending}
        >
          {isPending ? '...' : submitText}
        </Button>
      </div>
    </Dialog>
  );
};

export default DownloadModal;
