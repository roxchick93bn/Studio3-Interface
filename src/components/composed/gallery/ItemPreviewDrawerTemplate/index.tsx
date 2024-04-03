import React, { FC, useMemo, useState } from 'react';
import clsx from 'clsx';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import ArticleSharpIcon from '@mui/icons-material/ArticleSharp';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import { useWallet } from '@solana/wallet-adapter-react';
// import OpenInNewSharpIcon from '@mui/icons-material/OpenInNewSharp';
import {
  EditSharp,
  FileDownloadSharp,
  DeleteSharp,
  InfoSharp,
  // ShoppingCartSharp,
  FileCopySharp,
  TextRotateUpSharp,
  // ShareSharp,
} from '@mui/icons-material';
import { filesize } from 'filesize';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import EditModal from '../EditModal';
import ConfirmModal from '../ConfirmModal';

import styles from './index.module.scss';

import { useAuth } from '@/context/AuthContext';
import CircularProgress from '@/components/based/CircularProgress';
import IconButton from '@/components/based/IconButton';
import {
  usePreviewSelectedAsset,
  useUpdateTemplateAssets,
} from '@/state/template/hooks';
import {
  APP_API_URL,
  CONFIRM_MODAL_INFO,
  TEMPLATE_USER_ID,
} from '@/global/constants';
import { splitFileName } from '@/global/utils';
import useFetchAPI from '@/hooks/useFetchAPI';
import { useRemoveOpenedAsset } from '@/state/application/hooks';
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
  const handleUpdateTemplateAssets = useUpdateTemplateAssets();
  const removeOpenedAsset = useRemoveOpenedAsset();
  // const purchaseAsset = usePurchaseAsset();
  const [editModalOpend, setEditModalOpened] = useState(false);
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalContent, setConfirmModalContent] = useState('');
  const [confirmModalSubmitText, setConfirmModalSubmitText] = useState('');
  const { publicKey, signMessage } = useWallet();
  const {
    url: processedImageUrl,
    content: processedImageContent,
    processing,
  } = useProcessImage(asset);

  const isTemplateAsset = useMemo(() => {
    return asset?.user_uid === TEMPLATE_USER_ID;
  }, [asset]);

  const handleDuplicate = () => {
    setConfirmModalTitle(CONFIRM_MODAL_INFO.DUPLICATE.title);
    setConfirmModalContent(CONFIRM_MODAL_INFO.DUPLICATE.content);
    setConfirmModalSubmitText(CONFIRM_MODAL_INFO.DUPLICATE.submit);
    setConfirmModalOpened(true);
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

  const handleDelete = () => {
    setConfirmModalTitle(CONFIRM_MODAL_INFO.DELETE.title);
    setConfirmModalContent(CONFIRM_MODAL_INFO.DELETE.content);
    setConfirmModalSubmitText(CONFIRM_MODAL_INFO.DELETE.submit);
    setConfirmModalOpened(true);
  };

  const handleProcessDelete = () => {
    if (!asset) return;
    fetchAPI(
      `${APP_API_URL}/delete_asset`,
      'POST',
      {
        asset_uid: asset.uid,
        file_key: asset.file_path,
        file_name: asset.file_name,
      },
      true
    ).then((res) => {
      if (res.success) {
        toast.success('Deleted successfully!');
        handleUpdateTemplateAssets();
        removeOpenedAsset(asset.uid);
        onClose();
      }
    });
  };

  // const handlePurchase = async () => {
  //   const tx = await purchaseAsset();
  //   console.log(tx);
  // };

  const handleProcessDuplicate = () => {
    toast.loading('Duplicating Image...Please wait');
    if (!asset) return;
    fetchAPI(`${APP_API_URL}/duplicate_multi_asset`, 'POST', {
      asset_uid: asset.uid,
    }).then((res) => {
      toast.dismiss();
      if (res.success) {
        toast.success('Added Template to Projects!');

        navigate('/gallery');
        handleUpdateTemplateAssets();
        onClose();
      }
    });
  };

  const handleConfirmClose = () => {
    setConfirmModalOpened(false);
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
        <div
          className={styles.button}
          // we don't need to show the confirmation modal for templates
          onClick={handleProcessDuplicate}
        >
          <IconButton>
            <NoteAltOutlinedIcon />
          </IconButton>
          Add to Projects
        </div>
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
