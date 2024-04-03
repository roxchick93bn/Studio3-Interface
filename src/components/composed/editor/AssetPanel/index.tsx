import React, { FC, useRef, useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import ItemWidget from '../../gallery/ItemWidget';

import styles from './index.module.scss';

import { filterByName } from '@/global/utils';
import useFetchAPI from '@/hooks/useFetchAPI';
import { APP_API_URL } from '@/global/constants';
import {
  useUpdateTemplateAssets,
  useTemplateAssets,
} from '@/state/template/hooks';
import { AssetInfoType } from '@/global/types';

interface IAssetPanel {
  showPanel: boolean;
}

const searchICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z"
      fill="gray"
    />
  </svg>
);

const AssetPanel = (props: any) => {
  const fetchAPI = useFetchAPI();
  const templateAssets = useTemplateAssets();
  const [templateImages, setTemplateImages] = useState<AssetInfoType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleUpdateTemplateAssets = useUpdateTemplateAssets();
  const searchRef = useRef<HTMLInputElement>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  useEffect(() => {
    setIsLoading(true);
    // console.log('loading.....');
    handleUpdateTemplateAssets();
    // console.log('loading..... finished');
  }, []);

  useEffect(() => {
    const handleScroll = async (e: any) => {
      if (
        window.innerHeight + Math.round(window.scrollY) >=
        document.body.offsetHeight
      ) {
        // console.log('------bottom', loadedCount);
        const image: AssetInfoType[] = [];
        let i = 0;
        for (; i + loadedCount < templateAssets.length; i++) {
          if (i < 12) {
            image.push(templateAssets[i + loadedCount]);
          } else {
            break;
          }
        }
        // console.log(loadedCount);
        setLoadedCount(i + loadedCount);
        setTemplateImages((p) => [...p, ...image]);
      }
    };

    addEventListener('scroll', handleScroll);

    return () => {
      removeEventListener('scroll', handleScroll);
    };
  }, [loadedCount]);

  const handleScroll = async (event: any) => {
    // console.log('-handle-');
    const { scrollHeight, scrollTop, clientHeight } = event.target;

    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      // console.log('------bottom', loadedCount);
      if (loadedCount >= templateAssets.length) return;
      const image: AssetInfoType[] = [];
      let i = 0;
      for (; i + loadedCount < templateAssets.length; i++) {
        if (i < 12) {
          image.push(templateAssets[i + loadedCount]);
        } else {
          break;
        }
      }
      // console.log(loadedCount);
      setLoadedCount(i + loadedCount);
      setTemplateImages((p) => [...p, ...image]);
    }
  };

  function search() {
    if (!searchRef.current) return;
    setTemplateImages([]);
    // console.log(searchRef.current.value);
    const result = filterByName(searchRef.current.value, templateAssets);
    loadImages(searchRef.current.value, result);
  }
  const loadImages = async (filter: string, buf: AssetInfoType[]) => {
    let i = 0;
    let image: AssetInfoType[] = [];
    for (const item of buf) {
      await sleep(200);
      if (filter != searchRef.current?.value) return;
      // image.push(item);
      image = [...image, item];
      i++;
      if (i % 5 == 2) setTemplateImages(image);
      if (i > 21) return;
    }

    setIsLoading(false);
    setTemplateImages(image);
  };

  useEffect(() => {
    //if (templateLoading) return;
    if (templateAssets.length == 0) return;
    if (templateImages.length > 0) setTemplateImages([]);
    let i = 0;
    const loadImages = async () => {
      const image: AssetInfoType[] = [];
      for (const item of templateAssets) {
        if (i > 35) break;
        image.push(item);
        i++;
      }
      setTemplateImages(image);
    };
    loadImages();
    setLoadedCount(i);
    // setTemplateImages([...templateAssets]);
    return () => setTemplateImages([]);
  }, [templateAssets]);
  return (
    <div className={props.showPanel ? styles.AssetPanel : styles.hidden}>
      <div className={styles.header}>
        <div>
          <span onClick={props.toggleAsset}>
            {' '}
            <svg
              width="18"
              height="14"
              viewBox="0 0 14 12"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.4502 6.19287H12.2601"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <path
                d="M5.54004 10.7129L1 6.19285L5.54004 1.67285"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>{' '}
          </span>
          &nbsp; Add image from Assets Library{' '}
        </div>
      </div>
      <div
        style={{
          width: '100%',
          position: 'relative',
          padding: '0px 15px',
        }}
      >
        <div className={styles.icon}>{searchICON}</div>
        <input
          type="text"
          className={styles.searchBar}
          placeholder="Search"
          ref={searchRef}
          onChange={search}
        />
      </div>
      <div className={styles.itemViewContainer} onScroll={handleScroll}>
        <div className={styles.itemView}>
          {templateImages.length > 0 &&
            templateImages.map((asset, index) => (
              <div key={`widget-template-${index}`}>
                <ItemWidget asset={asset} type={2} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AssetPanel;
