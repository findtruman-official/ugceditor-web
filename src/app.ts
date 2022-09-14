export async function getInitialState(): Promise<{ name: string }> {
  return { name: '@umijs/max' };
}

export const layout = () => {
  return {
    logo: 'https://findtruman.io/favicon.png',
    layout: 'top',
    fixedHeader: true,
    headerRender: false,
    menuHeaderRender: false,
  };
};
