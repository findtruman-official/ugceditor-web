import { history, useMatch, useModel } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import {
  LeftOutlined,
  OrderedListOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Dropdown, Menu } from 'antd';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import styles from './index.less';

const Chapter: React.FC = () => {
  const { formatMessage } = useIntl();
  const match = useMatch('/story/:storyId/chapter/:chapterId');
  const { currentChapter, setChapterId, storyId, chapterId, chapters } =
    useModel('storyModel', (model) => ({
      currentChapter: model.currentChapter,
      setChapterId: model.setChapterId,
      storyId: model.storyId,
      chapterId: model.chapterId,
      chapters: model.chapters,
    }));

  useEffect(() => {
    if (match?.params.storyId && match?.params.chapterId) {
      // setStoryId(match?.params.storyId || '');
      setChapterId(parseInt(match?.params.chapterId) || 0);
    } else {
      history.push('/');
    }
  }, [match]);

  return (
    <PageContainer
      style={{ margin: '0 88px', position: 'relative' }}
      title={false}
      ghost
    >
      <Helmet title={currentChapter?.name} />
      <div className={styles.header}>
        <Button
          shape={'circle'}
          size={'large'}
          icon={<LeftOutlined />}
          onClick={() => {
            history.push(`/story/${storyId}`);
          }}
        />
      </div>
      <div className={styles.container}>
        <div className={styles.title}>{currentChapter?.name}</div>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{
            __html: currentChapter?.content,
          }}
        />
      </div>
      <div className={styles.actionButtonRow}>
        <Button
          className={styles.actionButton}
          shape={'circle'}
          size={'large'}
          type={'primary'}
          icon={<LeftOutlined />}
          onClick={() => {
            if (chapters.length === 1) return;
            const idx = chapters.findIndex(
              (c: API.StoryChapter) => c.id === chapterId,
            );
            if (idx === 0) {
              history.push(
                `/story/${storyId}/chapter/${chapters[chapters.length - 1].id}`,
              );
            } else {
              history.push(`/story/${storyId}/chapter/${chapters[idx - 1].id}`);
            }
          }}
        />
        <Dropdown
          placement={'topCenter'}
          overlay={
            <Menu
              items={chapters
                .filter((c: API.StoryChapter) => !c.delete)
                .map((c: API.StoryChapter) => ({
                  key: c.id,
                  label: c.name,
                  onClick: () => {
                    history.push(`/story/${storyId}/chapter/${c.id}`);
                  },
                }))}
            />
          }
        >
          <Button
            className={styles.actionButton}
            shape={'circle'}
            size={'large'}
            type={'primary'}
            icon={<OrderedListOutlined />}
          />
        </Dropdown>

        <Button
          className={styles.actionButton}
          shape={'circle'}
          size={'large'}
          type={'primary'}
          icon={<RightOutlined />}
          onClick={() => {
            if (chapters.length === 1) return;
            const idx = chapters.findIndex(
              (c: API.StoryChapter) => c.id === chapterId,
            );
            if (idx === chapters.length - 1) {
              history.push(`/story/${storyId}/chapter/${chapters[0].id}`);
            } else {
              history.push(`/story/${storyId}/chapter/${chapters[idx + 1].id}`);
            }
          }}
        />
      </div>
    </PageContainer>
  );
};

export default Chapter;
