import ContentEditable, {
  useRefCallback,
} from '@/components/ContentEditable/ContentEditable';
import { IconFont } from '@/components/IconFont/IconFont';
import { useMatch, useModel } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import { ExclamationCircleOutlined, LeftOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Col, Input, message, Modal, Row, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { history } from 'umi';
import styles from './index.less';

const CmdButton = ({
  icon,
  cmd,
  arg,
}: {
  icon: string;
  cmd: string;
  arg?: string;
}) => {
  return (
    <Button
      onMouseDown={(e) => {
        e.preventDefault();
        document.execCommand(cmd, false, arg);
      }}
      className={styles.cmdButton}
      type={'primary'}
      size={'large'}
      icon={<IconFont type={icon} />}
    />
  );
};

const Edit: React.FC = () => {
  const { formatMessage } = useIntl();
  const match = useMatch('/story/:chainType/:storyId/chapter/:chapterId/edit');
  const {
    isAuthor,
    chainType,
    setChainType,
    storyId,
    setStoryId,
    chapterId,
    setChapterId,
    currentChapter,
    chapterCache,
    saveChapterCache,
  } = useModel('storyModel', (model) => ({
    isAuthor: model.isAuthor,
    chainType: model.chainType,
    setChainType: model.setChainType,
    storyId: model.storyId,
    setStoryId: model.setStoryId,
    chapterId: model.chapterId,
    setChapterId: model.setChapterId,
    currentChapter: model.currentChapter,
    chapterCache: model.chapterCache,
    saveChapterCache: model.saveChapterCache,
  }));

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(true);
  const [promptVisible, setPromptVisible] = useState(false);
  const [newChapterId, setNewChapterId] = useState(0);

  const handleChange = useRefCallback((evt) => {
    setContent(evt.target.value);
    setSaved(false);
  }, []);

  const handleBlur = useRefCallback(() => {}, [content]);

  const backToStory = () => {
    history.push(`/story/${chainType}/${storyId}`);
  };

  useEffect(() => {
    return () => {
      setChapterId(0);
    };
  }, []);

  useEffect(() => {
    const params = match?.params;
    if (params?.chapterId && params?.storyId && params?.chainType) {
      setChainType(params.chainType);
      setStoryId(params.storyId);
      setChapterId(parseInt(params.chapterId));
      if (parseInt(chapterId) === 0) {
        setNewChapterId(new Date().valueOf());
      }
    }
  }, [match]);

  useEffect(() => {
    if (currentChapter || chapterCache) {
      if (chapterCache?.new) {
        setTitle(chapterCache.name);
        setContent(chapterCache.content);
      } else {
        setTitle(currentChapter.name);
        setContent(currentChapter.content);
      }
    } else {
      setTitle('');
      setContent('');
    }
  }, [currentChapter, chapterCache]);

  const saveDraft = () => {
    const timestamp = new Date().valueOf();
    saveChapterCache(chapterId || newChapterId, title, content, timestamp);
    message.success(formatMessage({ id: 'chapter.saved' }));
    setSaved(true);
  };

  return (
    <PageContainer
      style={{ margin: '0 88px', position: 'relative' }}
      title={false}
      ghost
    >
      <Helmet
        title={`${
          currentChapter?.name || formatMessage({ id: 'chapter.new-chapter' })
        } - UGCEditor`}
      />
      {isAuthor ? (
        <>
          <Row
            align={'middle'}
            justify={'space-between'}
            className={styles.header}
          >
            <Col>
              <Button
                shape={'circle'}
                size={'large'}
                icon={<LeftOutlined />}
                onClick={() => {
                  if (saved) {
                    backToStory();
                  } else {
                    setPromptVisible(true);
                  }
                }}
              />
            </Col>
            <Col>
              <Tooltip title={formatMessage({ id: 'chapter.save-draft-tip' })}>
                <Button size={'large'} type={'primary'} onClick={saveDraft}>
                  {formatMessage({ id: 'chapter.save-draft' })}
                </Button>
              </Tooltip>
            </Col>
          </Row>
          <div className={styles.container}>
            <Input
              value={title}
              onChange={(e) => {
                setSaved(false);
                setTitle(e.target.value);
              }}
              bordered={false}
              placeholder={formatMessage({ id: 'chapter.title.placeholder' })}
              className={styles.titleInput}
            />
            <ContentEditable
              placeholder={formatMessage({ id: 'chapter.content.placeholder' })}
              html={content}
              onBlur={handleBlur}
              onChange={handleChange}
              style={{
                fontSize: '1.1rem',
                marginTop: 24,
                marginBottom: 256,
                cursor: 'text',
                minHeight: 500,
              }}
            />
          </div>
          <div className={styles.cmdButtonRow1}>
            <CmdButton cmd={'bold'} icon={'icon-bold'} />
            <CmdButton cmd={'italic'} icon={'icon-italic'} />
            <CmdButton cmd={'underline'} icon={'icon-underline'} />
          </div>
          <div className={styles.cmdButtonRow2}>
            <CmdButton
              cmd={'formatBlock'}
              arg={'h1'}
              icon={'icon-heading-h1'}
            />
            <CmdButton
              cmd={'formatBlock'}
              arg={'h2'}
              icon={'icon-heading-h2'}
            />
            <CmdButton
              cmd={'formatBlock'}
              arg={'h3'}
              icon={'icon-heading-h3'}
            />
            <CmdButton
              cmd={'formatBlock'}
              arg={'h4'}
              icon={'icon-heading-h4'}
            />
            <CmdButton
              cmd={'formatBlock'}
              arg={'h5'}
              icon={'icon-heading-h5'}
            />
            <CmdButton
              cmd={'formatBlock'}
              arg={'h6'}
              icon={'icon-heading-h6'}
            />
          </div>
        </>
      ) : (
        <div className={styles.notAuthorTip}>
          <div>{formatMessage({ id: 'chapter.chapter-not-author' })}</div>
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

      <Modal
        title={false}
        closable={false}
        footer={false}
        centered={true}
        open={promptVisible}
        onCancel={() => setPromptVisible(false)}
      >
        <div className={styles.promptTip}>
          <ExclamationCircleOutlined
            style={{ color: '#faad14', marginRight: 12, fontSize: 22 }}
          />
          {formatMessage({ id: 'chapter.save-prompt' })}
        </div>
        <Row justify={'end'} gutter={12}>
          <Col>
            <Button onClick={() => setPromptVisible(false)}>
              {formatMessage({ id: 'chapter.cancel' })}
            </Button>
          </Col>
          <Col>
            <Button danger={true} onClick={() => backToStory()}>
              {formatMessage({ id: 'chapter.discard-and-leave' })}
            </Button>
          </Col>
          <Col>
            <Tooltip title={formatMessage({ id: 'chapter.save-draft-tip' })}>
              <Button
                type={'primary'}
                onClick={() => {
                  saveDraft();
                  backToStory();
                }}
              >
                {formatMessage({ id: 'chapter.save-draft-and-leave' })}
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Modal>
    </PageContainer>
  );
};

export default Edit;
