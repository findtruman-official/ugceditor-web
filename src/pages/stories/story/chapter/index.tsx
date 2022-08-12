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
  const { currentChapter, setChapterId, setStoryId } = useModel(
    'storyModel',
    (model) => ({
      currentChapter: model.currentChapter,
      setChapterId: model.setChapterId,
      setStoryId: model.setStoryId,
    }),
  );

  useEffect(() => {
    return () => {
      setChapterId(0);
    };
  }, []);

  useEffect(() => {
    if (match?.params.storyId && match?.params.chapterId) {
      setStoryId(match?.params.storyId || '');
      setChapterId(match?.params.chapterId || 0);
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
            history.push('/story/0');
          }}
        />
      </div>
      <div className={styles.container}>
        <div className={styles.title}>Chapter A</div>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{
            __html: '',
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
        />
        <Dropdown
          placement={'topCenter'}
          overlay={
            <Menu
              items={[
                {
                  key: '1',
                  label: 'Chapter 1',
                },
              ]}
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
        />
      </div>
    </PageContainer>
  );
};

export default Chapter;
