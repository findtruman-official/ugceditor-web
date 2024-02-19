import Musk from '@/assets/Mixamo.gif';
import { random, sleep } from '@/utils/utils';
import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Input } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import Typewriter from 'typewriter-effect';
import styles from './editor-style.less';

const ChatHistory = ({
  name,
  content,
  effect,
}: {
  name: string;
  content: string;
  effect: boolean;
}) => {
  return (
    <div className={styles['chat-history']}>
      <div className={styles['chat-history-name']}>{name}</div>
      {effect ? (
        <Typewriter
          options={{
            strings: content,
            autoStart: true,
            loop: false,
            skipAddStyles: true,
            delay: 15,
            pauseFor: 0,
            cursorClassName: styles['cursor'],
          }}
          onInit={(typewriter) => {
            typewriter.callFunction(() => {});
          }}
        />
      ) : (
        <div className={styles['chat-history-content']}>{content}</div>
      )}
    </div>
  );
};

const ChatHistoryList = ({
  contents,
  playerFirst = false,
  model = false,
}: {
  contents: string[];
  playerFirst?: boolean;
  model?: boolean;
}) => {
  const [showModel, setShowModel] = useState(model);

  const names = playerFirst ? ['You', 'Elon Musk'] : ['Elon Musk', 'You'];

  return (
    <div className={styles['chat-history-list']}>
      {model && (
        <div>
          <div className={styles['model-preview-label']}>
            <div>Model Preview</div>
            {showModel ? (
              <MinusSquareOutlined onClick={() => setShowModel(false)} />
            ) : (
              <PlusSquareOutlined onClick={() => setShowModel(true)} />
            )}
          </div>
          {showModel && (
            <img
              style={{
                display: 'block',
                width: '60%',
                objectFit: 'contain',
                borderRadius: 4,
              }}
              src={Musk}
            />
          )}
        </div>
      )}
      {contents.map((c, index) => (
        <ChatHistory
          key={`chat-${index}`}
          content={c}
          name={names[index % 2]}
          effect={index % 2 === (playerFirst ? 1 : 0)}
        />
      ))}
    </div>
  );
};

const EditorMessages = [
  'Greetings, my fellow curious mind.  What fascinating topic brings you to our digital realm today?',
  'Absolutely. Mars is the best option for humanity to become a multi-planetary species. It has a day-night cycle similar to Earth, abundant resources, and a potential for terraforming. We are working hard at SpaceX to develop Starship, a reusable rocket that can carry 100 people and tons of cargo to Mars.',
  "I'm glad you think so. Optimus is one of my most ambitious projects yet. I hope to make it a reality soon.",
];

const EditorChatWidget = () => {
  const [input, setInput] = useState('');
  const [contents, setContents] = useState([]);

  // const { sendChat, chatLoading } = useChatGPT();

  const { run: sendChat, loading: chatLoading } = useRequest(
    async (content?: string) => {
      console.log('sendChat');
      if (content) {
        setContents((contents) => [...contents, content]);
      }
      await sleep(random(2000, 3000));
      setContents((contents) => [...contents, EditorMessages.shift()]);
    },
    {
      debounceWait: 100,
    },
  );

  return (
    <div
      className={classNames(
        styles['chat-container'],
        styles['edit-chat-container'],
      )}
    >
      <div className={styles['editor-chat-title']}>
        Test Chat with Elon Musk
      </div>
      <ChatHistoryList contents={contents} model={true} />
      <Input.TextArea
        disabled={chatLoading}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ resize: 'none', marginBottom: 12, marginTop: 12 }}
        placeholder={'Enter to chat'}
      />
      <div className={styles['flex-end']}>
        <Button
          loading={chatLoading}
          type={'primary'}
          onClick={() => {
            sendChat(input);
            setInput('');
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

const PlayMessages = [
  'Well, that’s a tough question. Maybe it’s Lucas, who had a grudge against his friends for some reason. Maybe it’s Mia, who wanted to expose a dark secret for her magazine. Maybe it’s Ethan, who snapped after losing Leah. Or maybe it’s someone else, someone unexpected, someone clever.',
  'I was at the cottage, with the rest of you. I was having a good time, until Jake suggested the game. I drew a card from the box, and it said I was a victim. I didn’t know who the killer was, or what they were planning. I hoped we would be safe, and survive, and win. But we didn’t. We didn’t, because of the killer. And he killed Leah. And he tried to kill us. And he almost succeeded. 😢',
];

const PlayChatWidget = () => {
  const [input, setInput] = useState('');
  const [contents, setContents] = useState([]);

  // const { sendChat, chatLoading } = useChatGPT();

  const { run: sendChat, loading: chatLoading } = useRequest(
    async (content?: string) => {
      console.log('sendChat');
      if (content) {
        setContents((contents) => [...contents, content]);
      }
      await sleep(random(2000, 3000));
      setContents((contents) => [...contents, PlayMessages.shift()]);
    },
    {
      debounceWait: 100,
      manual: true,
    },
  );

  return (
    <div
      className={classNames(
        styles['chat-container'],
        styles['play-chat-container'],
      )}
    >
      <div className={styles['editor-chat-title']}>Chat with Elon Musk</div>
      <ChatHistoryList contents={contents} playerFirst={true} />
      <Input
        disabled={chatLoading}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ marginBottom: 12, marginTop: 12, width: '100%' }}
        placeholder={'Enter to chat'}
        onPressEnter={() => {
          // setContents((contents) => [...contents, input]);
          sendChat(input);
          setInput('');
        }}
      />
    </div>
  );
};

export { EditorChatWidget, PlayChatWidget };
