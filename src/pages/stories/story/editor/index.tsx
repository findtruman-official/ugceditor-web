import { EditorChatWidget, PlayChatWidget } from '@/components/Editor/Chat';
import styles from '@/components/Editor/editor-style.less';
import ModelTab from '@/components/Editor/ModelTab';
import NPCTab from '@/components/Editor/NPCTab';
import SceneTab from '@/components/Editor/SceneTab';
import { sleep } from '@/utils/utils';
import {
  CloseOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useMemoizedFn } from 'ahooks';
import { Button } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';

const Tabs = ['Scene', 'Model', 'NPC'];

// async function getScreenMedia() {
//   // const shareScreenBtn = document.getElementById("shareScreenBtn");
//   const screenVideo = document.getElementById("background-video");
//
//   // shareScreenBtn.addEventListener("click", async () => {
//   try {
//     // 请求屏幕共享
//     const mediaStream = await navigator.mediaDevices.getDisplayMedia({
//       video: {
//         frameRate: 60,
//         width: 1920,
//         height: 1080,
//       },
//     });
//
//     // 将媒体流设置给video元素，显示共享的内容
//     screenVideo.srcObject = mediaStream;
//
//     // 当共享停止时，执行一些清理工作
//     mediaStream.getVideoTracks()[0].onended = () => {
//       console.log("屏幕共享已停止");
//       screenVideo.srcObject = null;
//     };
//   } catch (error) {
//     console.error("屏幕共享失败", error);
//   }
//   // });
// }
// getScreenMedia();

function Editor() {
  const [tab, setTab] = useState(Tabs[0]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showEditChat, setShowEditChat] = useState(false);

  const handlePreview = useMemoizedFn(async () => {
    setLoading(true);
    await sleep(3000);
    setPreviewMode(true);
    setLoading(false);
    setPreviewMode(true);
  });

  return (
    <div>
      {loading ? (
        <div className={styles['loading-mask']}>
          <LoadingOutlined style={{ fontSize: 64 }} />
          <div style={{ fontSize: 16 }}>The scene is launching...</div>
        </div>
      ) : previewMode ? (
        <div>
          <PlayChatWidget />
          <Button
            shape="circle"
            className={styles['exit-button']}
            type="primary"
            size="large"
            icon={<CloseOutlined />}
            onClick={() => setPreviewMode(false)}
          />
        </div>
      ) : (
        <></>
      )}
      {!previewMode && (
        <div className={styles['editor-root']}>
          <div className={styles['editor-container']}>
            <div className={styles['tab-container']}>
              <div className={styles['tabs']}>
                {Tabs.map((e) => (
                  <div
                    key={e}
                    className={classNames(styles['tab'], {
                      [styles['tab-active']]: tab === e,
                    })}
                    onClick={() => setTab(e)}
                  >
                    {e}
                  </div>
                ))}
              </div>
              <div className={styles['tab-extra']}>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handlePreview}
                >
                  Preview
                </Button>
              </div>
            </div>
            <div className={styles['tab-pane']}>
              <SceneTab visible={tab === 'Scene'} />
              <ModelTab visible={tab === 'Model'} />
              <NPCTab
                visible={tab === 'NPC'}
                onShowChat={() => setShowEditChat(true)}
              />
            </div>
          </div>
        </div>
      )}
      {!previewMode && showEditChat && tab === 'NPC' && <EditorChatWidget />}
      {/*<PlayChatWidget />*/}
      {/*<EditorChatWidget />*/}
    </div>
  );
}

export default Editor;
