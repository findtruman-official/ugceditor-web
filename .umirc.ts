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
      path: '/story',
      redirect: '/stories',
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
      path: '/story/:storyId/chapter',
      redirect: '/story/:storyId',
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
    {
      redirect: '/stories',
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
      // target: 'http://10.243.248.69:3000/',
      target: 'https://findtruman.io/fcc-story/graphql',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
    '/fcc-story/ipfs': {
      // target: 'http://10.243.248.69:3000/',
      target: 'https://findtruman.io/fcc-story/ipfs',
      changeOrigin: true,
      pathRewrite: { '^/fcc-story/ipfs': '' },
    },
  },
});
