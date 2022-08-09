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
});
