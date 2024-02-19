import useProgress from '@/hooks/useProgress';
import { Button, Col, Input, Row, Space } from 'antd';
import { useState } from 'react';
import styles from './editor-style.less';

export const NPCTab = ({
  visible,
  onShowChat,
}: {
  visible: boolean;
  onShowChat: VoidFunction;
}) => {
  const [name, setName] = useState('');
  const [appearance, setAppearance] = useState('');
  const [background, setBackground] = useState('');
  const [generated, setGenerated] = useState(false);

  const { progress, loading, startProgress } = useProgress({
    seconds: 160,
    onEnd: () => {
      setGenerated(true);
      onShowChat();
    },
  });

  return visible ? (
    <div>
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={4}>
          <Input
            disabled={loading}
            size={'large'}
            placeholder={'Names of NPC'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Col>
        <Col span={20}>
          <Input
            disabled={loading}
            size={'large'}
            placeholder={'Appearance and dress of NPC'}
            value={appearance}
            onChange={(e) => setAppearance(e.target.value)}
          />
        </Col>
      </Row>
      <Input.TextArea
        disabled={loading}
        placeholder={
          'Backstory and personality traits of NPC (can be omitted if the NPC is a celebrity)'
        }
        size={'large'}
        style={{ resize: 'none', marginBottom: 12 }}
        value={background}
        onChange={(e) => setBackground(e.target.value)}
      />
      <div className={styles['flex-end']}>
        {!generated ? (
          <Button onClick={startProgress} loading={loading} type={'primary'}>
            {loading ? `${progress}%` : 'Generate New'}
          </Button>
        ) : (
          <Space>
            <Button loading={loading} onClick={startProgress}>
              {loading ? `${progress}%` : 'Generate New'}
            </Button>
            <Button type="primary" disabled={loading}>
              Update This
            </Button>
          </Space>
        )}
      </div>
    </div>
  ) : (
    <></>
  );
};

export default NPCTab;
