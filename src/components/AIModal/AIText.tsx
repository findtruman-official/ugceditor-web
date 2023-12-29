import { GlobalContext, GlobalContextType } from '@/layouts';
import { runAIChat } from '@/services/ai';
import { useIntl } from '@@/plugin-locale';
import { LoadingOutlined } from '@ant-design/icons';
import { useMutationObserver, useRequest } from 'ahooks';
import { Button, Input } from 'antd';
import { useContext, useRef, useState } from 'react';
import Typewriter from 'typewriter-effect';
import styles from './index.less';

export function AIText({
  walletAddress,
  show,
}: {
  walletAddress: string;
  show: boolean;
}) {
  const { openWalletModal } = useContext<GlobalContextType>(GlobalContext);
  const { formatMessage } = useIntl();
  const ref = useRef<HTMLDivElement>(null);

  useMutationObserver(
    (mutationsList) => {
      if (!ref.current) return;
      ref.current.scrollTop = ref.current.scrollHeight;
    },
    ref,
    {
      subtree: true,
      characterData: true,
      childList: true,
    },
  );

  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [writing, setWriting] = useState(false);

  const { runAsync: sendMessage, loading } = useRequest(
    async () => {
      if (!walletAddress) {
        openWalletModal();
        return;
      }
      if (!input.trim()) return;

      let _messages = [...messages, input];
      setMessages(_messages);
      try {
        const { runAichat: result } = await runAIChat(_messages);
        _messages = [..._messages, result];
        setWriting(true);
        setMessages(_messages);
        setInput('');
      } catch (e) {
        console.log(e);
        _messages.splice(_messages.length - 1, 2);
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
      <div ref={ref} className={styles.messageContainer}>
        {messages.map((e, index) => (
          <div key={`message-${index}`} className={styles.messageItem}>
            <div className={styles.name}>
              {index % 2 === 0
                ? walletAddress
                : formatMessage({ id: 'ai-creation.ai-story-creation' })}
            </div>
            <div className={styles.content}>
              {index % 2 === 0 ? (
                e
              ) : (
                <Typewriter
                  options={{
                    strings: e,
                    autoStart: true,
                    loop: false,
                    skipAddStyles: true,
                    delay: 15,
                    pauseFor: 0,
                    cursorClassName: styles.cursor,
                  }}
                  onInit={(typewriter) => {
                    typewriter.callFunction(() => {
                      setWriting(false);
                    });
                  }}
                />
              )}
            </div>
          </div>
        ))}
        {messages.length % 2 !== 0 && (
          <div key={`message-loading`} className={styles.messageItem}>
            <div className={styles.name}>
              {formatMessage({ id: 'ai-creation.ai-story-creation' })}
            </div>
            <div className={styles.content}>
              <LoadingOutlined />
            </div>
          </div>
        )}
      </div>
      <div className={styles.customInputArea}>
        <Input.TextArea
          className={styles.customInput}
          rows={4}
          style={{
            resize: 'none',
          }}
          bordered={false}
          placeholder={formatMessage({
            id: 'ai-creation.text.input-placeholder',
          })}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || writing}
        />
        <Button
          type={'primary'}
          shape={'round'}
          onClick={sendMessage}
          loading={loading || writing}
        >
          {formatMessage({ id: 'ai-creation.text.create' })}
        </Button>
      </div>
    </div>
  );
}
