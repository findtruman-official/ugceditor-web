import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'fcc-story',
    locale: true,
  },
  routes: [
    {
      path: '/',
      redirect: '/stories',
    },
    {
      name: 'stories',
      path: '/stories',
      component: './stories',
    },
    {
      path: '/story/:storyId',
      component: './stories/story',
    },
    {
      path: '/story/:storyId/chapter/:chapterId',
      component: './stories/story/chapter',
    },
    {
      path: '/story/:storyId/chapter/:chapterId/edit',
      component: './stories/story/chapter/edit',
    },
    {
      name: 'writer',
      path: '/writer',
      component: './writer',
    },
  ],
  locale: {
    default: 'en-US',
    baseSeparator: '-',
  },
  npmClient: 'yarn',
  theme: {
    'primary-color': '#3e38d9',
  },
  mfsu: false,
  proxy: {
    '/api': {
      target: 'http://10.243.248.69:3000/',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
    '/ipfs': {
      target: 'http://10.243.248.69:3000/',
      changeOrigin: true,
      pathRewrite: { '^/ipfs': '/ipfs' },
    },
  },
});
