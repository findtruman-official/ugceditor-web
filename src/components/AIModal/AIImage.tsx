import { GlobalContext, GlobalContextType } from '@/layouts';
import { createAIImage, getAIImage } from '@/services/ai';
import { PREFIX } from '@/utils/const';
import { downloadImage, sleep } from '@/utils/utils';
import { useIntl } from '@@/plugin-locale';
import { ReloadOutlined } from '@ant-design/icons';
import { useCreation, useMemoizedFn, useRequest } from 'ahooks';
import { Button, Col, Input, message, Row, Tooltip } from 'antd';
import classNames from 'classnames';
import { useContext, useState } from 'react';
import {
  EngineBackground,
  EngineDesc,
  EngineName,
  EngineOptions,
  EnginePlaceholder,
  EngineType,
  RandomPrompt,
  Sizes,
} from './data';
import styles from './index.less';

export function AIImage({
  walletAddress,
  show,
}: {
  walletAddress: string;
  show: boolean;
}) {
  const { openWalletModal } = useContext<GlobalContextType>(GlobalContext);
  const { formatMessage } = useIntl();

  const [engine, setEngine] = useState<EngineType>(EngineType.General);
  const [prompt, setPrompt] = useState('');
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [imageTask, setImageTask] = useState<API.AiImage | undefined>();
  const [imageTasks, setImageTasks] = useState<API.AiImage[]>([]);

  const [randomPromptIndex, setRandomPromptIndex] = useState(0);

  const examplePrompt = useCreation(
    () => RandomPrompt[engine][randomPromptIndex],
    [randomPromptIndex, engine],
  );

  const randomPrompt = useMemoizedFn(() => {
    const prompts = RandomPrompt[engine];
    const promptIndex =
      randomPromptIndex + 1 > prompts.length - 1 ? 0 : randomPromptIndex + 1;
    setRandomPromptIndex(promptIndex);
  });

  const { runAsync: runCreateAIImage, loading } = useRequest(
    async () => {
      if (!walletAddress) {
        openWalletModal();
        return;
      }
      if (!prompt.trim()) return;

      try {
        let aiImage = (
          await createAIImage(prompt, `${width}_${height}`, engine)
        ).createAiImage;
        while (
          aiImage.status === 'pending' ||
          aiImage.status === 'processing'
        ) {
          await sleep(1000);
          aiImage = (await getAIImage(aiImage.id)).aiImage;

          if (aiImage.status === 'success') {
            setImageTask(aiImage);
            setImageTasks((state) => [aiImage, ...state]);
            setPrompt('');
          } else if (aiImage.status === 'error') {
            message.error(formatMessage({ id: 'ai-creation.generate-failed' }));
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    {
      manual: true,
    },
  );

  return (
    <div
      style={{
        display: show ? 'block' : 'none',
      }}
    >
      <Row justify={'space-between'} gutter={48}>
        <Col span={14}>
          <div key={'model'} className={styles.configItem}>
            <div className={styles.title}>
              <span>{formatMessage({ id: 'ai-creation.config.model' })}</span>
            </div>
            <Row style={{ overflowX: 'auto' }} gutter={[12, 12]} wrap={false}>
              {EngineOptions.map((_engine) => (
                <Col key={_engine}>
                  <div
                    onClick={() => {
                      if (loading) return;
                      setEngine(_engine);
                    }}
                    className={classNames(styles.engineCard, {
                      [styles.engineCardActive]: engine === _engine,
                    })}
                  >
                    <div>
                      <div className={styles.modelName}>
                        {formatMessage({ id: EngineName[_engine] })}
                      </div>
                      <div className={styles.modelDesc}>
                        {formatMessage({ id: EngineDesc[_engine] })}
                      </div>
                    </div>

                    <img
                      src={EngineBackground[_engine]}
                      className={styles.modelImage}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
          <div key={'prompt'} className={styles.configItem}>
            <div className={styles.title}>
              <span>{formatMessage({ id: 'ai-creation.config.prompt' })}</span>
            </div>
            <Input.TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              style={{ resize: 'none', border: '2px solid #d71212' }}
              placeholder={formatMessage({
                id: EnginePlaceholder[engine],
              })}
              disabled={loading}
            />
            <div className={styles.example}>
              <div>
                <b>{formatMessage({ id: 'ai-creation.config.example' })}</b>
                <span
                  className={styles.exampleContent}
                  onClick={() => {
                    if (loading) return;
                    setPrompt(examplePrompt);
                  }}
                >
                  {examplePrompt}
                </span>
              </div>
              <Tooltip
                title={formatMessage({
                  id: 'ai-creation.config.another-prompt',
                })}
              >
                <ReloadOutlined
                  style={{ cursor: 'pointer', fontSize: 12, marginTop: 4 }}
                  onClick={randomPrompt}
                />
              </Tooltip>
            </div>
          </div>
          <div key={'size'} className={styles.configItem}>
            <div className={styles.title}>
              <span>{formatMessage({ id: 'ai-creation.config.size' })}</span>
            </div>
            <Row gutter={12}>
              {Sizes.map((size) => (
                <Col key={`${size.width}_${size.height}`}>
                  <div
                    className={classNames(styles.sizeCard, {
                      [styles.sizeCardSelected]:
                        width === size.width && height === size.height,
                    })}
                    onClick={() => {
                      if (loading) return;
                      setWidth(size.width);
                      setHeight(size.height);
                    }}
                  >
                    <div className={styles.sizeCardRectWrapper}>
                      <div
                        className={styles.sizeCardRect}
                        style={
                          size.width > size.height
                            ? {
                                width: '100%',
                                paddingTop: `${
                                  (size.height / size.width) * 100
                                }%`,
                              }
                            : {
                                paddingLeft: `${
                                  (size.width / size.height) * 100
                                }%`,
                                height: '100%',
                              }
                        }
                      />
                    </div>
                    <div>{`${size.width} : ${size.height}`}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
          <div className={styles.rowCenter}>
            <Button
              size={'large'}
              type={'primary'}
              shape={'round'}
              style={{ width: 450 }}
              onClick={runCreateAIImage}
              loading={loading}
            >
              {formatMessage({ id: 'ai-creation.generate' })}
            </Button>
          </div>
        </Col>
        <Col span={10} className={styles.outputPanel}>
          <div className={styles.outputImageContainer}>
            {imageTask && (
              <Tooltip
                title={formatMessage({ id: 'ai-creation.click-to-download' })}
              >
                <img
                  src={`${PREFIX}${imageTask.imageUrl}`}
                  onClick={() =>
                    downloadImage(
                      `${PREFIX}${imageTask.imageUrl}`,
                      `${imageTask.id}.png`,
                    )
                  }
                />
              </Tooltip>
            )}
          </div>
          <Row gutter={[6, 6]} wrap={true} className={styles.outputImageList}>
            {imageTasks.map((e) => (
              <Col key={e.id} span={6}>
                <div
                  className={styles.outputImageContainer}
                  onClick={() => setImageTask(e)}
                >
                  <img src={`${PREFIX}${e.imageUrl}`} />
                </div>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
}
