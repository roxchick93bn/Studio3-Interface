import React, { FC, useEffect, useRef, useState, useCallback } from 'react';
import clsx from 'clsx';
import { saveAs } from 'file-saver';
import { Card } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { grey } from '@mui/material/colors';
// import { filesize } from 'filesize';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import {
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { PhantomMetaplex } from '@solana-suite/phantom';
import { ValidatorError } from '@solana-suite/nft';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';

import CheckSVG from '../../../../Icons/check.svg';
import CheckedSVG from '../../../../Icons/checked.svg';
import OptionSVG from '../../../../Icons/option.svg';
import OpenedSVG from '../../../../Icons/opened.svg';
import ArrowSVG from '../../../../Icons/context-arrow.svg';
import CopySVG from '../../../../Icons/context-copy.svg';
import EditSVG from '../../../../Icons/context-edit.svg';
import ExportSVG from '../../../../Icons/context-export.svg';
import MintSVG from '../../../../Icons/context-mint.svg';
import DeleteSVG from '../../../../Icons/context-delete.svg';
import BackSVG from '../../../../Icons/context-arrow_back.svg';
import renameSVG from '../../../../Icons/info.svg';
import ConfirmModal from '../ConfirmModal';
import EditModal from '../EditModal';
import DeleteModal from '../DeleteModal';

import styles from './index.module.scss';

import useFetchAPI from '@/hooks/useFetchAPI';
import { AssetInfoType } from '@/global/types';
import { splitFileName } from '@/global/utils';
import CircularProgress from '@/components/based/CircularProgress';
import useProcessThumbnail from '@/hooks/useProcessThumbnail';
import useProcessImage from '@/hooks/useProcessImage';
import {
  useAppendOpenedAsset,
  useRemoveOpenedAsset,
} from '@/state/application/hooks';
import { useUpdatePreviewSelectedId } from '@/state/gallery/hooks';
import { APP_API_URL, CONFIRM_MODAL_INFO } from '@/global/constants';
import { useUpdateTemplateAssets } from '@/state/template/hooks';
import { useUpdateDisplayedAssets } from '@/state/gallery/hooks';

interface IItemWidget {
  title?: string;
  type: number;
  asset: AssetInfoType;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

const ItemWidget: FC<IItemWidget> = ({
  type,
  selected,
  asset,
  onClick,
  onDoubleClick,
}) => {
  const navigate = useNavigate();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { url: processedImg } = useProcessThumbnail(asset);
  const appendOpenedAsset = useAppendOpenedAsset();
  const [editModalOpend, setEditModalOpened] = useState(false);
  const [visible, setVisible] = useState(false);
  const [menuType, setMenuType] = useState(0);
  const [value, setValue] = useState('without');
  const updatePreviewSelectedId = useUpdatePreviewSelectedId();
  const fetchAPI = useFetchAPI();
  const nameRef = useRef<HTMLInputElement>(null);
  const symbolRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const royaltyRef = useRef<HTMLInputElement>(null);
  const creatorRef = useRef<HTMLInputElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const handleUpdateTemplateAssets = useUpdateTemplateAssets();
  const handleUpdateDisplayedAssets = useUpdateDisplayedAssets();
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalContent, setConfirmModalContent] = useState('');
  const [confirmModalSubmitText, setConfirmModalSubmitText] = useState('');
  const [deleleteModalOpened, setDeleteModalOpened] = useState(false);
  const removeOpenedAsset = useRemoveOpenedAsset();
  const [isPending, setIsPending] = useState(false);
  const {
    url: processedImageUrl,
    content: processedImageContent,
    processing,
  } = useProcessImage(asset);
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
  const processName = () => {
    const tmp = splitFileName(asset.file_name)[0];
    let res = '';
    if (tmp.search('-') != -1) {
      const list = tmp.split('-');
      list.map((val, ind) => {
        const tt = val.charAt(0).toUpperCase() + val.slice(1);
        // if (ind == 0 && val.toLowerCase() != 'meme') res = tt;
        // if (ind != 0 && res == '') res = tt;
        // else if (
        //   (ind == list.length - 1 && isNaN(parseInt(tt))) ||
        //   (ind != list.length - 1 && res != '')
        // )
        //   res = res + ' ' + tt;
        if (ind == 0) {
          if (val.toLowerCase() != 'meme') res = tt;
        } else if (ind == list.length - 1) {
          if (isNaN(parseInt(tt))) res = res + ' ' + tt;
        } else {
          if (res == '') res = tt;
          else res = res + ' ' + tt;
        }
      });
      return res;
    } else return tmp;
  };

  const handleConfirmClose = () => {
    setConfirmModalOpened(false);
  };

  const handleDeleteClose = () => {
    setDeleteModalOpened(false);
  };

  const handleConfirm = () => {
    handleProcessDuplicate();
    setConfirmModalOpened(false);
  };

  const handleDeleteConfirm = () => {
    handleProcessDelete();
    setDeleteModalOpened(false);
  };

  const handleProcessDelete = () => {
    if (!asset) return;
    console.log(asset);
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
        handleUpdateDisplayedAssets();
        removeOpenedAsset(asset.uid);
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
      }
    });
  };

  const handleDelete = () => {
    setDeleteModalOpened(true);
  };

  const handleDuplicate = () => {
    setConfirmModalTitle(CONFIRM_MODAL_INFO.DUPLICATE.title);
    setConfirmModalContent(CONFIRM_MODAL_INFO.DUPLICATE.content);
    setConfirmModalSubmitText(CONFIRM_MODAL_INFO.DUPLICATE.submit);
    setConfirmModalOpened(true);
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
        setMenuType(0);
        setVisible(false);
        break;
      case '2':
        transfer(0.25).then(async (isPaid) => {
          if (isPaid) {
            console.log(asset.file_name);
            saveAs(processedImageContent, asset.file_name);
          } else {
            toast.error('Payment failed');
          }
          setMenuType(0);
          setVisible(false);
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
              setMenuType(0);
              setVisible(false);
            } catch (err) {
              console.log(err);
              toast.error('Mint failed');
              setMenuType(0);
              setVisible(false);
            }
          } else {
            toast.error('Payment failed');
            setMenuType(0);
            setVisible(false);
          }
        });
        break;
      default:
        setMenuType(0);
        setVisible(false);
    }
    toast.dismiss();
    setIsPending(false);
  };

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);
  const handleClick = (event: any) => {
    const showMenu = document.getElementById(`showmenu-${asset.uid}`);
    if (
      !contextRef.current?.contains(event.target as Node) &&
      !showMenu?.contains(event.target as Node) &&
      asset.uid != event.target?.id
    ) {
      setVisible(false);
      setMenuType(0);
    }
  };

  const setMenu = async (ind: any) => {
    setMenuType(ind);
    setVisible(true);
  };

  const handleShowClick = (event: any) => {
    updatePreviewSelectedId(asset.uid);
    const contextMenu = document.getElementById(`contextmenu-${asset.uid}`);
    setVisible(true);
    if (event.target.getBoundingClientRect().left + 260 > window.innerWidth) {
      const cls = contextMenu?.getAttribute('style');
      contextMenu?.setAttribute('style', cls + ' left:10px !important;');
    } else {
      contextMenu?.setAttribute('style', 'display: block;');
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  const handleEdit = () => {
    navigate('/editor');
    appendOpenedAsset(asset.uid);
  };
  return (
    <div
      className={
        styles.card + ' ' + (type == 2 ? styles.asset : styles.thumbnail)
      }
    >
      {isPending ? toast.loading('Processing') : false}
      <ConfirmModal
        title={confirmModalTitle}
        content={confirmModalContent}
        open={confirmModalOpened}
        submitText={confirmModalSubmitText}
        onClose={handleConfirmClose}
        onConfirm={handleConfirm}
      />
      <DeleteModal
        open={deleleteModalOpened}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        type={true}
        filename={processName() + '.' + asset.file_type}
      />
      <EditModal
        open={editModalOpend}
        uid={asset}
        onClose={() => setEditModalOpened(false)}
      />
      {type == 1 ? (
        <>
          {selected == true ? (
            <>
              <img className={styles.checked} src={CheckedSVG} />
              <img
                className={styles.option1}
                src={visible ? OpenedSVG : OptionSVG}
                id={`showmenu-${asset.uid}`}
                onClick={(event) => handleShowClick(event)}
              />
            </>
          ) : (
            <>
              <img className={styles.check} src={CheckSVG} />
              <img
                className={visible ? styles.option1 : styles.option}
                src={visible ? OpenedSVG : OptionSVG}
                id={`showmenu-${asset.uid}`}
                onClick={(event) => handleShowClick(event)}
              />
            </>
          )}
          <div
            className={styles.contextmenu}
            style={{
              display: visible == true ? 'block' : 'none',
            }}
            id={`contextmenu-${asset.uid}`}
            ref={contextRef}
          >
            {menuType == 0 ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    gap: '5px',
                    flexDirection: 'column',
                    padding: '15px',
                  }}
                >
                  <div
                    style={{
                      paddingTop: '10px',
                      fontSize: '24px',
                      fontStyle: 'bold',
                    }}
                  >
                    {asset.file_name.split('.')[0]}
                  </div>
                  <div className={styles.info}>
                    Date Created:{' '}
                    {new Date(
                      asset.creation_timestamp * 1000
                    ).toLocaleDateString()}
                  </div>
                  <div className={styles.info}>
                    File Size: {Math.floor(asset.file_size_bytes / 1024)}
                    KB
                  </div>
                  <div className={styles.info} style={{}}>
                    File Type: {asset.file_type}
                  </div>
                </div>
                <div className={styles.border}></div>
                <div
                  style={{
                    display: 'flex',
                    gap: '15px',
                    flexDirection: 'column',
                    padding: '15px',
                  }}
                >
                  <div className={styles.buttons} onClick={handleEdit}>
                    <img src={EditSVG} style={{ marginRight: '10px' }} />
                    <span>Edit</span>
                  </div>
                  <div
                    id={`${asset.uid}`}
                    className={styles.buttons}
                    onClick={() => setMenu(1)}
                  >
                    <img src={ExportSVG} style={{ marginRight: '10px' }} />
                    Export
                    <img
                      src={ArrowSVG}
                      style={{ position: 'absolute', right: '20px' }}
                    />
                  </div>
                  <div
                    className={styles.buttons}
                    onClick={() => setMenu(2)}
                    id={`${asset.uid}`}
                  >
                    <img src={MintSVG} style={{ marginRight: '10px' }} />
                    Mint to NFT
                    <img
                      src={ArrowSVG}
                      style={{ position: 'absolute', right: '20px' }}
                    />
                  </div>
                  <div className={styles.buttons} onClick={handleDuplicate}>
                    <img
                      src={CopySVG}
                      style={{ marginRight: '10px' }}
                      id={`${asset.uid}`}
                    />
                    <span id={`${asset.uid}`}>Make a copy</span>
                  </div>
                  <div
                    className={styles.buttons}
                    onClick={() => setEditModalOpened(true)}
                  >
                    <img
                      src={renameSVG}
                      style={{ marginRight: '10px' }}
                      id={`${asset.uid}`}
                    />
                    <span id={`${asset.uid}`}>Rename</span>
                  </div>
                  <div className={styles.buttons} onClick={handleDelete}>
                    <img
                      src={DeleteSVG}
                      style={{ marginRight: '10px' }}
                      id={`${asset.uid}`}
                    />
                    <span id={`${asset.uid}`}>Delete</span>
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
            {menuType == 1 ? (
              <div
                style={{
                  padding: '15px',
                  paddingRight: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '20px',
                    marginBottom: '10px',
                  }}
                >
                  <img
                    src={BackSVG}
                    style={{ cursor: 'pointer' }}
                    id={`${asset.uid}`}
                    onClick={() => setMenu(0)}
                  />
                  <span style={{ fontSize: '20px' }}>Download</span>
                </div>
                <div className={styles.border}></div>
                <RadioGroup value={value} onChange={handleChange}>
                  <FormControlLabel
                    value="with"
                    control={
                      <Radio
                        sx={{
                          color: grey[100],
                          '&.Mui-checked': {
                            color: grey[100],
                          },
                        }}
                      />
                    }
                    label="Download with watermark"
                  />
                  <FormControlLabel
                    value="without"
                    control={
                      <Radio
                        sx={{
                          color: grey[100],
                          '&.Mui-checked': {
                            color: grey[100],
                          },
                        }}
                      />
                    }
                    label="Download without watermark"
                    style={{ width: '300px' }}
                  />
                </RadioGroup>
                <div
                  className={styles.download}
                  onClick={() =>
                    handleProcessDownload(value == 'with' ? '2' : '1', {
                      name: '',
                    })
                  }
                >
                  {value == 'without' ? 'Download' : 'Pay 0.25 SOL to Download'}
                </div>
              </div>
            ) : (
              <></>
            )}
            {menuType == 2 ? (
              <div className={styles.mint}>
                <div
                  style={{
                    display: 'flex',
                    gap: '20px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setMenu(0)}
                  id={`${asset.uid}`}
                >
                  <img
                    src={BackSVG}
                    style={{ cursor: 'pointer' }}
                    id={`${asset.uid}`}
                    onClick={() => setMenu(0)}
                  />
                  <span style={{ fontSize: '20px' }}>Mint to NFT</span>
                </div>
                <div className={styles.border}></div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginTop: '10px',
                  }}
                >
                  <div className={styles.list}>
                    <div>Name</div>
                    <input
                      className={styles.input}
                      ref={nameRef}
                      defaultValue=""
                    />
                  </div>
                  <div className={styles.list}>
                    <div>Symbol</div>
                    <input
                      className={styles.input}
                      ref={symbolRef}
                      defaultValue=""
                    />
                  </div>
                  <div className={styles.list}>
                    <div>Description</div>
                    <textarea
                      className={styles.input}
                      ref={descriptionRef}
                      defaultValue=""
                    />
                  </div>
                  <div className={styles.list}>
                    <div>Royalty (%)</div>
                    <input
                      className={styles.input}
                      ref={royaltyRef}
                      defaultValue=""
                    />
                  </div>
                  <div className={styles.list}>
                    <div>Creator</div>
                    <input
                      className={styles.input}
                      ref={creatorRef}
                      defaultValue={publicKey?.toString()}
                    />
                  </div>
                </div>
                <br />
                <div
                  className={styles.download}
                  onClick={() =>
                    handleProcessDownload('3', {
                      name: nameRef.current?.value,
                      symbol: symbolRef.current?.value,
                      description: descriptionRef.current?.value,
                      royalty: royaltyRef.current?.value,
                      creator: creatorRef.current?.value,
                    })
                  }
                >
                  Pay 0.5 SOL to Mint NFT
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </>
      ) : (
        <></>
      )}

      <Card
        className={clsx(styles.widget, { [styles.selected]: selected })}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <div className={styles.imageWrapper}>
          {processedImg ? (
            <LazyLoadImage
              src={processedImg}
              effect="blur"
              alt={asset.file_name}
            />
          ) : (
            <CircularProgress />
          )}
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.title}>{processName()}</div>
          {/* <div className={styles.info}>
          <div className={styles.meta}>
            <div className={styles.row}>
              <b>Date modified:</b>
              {` ${new Date(asset.creation_timestamp * 1000).toLocaleString()}`}
            </div>
          </div>
          <AccountCircleSharpIcon className={styles.avatar} />
        </div> */}
        </div>
      </Card>
    </div>
  );
};

export default ItemWidget;
