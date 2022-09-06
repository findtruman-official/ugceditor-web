import { useIntl } from '@@/exports';
import { SearchOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import { Modal } from 'antd';
import React, { useState } from 'react';
import rehypeSanitize from 'rehype-sanitize';
import styles from './MDEditorWithPreview.less';

interface MDEditorWithPreviewProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  height?: number | string;
  marginBottom?: boolean;
}

export default function MDEditorWithPreview({
  value,
  onChange,
  placeholder,
  style = {},
  disabled = false,
  height = 200,
  marginBottom = true,
}: MDEditorWithPreviewProps) {
  const { formatMessage } = useIntl();
  const [preview, setPreview] = useState(false);

  return (
    <div data-color-mode="dark">
      <MDEditor
        height={height}
        style={style}
        textareaProps={{
          placeholder,
          disabled,
        }}
        value={value}
        hideToolbar={true}
        preview={'edit'}
        onChange={(e) => onChange(e!)}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
      />
      <div
        className={styles.previewBtn}
        style={!marginBottom ? { marginBottom: 0 } : {}}
        onClick={() => setPreview(true)}
      >
        <SearchOutlined /> {formatMessage({ id: 'create-task.preview' })}
      </div>
      <Modal
        open={preview}
        onCancel={() => setPreview(false)}
        centered={true}
        footer={null}
        closable={false}
        bodyStyle={{
          padding: '24px 48px',
        }}
      >
        <div data-color-mode="dark">
          <MDEditor.Markdown source={value} linkTarget={'_blank'} />
        </div>
      </Modal>
    </div>
  );
}
