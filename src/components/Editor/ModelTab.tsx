import useProgress from '@/hooks/useProgress';
import { Button, Input, Space } from 'antd';
import { useState } from 'react';
import styles from './editor-style.less';

export const ModelTab = ({ visible }: { visible: boolean }) => {
  const [modelPrompt, setModelPrompt] = useState('');
  const [generated, setGenerated] = useState(false);

  const { loading, progress, startProgress } = useProgress({
    seconds: 120,
    onEnd: () => {
      setGenerated(true);
      setModelPrompt('');
    },
  });

  return visible ? (
    <div>
      <Input.TextArea
        disabled={loading}
        value={modelPrompt}
        onChange={(e) => setModelPrompt(e.target.value)}
        size={'large'}
        style={{ resize: 'none', marginBottom: 12 }}
        placeholder={
          generated
            ? 'Describe to generate a new model or update this model'
            : 'Describe to generate a new model'
        }
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

export default ModelTab;
