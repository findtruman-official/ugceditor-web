import { history, useMatch, useModel } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import {
  LeftOutlined,
  OrderedListOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Dropdown, Menu, Skeleton } from 'antd';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import styles from './index.less';

const Chapter: React.FC = () => {
  const { formatMessage } = useIntl();
  const match = useMatch('/story/:chainType/:storyId/chapter/:chapterId');
  const {
    gettingCurrentStory,
    currentChapter,
    setStoryId,
    setChapterId,
    storyId,
    chapterId,
    chapters,
    chainType,
    setChainType,
  } = useModel('storyModel', (model) => ({
    gettingCurrentStory: model.gettingCurrentStory,
    currentChapter: model.currentChapter,
    setStoryId: model.setStoryId,
    setChapterId: model.setChapterId,
    storyId: model.storyId,
    chapterId: model.chapterId,
    chapters: model.chapters,
    chainType: model.chainType,
    setChainType: model.setChainType,
  }));

  useEffect(() => {
    if (
      match?.params.storyId &&
      match?.params.chapterId &&
      match?.params.chainType
    ) {
      setChainType(match.params.chainType);
      setStoryId(match.params.storyId);
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
      <Helmet title={`${currentChapter?.name || ''} - UGCEditor`} />
      {currentChapter && (
        <div className={styles.header}>
          <Button
            shape={'circle'}
            size={'large'}
            icon={<LeftOutlined />}
            onClick={() => {
              history.push(`/story/${chainType}/${storyId}`);
            }}
          />
        </div>
      )}
      <div className={styles.container}>
        <Skeleton loading={gettingCurrentStory} active={true}>
          {currentChapter ? (
            <>
              <div className={styles.title}>{currentChapter?.name}</div>
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{
                  __html: currentChapter?.content,
                }}
              />
            </>
          ) : (
            <div className={styles.notFoundTip}>
              <div>{formatMessage({ id: 'chapter.chapter-not-found' })}</div>
              <Button
                shape={'circle'}
                size={'large'}
                icon={<LeftOutlined />}
                onClick={() => {
                  history.push(`/story/${chainType}/${storyId}`);
                }}
              />
            </div>
          )}
        </Skeleton>
      </div>
      {currentChapter && (
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
                  `/story/${chainType}/${storyId}/chapter/${
                    chapters[chapters.length - 1].id
                  }`,
                );
              } else {
                history.push(
                  `/story/${chainType}/${storyId}/chapter/${
                    chapters[idx - 1].id
                  }`,
                );
              }
            }}
          />
          <Dropdown
            placement={'top'}
            overlay={
              <Menu
                items={chapters
                  .filter((c: API.StoryChapter) => !c.delete)
                  .map((c: API.StoryChapter) => ({
                    key: c.id,
                    label: c.name,
                    onClick: () => {
                      history.push(
                        `/story/${chainType}/${storyId}/chapter/${c.id}`,
                      );
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
                history.push(
                  `/story/${chainType}/${storyId}/chapter/${chapters[0].id}`,
                );
              } else {
                history.push(
                  `/story/${chainType}/${storyId}/chapter/${
                    chapters[idx + 1].id
                  }`,
                );
              }
            }}
          />
        </div>
      )}
    </PageContainer>
  );
};

export default Chapter;
