import { message } from 'antd';

export async function copy(content: string) {
  await navigator.clipboard.writeText(content);
  message.success('Copied!');
}

export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export const downloadImage = async (src: string, name: string) => {
  try {
    const image = await fetch(src);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement('a');
    link.href = imageURL;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.log(e);
  }
};
