import '@umijs/max/typings';

declare global {
  interface Window {
    phantom: any;
  }

  namespace API {
    type Chain = {
      name: string;
      type: string;
    };

    type Jwt = {
      expiresIn: number;
      token: string;
    };

    type Story = {
      id: number;
    };

    type User = {
      account: string;
      chain: string;
    };

    type ResultWrapper<T> = {
      data: T;
      code: number;
      message: string;
    };

    type IpfsData = {
      cid: string;
      size: number;
    };
  }
}
