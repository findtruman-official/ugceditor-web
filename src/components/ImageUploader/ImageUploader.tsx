import { PREFIX } from '@/utils/const';
import { PlusOutlined } from '@ant-design/icons';
import { Upload, UploadFile } from 'antd';
import ImgCrop from 'antd-img-crop';
import { useEffect, useState } from 'react';

interface ImageUploaderProps {
  aspect: number;
  label: string;
  token: string;
  value?: string;
  onChange?: (v: string) => any;
}

export default function ImageUploader({
  aspect,
  label,
  token,
  value,
  onChange,
}: ImageUploaderProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (value) {
      setFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: `${PREFIX}/ipfs/file/${encodeURIComponent(value)}`,
        },
      ]);
    }
  }, [value]);

  return (
    <ImgCrop aspect={aspect} rotate>
      <Upload
        headers={{ 'x-token': token }}
        action={`${PREFIX}/ipfs/file`}
        name={'file'}
        accept={'image/*'}
        maxCount={1}
        multiple={false}
        listType="picture-card"
        style={{ width: '100%', height: 260 }}
        fileList={fileList}
        showUploadList={{
          showPreviewIcon: false,
        }}
        onChange={({ fileList: newFileList }) => {
          setFileList(newFileList);
          if (newFileList[0]?.response?.cid) {
            onChange?.(newFileList[0]?.response?.cid);
          }
        }}
      >
        {fileList.length === 0 && (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>{label}</div>
          </div>
        )}
      </Upload>
    </ImgCrop>
  );
}
