import { useEffect, useState } from 'react';
import {
  createDefaultImageReader,
  createDefaultImageScrambler,
  createDefaultImageWriter,
  createDefaultShapePreprocessor,
  PinturaDefaultImageWriterResult,
  processImage,
} from '@pqina/pintura';

import { AssetInfoType } from '@/global/types';
import { APP_ASSET_URL } from '@/global/constants';
import { loadJSON } from '@/global/utils';

export default function useProcessThumbnail(asset: AssetInfoType | null) {
  const [processedThumbnail, setProcessedThumbnail] =
    useState<PinturaDefaultImageWriterResult>();

  useEffect(() => {
    if (!asset) return;
    processImage(`${APP_ASSET_URL}${asset.thumbnail_file_path}`, {
      imageReader: createDefaultImageReader(),
      imageWriter: createDefaultImageWriter(),
      imageScrambler: createDefaultImageScrambler(),
      shapePreprocessor: createDefaultShapePreprocessor(),
      imageState: asset.meta_file_path
        ? loadJSON(`${APP_ASSET_URL}${asset.meta_file_path}`, true)
        : undefined,
    }).then((res) => {
      setProcessedThumbnail(res);
    });
  }, [asset]);

  // useEffect(() => {
  //   compressImage(processedImage?.dest as File);
  // }, [processedImage]);

  // return {
  //   url: previewUrl ? previewUrl : null,
  //   content: processedImage?.dest as Blob,
  // };
  return {
    url: processedThumbnail
      ? URL.createObjectURL(processedThumbnail?.dest as Blob)
      : undefined,
    content: processedThumbnail?.dest as Blob,
  };
}
