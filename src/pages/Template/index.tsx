/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import AnimateHeight from 'react-animate-height';
import { PropagateLoader } from 'react-spinners';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import styles from './index.module.scss';

import { useAuth } from '@/context/AuthContext';
import PageContainer from '@/components/navigation/PageContainer';
import ItemWidget from '@/components/composed/gallery/ItemWidget';
import GalleryHeading from '@/components/composed/gallery/GalleryHeading';
import ItemPreviewDrawer from '@/components/composed/gallery/ItemPreviewDrawerTemplate';
import FilterPanel from '@/components/composed/gallery/FilterPanel';
import {
  useIsLoading,
  useTemplateAssets,
  useUpdateTemplateAssets,
  usePreviewSelectedId,
  useUpdatePreviewSelectedId,
} from '@/state/template/hooks';
import { useAuthToken } from '@/state/application/hooks';
import useFetchAPI from '@/hooks/useFetchAPI';
import Button from '@/components/based/Button';
import { AssetInfoType } from '@/global/types';
import { filterByName, filterByTags } from '@/global/utils';
import { APP_API_URL } from '@/global/constants';

let isSearched = true;

export default function TemplatePage() {
  const { isVerified } = useAuth();
  const searchRef = useRef<HTMLInputElement>(null);
  const authToken = useAuthToken();
  const isLoading = useIsLoading();
  const previewSelectedId = usePreviewSelectedId();
  const updatePreviewSelectedId = useUpdatePreviewSelectedId();
  const templateAssets = useTemplateAssets();
  const [taglist, setTagList] = useState<string[]>([]);
  const [isTagsActved, setIsTagsActved] = useState<boolean>(false);
  const [exportModalOpened, setExportModalOpened] = useState<boolean>(false);
  const [templateImages, setTemplateImages] = useState<AssetInfoType[]>([]);
  const [templateLoading, setTemplateLoading] = useState<boolean>(true);
  const [tags, setTags] = useState<boolean[]>([false]);
  const [f_tab, setFTab] = useState<string>('None');
  const [f_tag, setFTag] = useState<string>('None');
  const [f_collection, setFCollection] = useState<string>('None');
  const displayedAssets = useMemo(() => templateImages, [templateImages]);
  const handleUpdateTemplateAssets = useUpdateTemplateAssets();
  const fetchAPI = useFetchAPI();
  const [loadedCount, setLoadedCount] = useState(0);
  const [showUp, setShowUp] = useState(false);
  useEffect(() => {
    fetchAPI(`${APP_API_URL}/list_tags`, 'POST').then((res) => {
      const tmp: any[] = [];
      tmp[0] = 'None';
      for (let i = 1; i < res.data.length + 1; i++)
        tmp[i] = res.data[i - 1].tag;
      setTagList([...tmp]);
    });

    const intervalId = setInterval(() => {
      window.location.reload();
    }, 300000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleScroll = async (e: any) => {
      if (
        window.innerHeight + Math.round(window.scrollY) >=
        document.body.offsetHeight
      ) {
        const image: AssetInfoType[] = [];
        let i = 0;
        for (; i + loadedCount < templateAssets.length; i++) {
          if (i < 35) {
            image.push(templateAssets[i + loadedCount]);
          } else {
            break;
          }
        }
        console.log(loadedCount);
        setLoadedCount(i + loadedCount);
        setTemplateImages((p) => [...p, ...image]);
        setShowUp(true);
      }
      if (window.scrollY == 0) setShowUp(false);
      else setShowUp(true);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadedCount]);
  useEffect(() => {
    // if (userAssets.length == 0 || templateAssets.length == 0) {
    //   handleUpdateDisplayedAssets();
    //   handleUpdateTemplateAssets();
    // }
    isSearched = false;
    setTemplateLoading(true);
    handleUpdateTemplateAssets();
  }, [authToken]);

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const loadImages = async (images: any[]) => {
    let i = 0;
    isSearched = false;
    setTemplateLoading(true);
    setTemplateImages([]);
    const image: AssetInfoType[] = [];
    for (const item of images) {
      //await sleep(200);
      if (i < 35) {
        // image.push(item);
        setTemplateImages((p) => [...p, item]);
      } else {
        break;
      }
      // if (i < 15) {
      // image.push(item);
      //setTemplateImages((p) => [...p, item]);
      // } else {
      //   // image.push(...images.slice(15));
      //   setTemplateImages((p) => [...p, ...images.slice(15)]);
      //   break;
      // }
      i++;
    }
    console.log(i);
    setLoadedCount(i);
    // setTemplateImages(image);
    setTemplateLoading(false);
    isSearched = true;
    //if (images.length == templateImages.length) window.location.reload();
  };

  function search() {
    if (!searchRef.current) return;
    const result = filterByName(searchRef.current.value, templateAssets);
    setTemplateLoading(false);
    loadImages(result);
  }

  function addNewTag() {
    const val = searchRef.current;
    if (!val) return;
    if (taglist.indexOf(val.value) != -1) return;
    if (val.value.length == 0) return;
    for (let i = 0; i < val.value.length; i++) {
      if (
        !(
          (val.value[i] >= 'a' && val.value[i] <= 'z') ||
          (val.value[i] >= 'A' && val.value[i] <= 'Z')
        )
      )
        return;
    }
    console.log('success');
    const data = new FormData();
    data.append('id', String(taglist.length + 1));
    data.append('tag', val.value);
    fetchAPI(`${APP_API_URL}/insert_tag`, 'POST', data, false).then((res) => {
      if (res.success) {
        toast.success('Added successfully!');
      }
    });
  }

  async function tagSwitch(obj: any, index: number) {
    const ar = tags;
    ar[index] = !ar[index];
    setTags(ar);
    //setActivedTag(index);
    //const tagName = obj?.innerText;
    //if (!tagName) return;
    const result = await filterByTags(ar, templateAssets, taglist);
    loadImages(result);
  }

  async function handleFilters() {
    if (isTagsActved == true) {
      setTags([]);
      const result = await filterByTags([], templateAssets, taglist);
      loadImages(result);
    }
    setIsTagsActved((p) => !p);
    const res = await fetchAPI(`${APP_API_URL}/list_tags`, 'POST');
    const tmp: any[] = [];
    tmp[0] = 'None';
    for (let i = 1; i < res.data.length + 1; i++) tmp[i] = res.data[i - 1].tag;
    if (taglist.length != tmp.length - 1) setTagList([...tmp]);
  }

  const onChangeFilterPanel = async (filters: { [key: string]: string }) => {
    setFTag(filters['Tags']);
    setFTab(filters['Tab']);
    setFCollection(filters['Collection']);
    const ttag = filters['Tags'],
      ttab = filters['Tab'],
      tcollection = filters['Collection'];
    if (ttag == 'None' && ttab == 'None' && tcollection == 'None') {
      loadImages(templateAssets);
      return;
    }
    const filteredItems = await templateAssets.filter(
      (item) =>
        (ttag == 'None' ||
          (item.tags && item.tags.toLowerCase() === ttag.toLowerCase())) &&
        (ttab == 'None' ||
          (item.tab && item.tab.toLowerCase() === ttab.toLowerCase())) &&
        (tcollection == 'None' ||
          (item.collection &&
            item.collection.toLowerCase() === tcollection.toLowerCase()))
    );
    loadImages(filteredItems);
  };
  // function tagAll() {
  //   setTemplateLoading(false);
  //   loadImages(templateAssets);
  // }

  useEffect(() => {
    //if (templateLoading) return;
    if (templateAssets.length == 0) return;
    if (templateImages.length > 0) setTemplateImages([]);
    let i = 0;
    const loadImages = async () => {
      const image: AssetInfoType[] = [];
      for (const item of templateAssets) {
        if (i == 60) break;
        image.push(item);
        i++;
      }
      setTemplateImages(image);
    };
    setTemplateLoading(true);
    loadImages();
    setTemplateLoading(false);
    console.log('---------', templateImages.length);
    setLoadedCount(i);
    console.log('---------false', i);
    // setTemplateImages([...templateAssets]);
    return () => setTemplateImages([]);
  }, [templateAssets]);

  return (
    <PageContainer
      heading={<GalleryHeading title="Templates" />}
      variant={clsx({ [styles.opened]: !!previewSelectedId })}
    >
      <ItemPreviewDrawer
        open={!!previewSelectedId}
        onClose={() =>
          previewSelectedId && updatePreviewSelectedId(previewSelectedId)
        }
      />
      {}
      <div className={styles.gallery}>
        <div className={styles.filterPanel}>
          <FilterPanel
            dTab={f_tab}
            dTags={f_tag}
            dCollection={f_collection}
            onChangeFilter={onChangeFilterPanel}
          ></FilterPanel>
          <Button
            className={isTagsActved ? styles.active_button : styles.button}
            // onClick={() => setIsTagsActved((p) => !p)}
            onClick={handleFilters}
          >
            Filters
          </Button>
        </div>
        <AnimateHeight duration={500} height={isTagsActved ? 'auto' : 0}>
          <div className={styles.tags}>
            {taglist.map((tag, index) => (
              <Button
                key={`tag-buttons-${index}`}
                className={
                  tags[index] == true ? styles.active_button : styles.button
                }
                onClick={(e) => tagSwitch(e.target as HTMLButtonElement, index)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </AnimateHeight>
        <div className={styles.images}>
          {!templateLoading && displayedAssets && displayedAssets.length ? (
            templateImages.map((asset, index) => (
              <div
                style={{ position: 'relative' }}
                key={`widget-template-${index}`}
              >
                <ItemWidget
                  asset={asset}
                  type={0}
                  onClick={() => updatePreviewSelectedId(asset.uid)}
                />
              </div>
            ))
          ) : (isSearched == true && templateAssets.length == 0) ||
            (isSearched == true && templateImages.length == 0) ? (
            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translate(0,-50px)',
              }}
            >
              <h3> There is no matched data. </h3>
            </div>
          ) : (
            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translate(0,-80px)',
              }}
            >
              <h3> Loading ... </h3>
              <PropagateLoader color="#ffffff55" />
            </div>
          )}
        </div>
        {showUp && (
          <KeyboardDoubleArrowUpIcon
            className={styles.arrowup}
            onClick={() => {
              window.scrollTo(0, 0);
              setShowUp(false);
            }}
          />
        )}
      </div>
    </PageContainer>
  );
}
