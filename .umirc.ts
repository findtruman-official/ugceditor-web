import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {
    dark: true,
  },
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'UGCEditor',
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
      path: '/story/:chainType/:storyId',
      component: './stories/story',
    },
    {
      path: '/story/:chainType/:storyId/chapter/:chapterId',
      component: './stories/story/chapter',
    },
    {
      path: '/story/:chainType/:storyId/chapter',
      redirect: '/story/:chainType/:storyId',
    },
    {
      path: '/story/:chainType/:storyId/chapter/:chapterId/edit',
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
    {
      path: '/activity',
      component: './activity',
    },
  ],
  locale: {
    default: 'en-US',
    baseSeparator: '-',
  },
  npmClient: 'yarn',
  theme: {
    'primary-color': '#d71212',
  },
  mfsu: false,
  proxy: {
    '/fcc-story/graphql': {
      // target: 'http://10.243.248.69:3000/graphql/',
      target: 'https://findtruman.io/fcc-story/graphql',
      // target: 'http://10.243.118.105:3000/graphql',
      changeOrigin: true,
      pathRewrite: { '^/fcc-story/graphql': '' },
    },
    '/fcc-story/ipfs': {
      // target: 'http://10.243.248.69:3000/ipfs',
      target: 'https://findtruman.io/fcc-story/ipfs',
      // target: 'http://10.243.118.105:3000/ipfs',
      changeOrigin: true,
      pathRewrite: { '^/fcc-story/ipfs': '' },
    },
    '/graphql': {
      // target: 'http://10.243.248.69:3000/graphql/',
      target: 'http://192.168.0.107:3000/graphql/',
      // target: 'https://aiverse.me/graphql/',
      changeOrigin: true,
      pathRewrite: { '^/graphql': '' },
    },
  },
  history: {
    type: 'hash',
  },
  publicPath: process.env.NODE_ENV === 'development' ? '/' : './',
});
