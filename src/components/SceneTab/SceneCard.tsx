import { sleep } from '@/utils/utils';
import { useIntl } from '@@/exports';
import {
  DownloadOutlined,
  EditOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Tooltip } from 'antd';
import { useState } from 'react';
import styles from './SceneTab.less';

export const SceneCard = ({
  img,
  chapter,
  isAuthor,
}: {
  img: string;
  chapter: API.StoryChapter;
  isAuthor: boolean;
}) => {
  const { formatMessage } = useIntl();

  const [published, setPublished] = useState(false);

  const { runAsync: publishScene, loading: publishing } = useRequest(
    async () => {
      await sleep(500);
      setPublished(!published);
    },
    {
      manual: true,
    },
  );

  return (
    <div className={styles.sceneCard}>
      <img src={img} />
      <div className={styles.meta}>
        <div className={styles.name}>{chapter.name}</div>
        <div className={styles.actionButtons}>
          <Tooltip title={formatMessage({ id: 'story.scene.edit' })}>
            <Button size={'small'} type={'primary'} icon={<EditOutlined />} />
          </Tooltip>
          {published ? (
            <Tooltip title={formatMessage({ id: 'story.scene.undo-publish' })}>
              <Button
                loading={publishing}
                onClick={publishScene}
                size={'small'}
                icon={<DownloadOutlined />}
              />
            </Tooltip>
          ) : (
            <Tooltip title={formatMessage({ id: 'story.scene.publish' })}>
              <Button
                loading={publishing}
                onClick={publishScene}
                size={'small'}
                type={'primary'}
                icon={<UploadOutlined />}
              />
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};
