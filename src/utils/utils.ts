import { message } from 'antd';

export async function copy(content: string) {
  await navigator.clipboard.writeText(content);
  message.success('Copied!');
}
