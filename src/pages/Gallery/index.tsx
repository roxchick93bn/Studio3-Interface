/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';
import AllInboxSharpIcon from '@mui/icons-material/AllInboxSharp';
import AddSharpIcon from '@mui/icons-material/AddSharp';
import { useNavigate } from 'react-router-dom';
import { PropagateLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';

import DeleteSVG from '../../Icons/delete.svg';

import styles from './index.module.scss';

import useFetchAPI from '@/hooks/useFetchAPI';
import PageContainer from '@/components/navigation/PageContainer';
import ItemWidget from '@/components/composed/gallery/ItemWidget';
import GalleryHeading from '@/components/composed/gallery/GalleryHeading';
import {
  useDisplayedAssets,
  useIsLoading,
  useUpdateDisplayedAssets,
  useUpdatePreviewSelectedId,
  countSelected,
} from '@/state/gallery/hooks';
import { useAuthToken } from '@/state/application/hooks';
import Button from '@/components/based/Button';
import { AssetInfoType } from '@/global/types';
import { APP_API_URL } from '@/global/constants';

interface Point {
  pX: number;
  pY: number;
}

interface Selection {
  isSelected: boolean;
  position: Point;
}

export default function GalleryPage() {
  const fetchAPI = useFetchAPI();
  const authToken = useAuthToken();
  const isLoading = useIsLoading();
  const userAssets = useDisplayedAssets();
  const navigate = useNavigate();
  const updatePreviewSelectedId = useUpdatePreviewSelectedId();
  const [exportModalOpened, setExportModalOpened] = useState<boolean>(false);
  const [userImages, setUserImages] = useState<AssetInfoType[]>([]);
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const displayedAssets = useMemo(() => userImages, [userImages]);
  const [posBox, setPosBox] = useState<Point>({ pX: -50, pY: -50 });
  const [selectionArray, setSelectionArray] = useState<Selection[]>([]);
  const selectedCount = countSelected(selectionArray);
  const handleUpdateDisplayedAssets = useUpdateDisplayedAssets();
  useEffect(() => {
    const intervalId = setInterval(() => {
      window.location.reload();
    }, 300000);
    handleUpdateDisplayedAssets();
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    handleUpdateDisplayedAssets();
  }, [authToken]);

  const handleCreate = () => {
    navigate('/editor');
  };

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // function tagAll() {
  //   setTemplateLoading(false);
  //   loadImages(templateAssets);
  // }
  useEffect(() => {
    if (userLoading) return;
    if (userImages.length > 0) setUserImages([]);
    const loadImages = async () => {
      let i = 0;
      const image: AssetInfoType[] = [];
      const tmp: Selection[] = [];
      for (const item of userAssets) {
        // await sleep(200);
        tmp.push({ isSelected: false, position: { pX: 0, pY: 0 } });
        if (i < 15) {
          image.push(item);
          //setUserImages((p) => [...p, item]);
        } else {
          image.push(...userAssets.slice(15));
          //setUserImages((p) => [...p, ...userAssets.slice(15)]);
          break;
        }
        i++;
      }
      setUserImages(image);
      setSelectionArray(tmp);
    };
    setUserLoading(true);
    loadImages();
    setUserLoading(false);

    // setUserImages([...userAssets]);
    updatePreviewSelectedId(-1);
    return () => setUserImages([]);
  }, [userAssets]);

  const updateSelection = (event: any, index: any) => {
    const tmp = selectionArray;
    tmp[index].isSelected = !tmp[index].isSelected;
    const { top, left } = event.target.getBoundingClientRect();
    tmp[index].position.pX = left;
    tmp[index].position.pY = top;
    setSelectionArray([...tmp]);
  };

  const clearSelection = () => {
    console.log('selection clear');
    const tmp = selectionArray;
    for (let i = 0; i < tmp.length; i++) tmp[i].isSelected = false;
    setSelectionArray([...tmp]);
  };

  const handleMultipleDelete = () => {
    toast.loading('Deleting assets...Please wait');
    const func = async () => {
      await selectionArray.map(async (item, i) => {
        if (item.isSelected) {
          const asset = userAssets[i];
          console.log(asset);
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
              if (i == selectionArray.length - 1) {
                toast.dismiss();
                toast.success('Successfully removed');
              }
              handleUpdateDisplayedAssets();
            }
          });
        }
      });
    };
    func();
  };

  return (
    <PageContainer
      heading={<GalleryHeading title="Projects" />}
      onCreateMeme={handleCreate}
    >
      <div className={styles.gallery}>
        <div className={styles.images}>
          {displayedAssets && displayedAssets.length ? (
            userImages.map((asset, index) => (
              <>
                <ItemWidget
                  key={`widget-user-${asset.uid}-${index}`}
                  asset={asset}
                  type={1}
                  selected={selectionArray[index].isSelected}
                  onClick={() => updateSelection(event, index)}
                />
              </>
            ))
          ) : (
            <div className={styles.placeholder}>
              <svg
                width="86"
                height="75"
                viewBox="0 0 86 75"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  opacity="0.6"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M77.2325 46.4283L65.1247 28.5708H20.5889L13.3975 39.285H13.4304L8.65735 46.428H32.1429C32.1429 52.3453 36.9398 57.1422 42.8571 57.1422C48.7744 57.1422 53.5713 52.3453 53.5713 46.428L77.2325 46.4283ZM85.7136 46.4283V75H0V46.4283L16.7815 21.429H68.9336L85.7136 46.4283ZM26.4855 53.5713H7.14178V67.8567H78.5688V53.5713H59.225C56.47 59.8778 50.1766 64.2855 42.8537 64.2855C35.5309 64.2855 29.238 59.8778 26.4824 53.5713H26.4855ZM46.4277 14.2854H39.2853V0H46.4277V14.2854ZM63.4923 16.5293L57.9355 12.0415L66.5887 1.32734L72.1456 5.81505L63.4923 16.5293ZM27.7773 12.0415L22.2205 16.5293L13.5672 5.81505L19.1241 1.32734L27.7773 12.0415Z"
                  fill="white"
                />
              </svg>

              <div className={styles.title}>Your folder is empty</div>
              <div className={styles.description}>
                Check out the template library to get started easily.
              </div>
              <Button className={styles.create} onClick={handleCreate}>
                Start Creating Meme
              </Button>
            </div>
          )}
        </div>
      </div>
      {selectedCount != 0 ? (
        <div className={styles.footer}>
          <div>({selectedCount}) items selected</div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
            <div className={styles.cancel} onClick={clearSelection}>
              Cancel
            </div>
            <div
              className={styles.delete}
              onClick={() => handleMultipleDelete()}
            >
              <img src={DeleteSVG} style={{ width: '20px' }}></img>
              Delete Selected
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </PageContainer>
  );
}
