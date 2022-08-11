import ContentEditable, {
  useRefCallback,
} from '@/components/ContentEditable/ContentEditable';
import { IconFont } from '@/components/IconFont/IconFont';
import { useMatch, useModel } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import { ExclamationCircleOutlined, LeftOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Col, Input, Modal, Row } from 'antd';
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
  const match = useMatch('/story/:storyId/chapter/:chapterId');
  const { chapterName, setChapterName } = useModel('storyModel');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(true);
  const [promptVisible, setPromptVisible] = useState(false);

  const handleChange = useRefCallback((evt) => {
    setContent(evt.target.value);
    setSaved(false);
  }, []);

  const handleBlur = useRefCallback(() => {}, [content]);

  useEffect(() => {
    return () => {
      setChapterName('');
    };
  }, []);

  useEffect(() => {
    if (match?.params.storyId) {
      setChapterName('Chapter A');
    }
  }, [match]);

  const saveDraft = () => {
    localStorage.setItem(
      chapterName,
      JSON.stringify({
        title,
        content,
        timestamp: new Date().valueOf(),
      }),
    );
    setSaved(true);
  };

  const getDraft = () => {
    try {
      const storage = localStorage.getItem(chapterName);
      if (storage) {
        const { title, content, timestamp } = JSON.parse(storage);
        // TODO: 与数据时间戳比较
        setTitle(title);
        setContent(content);
      }
    } catch (e) {}
  };

  useEffect(() => {
    getDraft();
  }, [chapterName]);

  return (
    <PageContainer
      style={{ margin: '0 88px', position: 'relative' }}
      title={false}
      ghost
    >
      <Helmet title={chapterName} />
      <Row align={'middle'} justify={'space-between'} className={styles.header}>
        <Col>
          <Button
            shape={'circle'}
            size={'large'}
            icon={<LeftOutlined />}
            onClick={() => {
              if (saved) {
                history.push('/story/0');
              } else {
                setPromptVisible(true);
              }
            }}
          />
        </Col>
        <Col>
          <Button size={'large'} type={'primary'} onClick={saveDraft}>
            {formatMessage({ id: 'chapter.save-draft' })}
          </Button>
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
          }}
        />
      </div>
      <div className={styles.cmdButtonRow1}>
        <CmdButton cmd={'bold'} icon={'icon-bold'} />
        <CmdButton cmd={'italic'} icon={'icon-italic'} />
        <CmdButton cmd={'underline'} icon={'icon-underline'} />
      </div>
      <div className={styles.cmdButtonRow2}>
        <CmdButton cmd={'formatBlock'} arg={'h1'} icon={'icon-heading-h1'} />
        <CmdButton cmd={'formatBlock'} arg={'h2'} icon={'icon-heading-h2'} />
        <CmdButton cmd={'formatBlock'} arg={'h3'} icon={'icon-heading-h3'} />
        <CmdButton cmd={'formatBlock'} arg={'h4'} icon={'icon-heading-h4'} />
        <CmdButton cmd={'formatBlock'} arg={'h5'} icon={'icon-heading-h5'} />
        <CmdButton cmd={'formatBlock'} arg={'h6'} icon={'icon-heading-h6'} />
      </div>

      <Modal
        title={false}
        closable={false}
        footer={false}
        centered={true}
        visible={promptVisible}
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
            <Button danger={true} onClick={() => history.push('/story/0')}>
              {formatMessage({ id: 'chapter.discard-and-leave' })}
            </Button>
          </Col>
          <Col>
            <Button
              type={'primary'}
              onClick={() => {
                saveDraft();
                history.push('/story/0');
              }}
            >
              {formatMessage({ id: 'chapter.save-draft-and-leave' })}
            </Button>
          </Col>
        </Row>
      </Modal>
    </PageContainer>
  );
};

export default Edit;
