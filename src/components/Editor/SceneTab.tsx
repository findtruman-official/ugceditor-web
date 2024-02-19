import useProgress from '@/hooks/useProgress';
import { getChapterId } from '@/utils/utils';
import { Button, Input, Select, Space } from 'antd';
import { useState } from 'react';
import styles from './editor-style.less';

const DefaultPrompt = {
  '53': 'skybox, 8k, masterpiece, best quality, ultra high res, ultra-detailed, in winter, at night, countryside, houses, country houses, snow, snow-covered, clouds, trees, country footpath',
  '54': 'skybox, RAW photo, masterpiece, best quality, ultra high res, forest, prairie, grassland, clouds, blue sky, trees, wide, countryside, country footpath',
  '55': 'skybox, cubemap, 8k, masterpiece, ultra-detailed, dusk, in an autumn dusk, clouds, blue sky, trees, flowers, wide, countryside, houses, country houses, fence, country footpath, hills',
};

export const SceneTab = ({ visible }: { visible: boolean }) => {
  const [scenePrompt, setScenePrompt] = useState(
    DefaultPrompt[getChapterId()] ?? '',
  );

  const { progress, loading, startProgress } = useProgress({ seconds: 8 });

  return visible ? (
    <div>
      <Input.TextArea
        disabled={loading}
        value={scenePrompt}
        onChange={(e) => setScenePrompt(e.target.value)}
        size={'large'}
        style={{ resize: 'none', marginBottom: 12 }}
        placeholder={'Describe to generate a new scene or update this scene'}
      />
      <div className={styles['space-between']}>
        <Select
          disabled={loading}
          style={{ width: 120 }}
          value={'Oil Painting'}
          options={[
            {
              value: 'Oil Painting',
              label: 'Oil Painting',
            },
          ]}
        />
        <Space>
          <Button disabled={loading}>Generate New</Button>
          <Button type="primary" loading={loading} onClick={startProgress}>
            {loading ? `${progress}%` : 'Update This'}
          </Button>
        </Space>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default SceneTab;
