import React, { useMemo, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PinturaEditor } from '@pqina/react-pintura';
import {
  PinturaDefaultImageWriterResult,
  createNode,
  appendNode,
  openDefaultEditor,
  PinturaNode,
  createMarkupEditorShapeStyleControls,
  createDefaultFontFamilyOptions,
  createMarkupEditorToolbar,
  createDefaultFontScaleOptions,
  // insertNodeAfter,
} from '@pqina/pintura';

import styles from './index.module.scss';

import { EDITOR_ICON_CONFIG } from '@/config/editor';
import { EDITOR_CONFIG } from '@/config/editor';
import { APP_API_URL, APP_ASSET_URL } from '@/global/constants';
import {
  usePreviewSelectedAsset,
  useUpdateDisplayedAssets,
} from '@/state/gallery/hooks';
import useFetchAPI from '@/hooks/useFetchAPI';
import PageContainer from '@/components/navigation/PageContainer';
import EditorOpenPanel from '@/components/composed/editor/EditorOpenPanel';
import AssetPanel from '@/components/composed/editor/AssetPanel';
import { blobToBase64, loadJSON, strToBuffer } from '@/global/utils';
// import WatermarkImage from '@/assets/images/watermark.png';

export default function EditorPage() {
  const navigate = useNavigate();
  const editorRef = useRef<PinturaEditor>(null);
  const fetchAPI = useFetchAPI();
  const selectedAsset = usePreviewSelectedAsset();
  const updateDisplayedAssets = useUpdateDisplayedAssets();
  const [editorSrc, setEditorSrc] = useState<string | File | undefined>(
    selectedAsset ? `${APP_ASSET_URL}${selectedAsset.file_path}` : undefined
  );
  const [editorEnabled, setEditorEnabled] = useState(!!editorSrc);
  const [isAssetShow, setAssetShow] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const handleProcess = async (detail: PinturaDefaultImageWriterResult) => {
    const data = new FormData();
    if (detail.dest.size >= 10 * 1024 * 1024) {
      toast.error('The maximum upload image size is 10 MB!');
      return;
    }
    data.append('image', detail.src as Blob, (detail.src as File).name);
    if (selectedAsset) {
      data.append('asset_uid', selectedAsset.uid.toString());
      data.append('file_key', selectedAsset.file_path);
    }

    const imageState = { ...detail.imageState };

    imageState.annotation = await Promise.all(
      imageState.annotation.map(async (shape: any) => {
        // this is not a text shape so skip
        if (
          !shape.backgroundImage ||
          !shape.backgroundImage.startsWith('blob:')
        )
          return shape;

        shape.backgroundImage = await blobToBase64(shape.backgroundImage);
        return shape;
      })
    );

    data.append(
      'meta',
      new Blob([
        strToBuffer(JSON.stringify(editorRef.current?.editor.imageState)),
      ])
    );

    const toastLoadingID = toast.loading('Saving...');
    fetchAPI(
      `${APP_API_URL}/${
        selectedAsset ? 'overwrite_multi_asset' : 'upload_multi_asset'
      }`,
      'POST',
      data,
      false
    ).then((res) => {
      toast.dismiss(toastLoadingID);

      if (res.success) {
        toast.success('Saved successfully!');
        //updateDisplayedAssets();
      }
    });
  };

  const handleEditorHide = () => setEditorEnabled(false);

  const handleAssetChange = (fileSrc: string | File) => {
    setEditorEnabled(true);
    setEditorSrc(fileSrc);
  };

  const editorFileSrc = useMemo(() => {
    return typeof editorSrc === 'string'
      ? `${editorSrc}?nocache=${new Date().getTime()}`
      : editorSrc;
  }, [editorSrc]);

  const moveArrayIndex = (array: any[], oldIndex: number, newIndex: number) => {
    if (newIndex >= array.length) {
      let k = newIndex - array.length + 1;
      while (k--) {
        array.push(undefined);
      }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);

    return array;
  };

  const getShapeType = (shapeId: string) => {
    if (!editorRef.current) return;

    const imageAnnotation: any[] = [
      ...(editorRef.current.editor?.imageAnnotation ?? []),
    ];
    const imageDecoration: any[] = [
      ...(editorRef.current.editor?.imageDecoration ?? []),
    ];
    const imageRedaction: any[] = [
      ...(editorRef.current.editor?.imageRedaction ?? []),
    ];

    if (imageAnnotation.find((shape) => shape.id === shapeId))
      return 'imageAnnotation';
    if (imageDecoration.find((shape) => shape.id === shapeId))
      return 'imageDecoration';
    if (imageRedaction.find((shape) => shape.id === shapeId))
      return 'imageRedaction';

    return 'imageDecoration';
  };

  const addCustomShapeControls = (
    controls: PinturaNode[],
    selectedShapeId: string
  ) => {
    // copy the controls and control buttons
    const newControls = [...controls];
    // if there are two control button sections, we modify the second one
    // TODO: we should make this more robust - sometimes the added controls look a bit out of place
    const controlButtonsSectionIndex = newControls[1]?.length > 0 ? 1 : 0;
    const controlButtons = [
      ...(newControls[controlButtonsSectionIndex][3] ?? []),
    ];

    if (!editorRef.current) return;

    // Find the currently selected shape among all the shapes
    const shapesList: any[] = [
      ...(editorRef.current.editor.imageAnnotation ?? []),
      ...(editorRef.current.editor.imageDecoration ?? []),
      ...(editorRef.current.editor.imageRedaction ?? []),
    ];
    const selectedShape = shapesList.find(
      (shape) => shape.id === selectedShapeId
    );
    // find type of shape (imageAnnotation, imageDecoration, imageRedaction)
    const shapeType = getShapeType(selectedShapeId);
    // make copy of the shape type list
    const selectedShapeTypeList = shapeType
      ? [...(editorRef.current.editor[shapeType] as any[])]
      : [];
    // find index of the current shape in the shape type list
    const selectedShapeIndex = selectedShapeTypeList.indexOf(selectedShape);

    // we cannot edit a shape without an image
    const canBeEdited = !!selectedShape?.backgroundImage;
    const isAtBackOfShapes = selectedShapeIndex <= 0;
    // add the custom shape buttons
    if (canBeEdited) {
      controlButtons.unshift(
        createNode('Button', 'edit-button', {
          label: 'Edit',
          onclick: () => {
            // Create our sticker editor and use the current backgroundImage as src
            const stickerEditor = openDefaultEditor({
              class: 'pintura-sticker-editor',
              src: selectedShape.backgroundImage,
            });

            // Update the shape when the sticker is edited
            stickerEditor.on('process', ({ dest }: { dest: any }) => {
              if (!editorRef.current || !shapeType) return;
              // Update the backgroundImage of the active shape
              selectedShape.backgroundImage = URL.createObjectURL(dest);

              editorRef.current.editor[shapeType] =
                editorRef.current.editor[shapeType];
            });
          },
        })
      );
    }

    controlButtons.unshift(
      // to move the shape z index back
      createNode('Button', 'to-back', {
        disabled: isAtBackOfShapes,
        label: 'Move back',
        icon: '<g fill="none" fill-rule="evenodd"><rect transform="translate(24), scale(-1, 1)" fill="currentColor" x="11" y="13" width="8" height="2" rx="1"/><rect transform="translate(24), scale(-1, 1)" fill="currentColor" x="9" y="17" width="10" height="2" rx="1"/><path transform="translate(24), scale(-1, 1)" d="M11.364 8H10a5 5 0 000 10M12 6.5L14.5 8 12 9.5z" stroke="currentColor" stroke-width=".125em" stroke-linecap="round"/></g>',
        hideLabel: true,
        onclick: async () => {
          // don't do anything if it's already at the back
          if (isAtBackOfShapes || !editorRef.current || !shapeType) return;

          // move the shape one step back
          const reorganizedShapesList = moveArrayIndex(
            selectedShapeTypeList,
            selectedShapeIndex,
            selectedShapeIndex - 1
          );

          // redraw the shapes
          editorRef.current.editor[shapeType] = reorganizedShapesList;
        },
      })
    );

    // put the new buttons back in the controls
    newControls[controlButtonsSectionIndex][3] = controlButtons;

    return newControls;
  };
  const goBackHome = () => {
    navigate('/gallery');
  };
  const toggleAsset = () => {
    setIsLoaded(true);
    setAssetShow(!isAssetShow);
  };
  return (
    <div className={isAssetShow ? 'assetsPanel' : ''}>
      <AssetPanel showPanel={isAssetShow} toggleAsset={toggleAsset}>
        {' '}
      </AssetPanel>
      <PageContainer noHeading variant={styles.editor}>
        {editorEnabled ? (
          <PinturaEditor
            ref={editorRef}
            onProcess={handleProcess}
            {...{ ...EDITOR_CONFIG }}
            src={editorFileSrc}
            onClose={handleEditorHide}
            onDestroy={handleEditorHide}
            annotateActiveTool="move"
            annotateEnableButtonFlipVertical
            imageState={
              isLoaded
                ? {}
                : loadJSON(
                    `${APP_ASSET_URL}${selectedAsset?.meta_file_path}`,
                    false
                  )
            }
            util={'annotate'}
            utils={['annotate']}
            enablePasteImage
            enableMoveTool
            stickerEnableButtonFlipVertical
            markupEditorToolbar={createMarkupEditorToolbar([
              ['move', { disabled: false, icon: EDITOR_ICON_CONFIG.move }],
              ['text', { disabled: false, icon: EDITOR_ICON_CONFIG.text }],
              [
                'sharpie',
                { disabled: false, icon: EDITOR_ICON_CONFIG.sharpie },
              ],
              ['eraser', { disabled: false, icon: EDITOR_ICON_CONFIG.eraser }],
              ['line', { disabled: false, icon: EDITOR_ICON_CONFIG.line }],
              ['arrow', { disabled: false, icon: EDITOR_ICON_CONFIG.arrow }],
              ['rectangle', { disabled: false, icon: EDITOR_ICON_CONFIG.rect }],
              [
                'ellipse',
                { disabled: false, icon: EDITOR_ICON_CONFIG.ellipse },
              ],
              ['preset', { disabled: false, icon: EDITOR_ICON_CONFIG.preset }],
            ])}
            // modifies the controls shown when clicking on a shape
            willRenderToolbar={(toolbar: any /* env: any, redraw: any */) => {
              // call redraw to trigger a redraw of the editor state
              // attachSelectPhoto(toolbar);
              // console.log({ toolbar });
              // TODO: this is where we can modify the "Done" button and add our own buttons

              return [...toolbar];
            }}
            // modifies the `Stickers` options under `Annotate`
            willRenderShapePresetToolbar={(nodes: any, addPreset: any) => {
              const stickers = [
                '🚀',
                '😄',
                '👍',
                '👎',
                '💰',
                '😍',
                '💵',
                '🤡',
                '🎉',
                '🤑',
                '❤️',
                '💔',
              ];

              stickers.forEach((sticker) => {
                const button = createNode('Button', `${sticker}-button`, {
                  label: sticker,
                  onclick: () => addPreset(sticker),
                });

                appendNode(button, nodes);
              });

              // return the new node tree
              return nodes;
            }}
            markupEditorShapeStyleControls={createMarkupEditorShapeStyleControls(
              {
                fontFamilyOptions: [
                  // Add our custom fonts
                  ['Impact', 'Impact'],
                  ['Impact-meme', 'Meme'],
                  ['Arial', 'Arial'],
                  ['Helvetica', 'Helvetica'],
                  ['Montserrat', 'Montserrat'],
                  ['Comic Sans MS', 'Comic Sans MS'],
                  // Add the default options
                  ...createDefaultFontFamilyOptions(),
                ],
                // Set absolute font size values
                fontSizeOptions: [
                  4, 8, 16, 18, 20, 24, 30, 36, 48, 64, 72, 96, 144,
                ],
                // Set absolute line height values
                lineHeightOptions: [
                  4, 8, 16, 18, 20, 24, 30, 36, 48, 64, 72, 96, 144,
                ],
              }
            )}
          />
        ) : (
          <EditorOpenPanel onChange={handleAssetChange} />
        )}
        <div className={styles.gotoBack} onClick={goBackHome}>
          {' '}
          <svg
            width="12"
            height="20"
            viewBox="0 0 12 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.7071 19.2929C10.3166 19.6834 9.68342 19.6834 9.29289 19.2929L0.707106 10.7071C0.316582 10.3166 0.316583 9.68342 0.707107 9.29289L9.29289 0.707106C9.68342 0.316582 10.3166 0.316582 10.7071 0.707107L11.0679 1.06789C11.4584 1.45842 11.4584 2.09158 11.0679 2.48211L4.25711 9.29289C3.86658 9.68342 3.86658 10.3166 4.25711 10.7071L11.0679 17.5179C11.4584 17.9084 11.4584 18.5416 11.0679 18.9321L10.7071 19.2929Z"
              fill="white"
            />
          </svg>
          <svg
            width="12"
            height="20"
            viewBox="0 0 12 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.7071 19.2929C10.3166 19.6834 9.68342 19.6834 9.29289 19.2929L0.707106 10.7071C0.316582 10.3166 0.316583 9.68342 0.707107 9.29289L9.29289 0.707106C9.68342 0.316582 10.3166 0.316582 10.7071 0.707107L11.0679 1.06789C11.4584 1.45842 11.4584 2.09158 11.0679 2.48211L4.25711 9.29289C3.86658 9.68342 3.86658 10.3166 4.25711 10.7071L11.0679 17.5179C11.4584 17.9084 11.4584 18.5416 11.0679 18.9321L10.7071 19.2929Z"
              fill="white"
            />
          </svg>
          <svg
            width="12"
            height="20"
            viewBox="0 0 12 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.7071 19.2929C10.3166 19.6834 9.68342 19.6834 9.29289 19.2929L0.707106 10.7071C0.316582 10.3166 0.316583 9.68342 0.707107 9.29289L9.29289 0.707106C9.68342 0.316582 10.3166 0.316582 10.7071 0.707107L11.0679 1.06789C11.4584 1.45842 11.4584 2.09158 11.0679 2.48211L4.25711 9.29289C3.86658 9.68342 3.86658 10.3166 4.25711 10.7071L11.0679 17.5179C11.4584 17.9084 11.4584 18.5416 11.0679 18.9321L10.7071 19.2929Z"
              fill="white"
            />
          </svg>
          &nbsp;&nbsp;&nbsp; Home{' '}
        </div>
        {editorEnabled && (
          <div className={styles.asset} onClick={toggleAsset}>
            {' '}
            <svg
              width="25"
              height="24"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_2036_582"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="25"
                height="24"
              >
                <rect x="0.5" width="24" height="24" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_2036_582)">
                <path
                  d="M7.5 17C6.95 17 6.47917 16.8042 6.0875 16.4125C5.69583 16.0208 5.5 15.55 5.5 15V4C5.5 3.45 5.69583 2.97917 6.0875 2.5875C6.47917 2.19583 6.95 2 7.5 2H12.5L14.5 4H21.5C22.05 4 22.5208 4.19583 22.9125 4.5875C23.3042 4.97917 23.5 5.45 23.5 6V15C23.5 15.55 23.3042 16.0208 22.9125 16.4125C22.5208 16.8042 22.05 17 21.5 17H7.5ZM7.5 15H21.5V6H13.675L11.675 4H7.5V15ZM20.5 21H3.5C2.95 21 2.47917 20.8042 2.0875 20.4125C1.69583 20.0208 1.5 19.55 1.5 19V6H3.5V19H20.5V21ZM9.5 13H19.5L16.125 8.5L13.5 12L11.875 9.825L9.5 13Z"
                  fill="white"
                />
              </g>
            </svg>
            asset
          </div>
        )}
      </PageContainer>
    </div>
  );
}
