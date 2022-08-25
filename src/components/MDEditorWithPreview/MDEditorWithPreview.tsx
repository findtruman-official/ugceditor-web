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
}

export default function MDEditorWithPreview({
  value,
  onChange,
  placeholder,
  style = {},
}: MDEditorWithPreviewProps) {
  const { formatMessage } = useIntl();
  const [preview, setPreview] = useState(false);

  return (
    <>
      <MDEditor
        style={style}
        textareaProps={{
          placeholder,
        }}
        value={value}
        hideToolbar={true}
        preview={'edit'}
        onChange={(e) => onChange(e!)}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
      />
      <div className={styles.previewBtn} onClick={() => setPreview(true)}>
        <SearchOutlined /> {formatMessage({ id: 'create-task.preview' })}
      </div>
      <Modal
        visible={preview}
        onCancel={() => setPreview(false)}
        centered={true}
        footer={null}
        closable={false}
        bodyStyle={{
          padding: '24px 48px',
        }}
      >
        <MDEditor.Markdown source={value} linkTarget={'_blank'} />
      </Modal>
    </>
  );
}
