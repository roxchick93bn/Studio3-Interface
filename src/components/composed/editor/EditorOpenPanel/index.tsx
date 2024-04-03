import React, { FC, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FolderOpenSharpIcon from '@mui/icons-material/FolderOpenSharp';
import DescriptionSharpIcon from '@mui/icons-material/DescriptionSharp';
import InsertDriveFileSharpIcon from '@mui/icons-material/InsertDriveFileSharp';
import AddPhotoAlternateSharpIcon from '@mui/icons-material/AddPhotoAlternateSharp';
import AutoDeleteOutlinedIcon from '@mui/icons-material/AutoDeleteOutlined';

import styles from './index.module.scss';

import Button from '@/components/based/Button';
import {
  useAppendOpenedAsset,
  useClearOpenedAssets,
  useOpenedAssets,
} from '@/state/application/hooks';
import { useUpdatePreviewSelectedId } from '@/state/gallery/hooks';
import { APP_ASSET_URL } from '@/global/constants';
import PlaceholderImage from '@/assets/images/placeholder.png';

interface IEditorOpenPanel {
  onChange: (fileSrc: string) => void;
}

const EditorOpenPanel: FC<IEditorOpenPanel> = ({ onChange }) => {
  const navigate = useNavigate();
  const opendAssets = useOpenedAssets();
  const updatePreviewSelectedId = useUpdatePreviewSelectedId();
  const appendOpenedAsset = useAppendOpenedAsset();
  const clearOpenedAssets = useClearOpenedAssets();
  const fileInputRef = useRef<any>(null);

  const handleRecentlyOpened = (idx: number) => {
    updatePreviewSelectedId(opendAssets[idx].uid);
    appendOpenedAsset(opendAssets[idx].uid);
    onChange(`${APP_ASSET_URL}${opendAssets[idx].file_path}`);
  };

  const handleInputChange = () => {
    // Exit if no files selected
    if (!fileInputRef?.current?.files?.length) return;
    onChange(fileInputRef.current.files[0]);
  };

  const handleFileOpen = () => {
    fileInputRef?.current?.click();
  };

  const handleCreateNew = () => {
    onChange(PlaceholderImage);
  };

  return (
    <div className={styles.mask}>
      <div className={styles.panel}>
        <section className={styles.recent}>
          <div className={styles.title}>Recent</div>
          <Button className={styles.clear} onClick={clearOpenedAssets}>
            <AutoDeleteOutlinedIcon /> Clear history
          </Button>
          <div className={styles.designs}>
            {opendAssets.map((asset, idx) => (
              <Button
                key={asset.uid}
                className={styles.button}
                onClick={() => handleRecentlyOpened(idx)}
              >
                <InsertDriveFileSharpIcon />
                <span className={styles.filename}>{asset.file_name}</span>
              </Button>
            ))}
          </div>
        </section>
        <section className={styles.new}>
          <div className={styles.title}>Get started</div>
          <div className={styles.actions}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.file}
              onChange={handleInputChange}
            />
            <Button className={styles.action} onClick={handleCreateNew}>
              <AddPhotoAlternateSharpIcon />
              New
            </Button>
            <Button className={styles.action} onClick={handleFileOpen}>
              <FolderOpenSharpIcon />
              Open
            </Button>
            <Button
              className={styles.action}
              onClick={() => navigate('/templates')}
            >
              <DescriptionSharpIcon />
              Templates
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditorOpenPanel;
