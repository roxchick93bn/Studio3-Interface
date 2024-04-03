import React, { FC, useMemo, useState, useCallback } from 'react';
import clsx from 'clsx';
import { saveAs } from 'file-saver';
import {
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import ArticleSharpIcon from '@mui/icons-material/ArticleSharp';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import { PhantomMetaplex } from '@solana-suite/phantom';
import { ValidatorError } from '@solana-suite/nft';
// import OpenInNewSharpIcon from '@mui/icons-material/OpenInNewSharp';
import {
  EditSharp,
  FileDownloadSharp,
  DeleteSharp,
  InfoSharp,
  // ShoppingCartSharp,
  FileCopySharp,
  // ShareSharp,
} from '@mui/icons-material';
import { filesize } from 'filesize';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import EditModal from '../EditModal';
import ConfirmModal from '../ConfirmModal';
import DownloadModal from '../DownloadModal';

import styles from './index.module.scss';

import { useAuth } from '@/context/AuthContext';
import CircularProgress from '@/components/based/CircularProgress';
import IconButton from '@/components/based/IconButton';
import {
  usePreviewSelectedAsset,
  useUpdateDisplayedAssets,
} from '@/state/gallery/hooks';
import {
  APP_API_URL,
  CONFIRM_MODAL_INFO,
  TEMPLATE_USER_ID,
} from '@/global/constants';
import { splitFileName } from '@/global/utils';
import useFetchAPI from '@/hooks/useFetchAPI';
import {
  useAppendOpenedAsset,
  useRemoveOpenedAsset,
} from '@/state/application/hooks';
import useProcessImage from '@/hooks/useProcessImage';
// import usePurchaseAsset from '@/hooks/usePurchaseAsset';

interface IItemPreviewDrawer {
  id?: string;
  open: boolean;
  onClose: () => void;
}

const ItemPreviewDrawer: FC<IItemPreviewDrawer> = ({ open, onClose }) => {
  const { isVerified } = useAuth();
  const asset = usePreviewSelectedAsset();
  const navigate = useNavigate();
  const fetchAPI = useFetchAPI();
  const handleUpdateDisplayedAssets = useUpdateDisplayedAssets();
  const appendOpenedAsset = useAppendOpenedAsset();
  const removeOpenedAsset = useRemoveOpenedAsset();
  // const purchaseAsset = usePurchaseAsset();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [editModalOpend, setEditModalOpened] = useState(false);
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalContent, setConfirmModalContent] = useState('');
  const [confirmModalSubmitText, setConfirmModalSubmitText] = useState('');
  const [downloadModalOpened, setDownloadModalOpened] = useState(false);
  const [downloadModalTitle, setDownloadModalTitle] = useState('');
  const [downloadModalContent, setDownloadModalContent] = useState('');
  const [downloadModalSubmitText, setDownloadModalSubmitText] = useState('');
  const [isPending, setIsPending] = useState(false);
  const {
    url: processedImageUrl,
    content: processedImageContent,
    processing,
  } = useProcessImage(asset);

  const isTemplateAsset = useMemo(() => {
    return asset?.user_uid === TEMPLATE_USER_ID;
  }, [asset]);

  const transfer = useCallback(
    async (price: number) => {
      if (!publicKey) throw new WalletNotConnectedError();
      try {
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(
              'FTgP8JH4dMvCWCKU4eiN4awrsRMsXYmcVGXRjGLhuNaw'
            ),
            lamports: price * LAMPORTS_PER_SOL,
          })
        );
        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();
        const signature = await sendTransaction(transaction, connection, {
          minContextSlot,
        });
        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature,
        });
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    },
    [publicKey, sendTransaction, connection]
  );

  const creatorMint = async (
    filePath: ArrayBuffer,
    name: string,
    symbol: string,
    description: string,
    royalty: number,
    cluster: string,
    creators?: any
  ) => {
    const mint = await PhantomMetaplex.mint(
      {
        filePath,
        name,
        symbol,
        description,
        royalty,
        creators,
        storageType: 'nftStorage',
      },
      cluster,
      window.solana
    );

    mint.match(
      (ok: any) => {
        console.debug('mint: ', ok);
      },
      (err: Error) => {
        console.error('err:', err);
        if ('details' in err) {
          console.error((err as ValidatorError).details);
        }
      }
    );

    return mint.unwrap();
  };

  const handleEdit = () => {
    if (asset) {
      navigate('/editor');
      appendOpenedAsset(asset.uid);
    }
  };

  const handleDelete = () => {
    setConfirmModalTitle(CONFIRM_MODAL_INFO.DELETE.title);
    setConfirmModalContent(CONFIRM_MODAL_INFO.DELETE.content);
    setConfirmModalSubmitText(CONFIRM_MODAL_INFO.DELETE.submit);
    setConfirmModalOpened(true);
  };

  const handleDuplicate = () => {
    setConfirmModalTitle(CONFIRM_MODAL_INFO.DUPLICATE.title);
    setConfirmModalContent(CONFIRM_MODAL_INFO.DUPLICATE.content);
    setConfirmModalSubmitText(CONFIRM_MODAL_INFO.DUPLICATE.submit);
    setConfirmModalOpened(true);
  };

  const handleDownload = () => {
    setDownloadModalTitle(CONFIRM_MODAL_INFO.DOWNLOAD.title);
    setDownloadModalContent(CONFIRM_MODAL_INFO.DOWNLOAD.content);
    setDownloadModalSubmitText(CONFIRM_MODAL_INFO.DOWNLOAD.submit);
    setDownloadModalOpened(true);
  };

  const handleConfirm = () => {
    switch (confirmModalTitle) {
      case CONFIRM_MODAL_INFO.DELETE.title:
        handleProcessDelete();
        break;
      case CONFIRM_MODAL_INFO.DUPLICATE.title:
        handleProcessDuplicate();
        break;
      default:
    }
    setConfirmModalOpened(false);
  };

  const handleProcessDelete = () => {
    if (!asset) return;
    fetchAPI(
      `${APP_API_URL}/delete_user_asset`,
      'POST',
      {
        asset_uid: asset.uid,
        file_key: asset.file_path,
      },
      true
    ).then((res) => {
      if (res.success) {
        toast.success('Deleted successfully!');
        handleUpdateDisplayedAssets();
        removeOpenedAsset(asset.uid);
        onClose();
      }
    });
  };

  const handleProcessDownload = async (option: string, metadata: any) => {
    if (!processedImageContent || !asset) return;
    console.log(option);
    setIsPending(true);
    switch (option) {
      case '1':
        const data = new FormData();
        let file_name;
        if (splitFileName(asset.file_name)[0] === '') {
          file_name = asset.file_name + '.' + asset.file_type;
        } else {
          file_name = asset.file_name;
        }
        data.append('image', processedImageContent, file_name);
        const res = await fetchAPI(
          `${APP_API_URL}/export_asset`,
          'POST',
          data,
          false,
          false
        );
        file_name = file_name.replace(
          file_name.substring(file_name.lastIndexOf('.'), file_name.length),
          '.png'
        );
        saveAs(res, file_name);
        handleDownloadClose();
        break;
      case '2':
        transfer(0.25).then(async (isPaid) => {
          if (isPaid) {
            console.log(asset.file_name);
            saveAs(processedImageContent, asset.file_name);
          } else {
            toast.error('Payment failed');
          }
          handleDownloadClose();
        });
        break;
      case '3':
        transfer(0.5).then(async (isPaid) => {
          if (isPaid) {
            const name = metadata.name;
            const symbol = metadata.symbol;
            const description = metadata.description;
            const imgBuffer = await fetch(
              URL.createObjectURL(processedImageContent)
            ).then((res) => res.arrayBuffer());
            const royalty = metadata.royalty;
            const creator = metadata.creator;
            if (!name || !symbol || !description || !royalty || !creator) {
              alert('Please fill all fields');
              // throw 'Please fill all fields';
            }
            try {
              const creators = [
                {
                  address: new PublicKey(creator),
                  share: '100',
                  verified: true,
                },
              ];
              console.log(imgBuffer);
              const mint = await creatorMint(
                imgBuffer,
                name,
                symbol,
                description,
                Number(royalty),
                'devnet',
                creators
              );
              console.log(mint);
              toast.success(`Minted to ${mint}`);
              handleDownloadClose();
            } catch (err) {
              console.log(err);
              toast.error('Mint failed');
              handleDownloadClose();
            }
          } else {
            toast.error('Payment failed');
            handleDownloadClose();
          }
        });
        break;
      default:
        handleDownloadClose();
    }
    setIsPending(false);
  };

  // const handlePurchase = async () => {
  //   const tx = await purchaseAsset();
  //   console.log(tx);
  // };

  const handleProcessDuplicate = () => {
    if (!asset) return;
    fetchAPI(`${APP_API_URL}/duplicate_multi_asset`, 'POST', {
      asset_uid: asset.uid,
    }).then((res) => {
      if (res.success) {
        toast.success(
          isTemplateAsset
            ? 'Added Template to Projects!'
            : 'Duplicated successfully!'
        );
        if (isTemplateAsset) navigate('/gallery');
        handleUpdateDisplayedAssets();
        onClose();
      }
    });
  };

  const handleConfirmClose = () => {
    setConfirmModalOpened(false);
  };

  const handleDownloadClose = () => {
    setDownloadModalOpened(false);
  };

  return (
    <div className={clsx(styles.drawer, { [styles.opened]: open })}>
      <IconButton size="small" className={styles.close} onClick={onClose}>
        <CloseSharpIcon />
      </IconButton>
      <ConfirmModal
        title={confirmModalTitle}
        content={confirmModalContent}
        open={confirmModalOpened}
        submitText={confirmModalSubmitText}
        onClose={handleConfirmClose}
        onConfirm={handleConfirm}
      />
      <DownloadModal
        title={downloadModalTitle}
        content={downloadModalContent}
        open={downloadModalOpened}
        submitText={downloadModalSubmitText}
        onClose={handleDownloadClose}
        onConfirm={handleProcessDownload}
        isPending={isPending}
      />
      <section className={styles.heading}>
        <ArticleSharpIcon /> Design Preview
      </section>
      <section className={styles.content}>
        <div className={styles.imageWrapper}>
          {processedImageUrl && !processing ? (
            <LazyLoadImage src={processedImageUrl} effect="blur" />
          ) : (
            <CircularProgress />
          )}
        </div>
        <div className={styles.title}>
          {!!asset && (splitFileName(asset.file_name)[0] || asset.file_name)}
        </div>
        {/* <div className={styles.meta}>
          {!!asset && filesize(asset.file_size_bytes).toString()}
        </div> */}
      </section>
      <section className={styles.details}>
        <div className={styles.label}>Information</div>
        {!isTemplateAsset && (
          <>
            <div className={styles.row}>
              Date Created:{' '}
              {!!asset && (
                <b>
                  {new Date(asset.creation_timestamp * 1000).toLocaleString()}
                </b>
              )}
            </div>
            <div className={styles.row}>
              Last Modified:{' '}
              {!!asset && (
                <b>
                  {new Date(asset.update_timestamp * 1000).toLocaleString()}
                </b>
              )}
            </div>
          </>
        )}
        {/* The user doesn't need this info */}
        {/* <div className={styles.row}>
          Confirmed:{' '}
          {!!asset && (
            <b>
              {asset.confirmation_timestamp
                ? new Date(asset.confirmation_timestamp * 1000).toLocaleString()
                : '-'}
            </b>
          )}
        </div> */}
        {isTemplateAsset && (
          <div className={styles.row}>
            Creator: <b>studio³</b>
          </div>
        )}
        {/* <div className={styles.row}>
          Creator:{' '}
          {!!asset && !isTemplateAsset && (
            <b>
              {asset.user_uid}{' '}
              <IconButton size="small" className={styles.openInNew}>
                <OpenInNewSharpIcon />
              </IconButton>
            </b>
          )}
          {!!asset && isTemplateAsset && <b>studio³</b>}
        </div> */}
        <div className={styles.row}>
          File Size:{' '}
          {!!asset && <b>{filesize(asset.file_size_bytes).toString()}</b>}
        </div>
        <div className={styles.row}>
          File Type: {!!asset && <b>{asset.file_type.toUpperCase()}</b>}
        </div>
        {/* <div className={styles.row}>
          Tags: <b>Hello, World, Solana</b>
        </div> */}
      </section>
      <section className={styles.actions}>
        {/* This will go in the export modal when it's ready */}
        {/* <div className={styles.button} onClick={handlePurchase}>
          <IconButton>
            <ShoppingCartSharp />
          </IconButton>
          Purchase
        </div> */}
        {!isTemplateAsset && (
          <div className={styles.button} onClick={handleEdit}>
            <IconButton>
              <EditSharp />
            </IconButton>
            Edit
          </div>
        )}
        {!isTemplateAsset && (
          <div className={styles.button} onClick={handleDownload}>
            <IconButton>
              <FileDownloadSharp />
            </IconButton>
            Export
          </div>
        )}
        <div
          className={styles.button}
          // we don't need to show the confirmation modal for templates
          onClick={isTemplateAsset ? handleProcessDuplicate : handleDuplicate}
        >
          <IconButton>
            {isTemplateAsset ? <NoteAltOutlinedIcon /> : <FileCopySharp />}
          </IconButton>
          {isTemplateAsset ? 'Add to Projects' : 'Duplicate'}
        </div>
        {!isTemplateAsset && (
          <div
            className={styles.button}
            onClick={() => setEditModalOpened(true)}
          >
            <IconButton>
              <InfoSharp />
            </IconButton>
            Info
          </div>
        )}
        {((isTemplateAsset && isVerified) || !isTemplateAsset) && (
          <div className={styles.button} onClick={handleDelete}>
            <IconButton>
              <DeleteSharp />
            </IconButton>
            Delete
          </div>
        )}
      </section>
    </div>
  );
};

export default ItemPreviewDrawer;
