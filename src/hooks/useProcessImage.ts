import { useEffect, useState } from 'react';
// import imageCompression from 'browser-image-compression';
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

export default function useProcessImage(asset: AssetInfoType | null) {
  const [processedImage, setProcessedImage] =
    useState<PinturaDefaultImageWriterResult>();
  const [processing, setProcessing] = useState(false);
  // const [previewUrl, setPreviewUrl] = useState<string>();

  // const compressImage = async (image: File) => {
  //   if (!image) return undefined;
  //   // cannot compress gif file
  //   if (image.type == 'image/gif') {
  //     return image;
  //   }
  //   const options = {
  //     maxSizeMB: 0.05,
  //     maxWidthOrHeight: 300,
  //     useWebWorker: true,
  //     maxIteration: 5,
  //   };
  //   try {
  //     const compressedFile = await imageCompression(image, options);
  //     setPreviewUrl(URL.createObjectURL(compressedFile));
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    if (!asset) return;

    setProcessing(true);
    processImage(`${APP_ASSET_URL}${asset.file_path}`, {
      imageReader: createDefaultImageReader(),
      imageWriter: createDefaultImageWriter(),
      imageScrambler: createDefaultImageScrambler(),
      shapePreprocessor: createDefaultShapePreprocessor(),
      imageState: asset.meta_file_path
        ? loadJSON(`${APP_ASSET_URL}${asset.meta_file_path}`, true)
        : undefined,
    }).then((res) => {
      setProcessedImage(res);
      setProcessing(false);
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
    url: processedImage
      ? URL.createObjectURL(processedImage?.dest as Blob)
      : null,
    content: processedImage?.dest as Blob,
    processing,
  };
}
