import {
  Button,
  Col,
  Modal,
  Row,
  Pagination,
  ConfigProvider,
} from 'antd';
import styles from './MicroStoryDetailModal.less';
import React, { useEffect, useState } from 'react';
import MicroStoryActionList from '@/components/MicroStoryActionList/MicroStoryActionList';
import { useAsyncEffect, useCreation, useRequest } from 'ahooks';
import {CloseOutlined, LoadingOutlined} from '@ant-design/icons';
import OutputImg from '@/components/OutputImg/OutputImg';
import {getMicroStoryDetail} from '@/services/aiverse/api';
import { useModel } from '@@/exports';
import { MacScrollbar } from 'mac-scrollbar';

interface MicroStoryDetailModalProps {
  actId: string | undefined;
  storyId?: string | undefined;
  open: boolean;
  onClose: () => void;
  story: API.ActivityMicroStory | undefined;
  isActivityEnded: boolean;
}

const MicroStoryDetailModal = ({
                                 actId,
                                 storyId,
                                 open,
                                 onClose,
                                 story,
                                 isActivityEnded,
                               }: MicroStoryDetailModalProps) => {
  const [showContent, setShowContent] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [microStory, setMicroStory] = useState<
      API.ActivityMicroStory | undefined
  >(story);


  const { usersCache } = useModel('near', (state) => ({
    usersCache: state.usersCache,
  }));

  useEffect(() => {
    if (!open) {
      setShowContent(false);
      setPage(1);
    }
  }, [open]);

    useAsyncEffect(async () => {
        storyId && (await runMicroStory(storyId));
    }, [storyId]);


  useAsyncEffect(async () => {
    story && setMicroStory(story);
  }, [story]);

    const storyUser = useCreation(
        () => microStory && usersCache[microStory.uid],
        [microStory],
    );

    const { loading: loadingMicroStoryDetail, run: runMicroStory } = useRequest(
        async (microStoryId: string) => {
            try {
                let { getMicroStory } = await getMicroStoryDetail(microStoryId);
                setMicroStory(getMicroStory);
            } catch (e) {
                console.log(e);
            }
        },
        {
            manual: true,
        },
    );
  return (
      <Modal
          footer={false}
          centered={true}
          open={open}
          onCancel={() => {
            onClose();
          }}
          width={450}
          closable={false}
          className={styles.imgModal}
          destroyOnClose
      >
          {loadingMicroStoryDetail && (
              <div className={styles.loading}>
                  <LoadingOutlined style={{fontSize: 18}}/>
              </div>
          )}
        {!loadingMicroStoryDetail && microStory && (
            <Row>
              <Col span={24} className={styles.imgContainer}>
                <OutputImg
                    imageContainerStyle={{
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                    imageStyle={{
                      width: '100%',
                      height: 'auto',
                      cursor: 'default',
                      borderRadius: 0,
                    }}
                    outputUrl={
                      showContent && microStory?.contents?.length
                          ? microStory.contents[page - 1].outputUrl
                          : microStory.coverOutputUrl
                    }
                    changeable={false}
                />
              </Col>
              <Col span={24} className={styles.imgInfoContainer}>
                {showContent && microStory?.contents?.length ? (
                    <div style={{ position: 'relative', marginBottom: 20 }}>
                      <Button
                          className={styles.closeBtn}
                          onClick={() => {
                            setShowContent(false);
                            setPage(1);
                          }}
                          icon={<CloseOutlined />}
                      />
                      <div className={styles.contentConatiner}>
                        <div className={styles.content}>
                            <MacScrollbar
                                style={{
                                    overflowY: 'auto',
                                    padding: 12,
                                    flex: 1,
                                    maxHeight: 220,
                                }}
                            >
                                <div style={{ fontSize: 14 }}>
                                    {microStory.contents[page - 1].description}
                                </div>
                            </MacScrollbar>
                        </div>
                      </div>
                    </div>
                ) : (
                    <div style={{ position: 'relative', marginBottom: 20 }}>
                      <div className={styles.flexRowBetween}>
                        <div className={styles.title}>{microStory.title}</div>
                        <Button
                            style={{ padding: '0 8px' }}
                            onClick={onClose}
                            icon={<CloseOutlined />}
                        />
                      </div>

                      {storyUser && (
                          <div className={styles.userInfo}>
                            <img
                                className={styles.avatar}
                                src={storyUser.avatarUrl}
                                loading="lazy"
                                alt=""
                            />
                            <div className={styles.username}>{storyUser.username}</div>
                          </div>
                      )}
                        {microStory.description && <MacScrollbar
                            style={{
                                overflowY: 'auto',
                                padding: 12,
                                flex: 1,
                                maxHeight: 220,
                            }}
                        >
                            <div style={{fontSize: 14}}>
                                {microStory.description}
                            </div>
                        </MacScrollbar>}
                    </div>
                )}

                <div
                    className={
                      !!microStory?.contents?.length && microStory.frozen
                          ? styles.bottom
                          : styles.flexEnd
                    }
                >
                  {microStory.frozen && actId && (
                      <MicroStoryActionList
                          story={microStory}
                          actId={actId}
                          isActivityEnded={isActivityEnded}
                          style={{ width: '50%' }}
                      />
                  )}
                  {showContent ? (
                      !!microStory.contents?.length && (
                          <ConfigProvider
                              theme={{
                                token: {
                                  colorPrimary: '#fff',
                                },
                              }}
                          >
                            <Pagination
                                size="small"
                                total={microStory.contents.length}
                                current={page}
                                pageSize={1}
                                onChange={(page, pageSize) => {
                                  setPage(page);
                                }}
                            />
                          </ConfigProvider>
                      )
                  ) : (
                      <span
                          style={{
                            textAlign: 'center',
                          }}
                          className={styles.viewBtn}
                          onClick={() => setShowContent(true)}
                      >
                  View
                </span>
                  )}
                </div>
              </Col>
            </Row>
        )}
      </Modal>
  );
};
export default MicroStoryDetailModal;
