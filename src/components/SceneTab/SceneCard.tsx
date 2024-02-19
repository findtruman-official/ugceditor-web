import { random, sleep } from '@/utils/utils';
import { useIntl } from '@@/exports';
import {
  DownloadOutlined,
  EditOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  useDocumentVisibility,
  useLocalStorageState,
  useRequest,
} from 'ahooks';
import { Badge, Button, Popconfirm, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
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
  const [edited, setEdited] = useLocalStorageState(`${chapter.id}-edit`, {
    defaultValue: false,
  });
  const [sceneGenerated, setSceneGenerated] = useLocalStorageState(
    `${chapter.id}-scene`,
    {
      defaultValue: false,
    },
  );
  const [timeStr, setTimeStr] = useState('');

  const documentVisibility = useDocumentVisibility();

  useEffect(() => {
    if (documentVisibility === 'visible') {
      setTimeStr(new Date().toLocaleString());
    }
  }, [documentVisibility]);

  const { runAsync: publishScene, loading: publishing } = useRequest(
    async () => {
      await sleep(500);
      setTimeStr(new Date().toLocaleString());
      setPublished(!published);
    },
    {
      manual: true,
    },
  );

  const { run: generateScene, loading: sceneGenerating } = useRequest(
    async () => {
      await sleep(random(3000, 5000));
      setSceneGenerated(true);
    },
    { manual: true },
  );

  return (
    <div className={styles.sceneCard}>
      {sceneGenerated ? (
        <img src={img} />
      ) : (
        <div className={styles.emptyCard}>
          <Button
            loading={sceneGenerating}
            type={'primary'}
            onClick={generateScene}
          >
            Generate Scene from {chapter.name.split('.')[0]}
          </Button>
        </div>
      )}
      <div className={styles.meta}>
        <div className={styles.name}>{chapter.name}</div>
        <div className={styles.desc}>
          {!sceneGenerated ? (
            'No generated scene'
          ) : published ? (
            `Published at ${timeStr}`
          ) : edited ? (
            <Badge
              className={styles.desc}
              dot={true}
            >{`Edited at ${timeStr}`}</Badge>
          ) : (
            'No Edit'
          )}
        </div>
        <div className={styles.actionButtons}>
          <Tooltip title={formatMessage({ id: 'story.scene.edit' })}>
            <Button
              size={'small'}
              type={'primary'}
              disabled={!sceneGenerated}
              icon={<EditOutlined />}
              onClick={() => {
                // window.open(
                //   `http://ugc-editor.findtruman.io:8080/#/editor/${chapter.id}`,
                // );
                window.open(
                  `http://ugc-editor.findtruman.io/#/story/10/editor/${chapter.id}`,
                  '_blank',
                );
                setTimeout(() => {
                  if (chapter.id === 55) {
                    setEdited(true);
                  }
                }, 1000);
              }}
            />
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
            <Popconfirm title={'Publish scene'} onConfirm={publishScene}>
              <Button
                disabled={!edited}
                loading={publishing}
                size={'small'}
                type={'primary'}
                icon={<UploadOutlined />}
              />
            </Popconfirm>
          )}
        </div>
      </div>
    </div>
  );
};
