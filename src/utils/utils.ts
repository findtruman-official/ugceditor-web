import { message } from 'antd';

export async function copy(content: string) {
  await navigator.clipboard.writeText(content);
  message.success('Copied!');
}

export async function sleep(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t));
}
