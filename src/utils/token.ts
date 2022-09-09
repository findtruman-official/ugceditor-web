import { login } from '@/services/api';

export const getTokenMessage = () =>
  `sign this message to login FindTruman Co-creation Story Platform.\ncurrent time: ${Math.floor(
    new Date().valueOf() / 1000,
  )}`;

export const saveToken = (
  account: string,
  chain: string,
  token: string,
  expireAt: number,
) => {
  localStorage.setItem(
    `FCC_TOKEN_${chain}_${account}`,
    JSON.stringify({
      token,
      expireAt,
    }),
  );
};

export const refreshToken = async (
  account: string,
  chain: string,
  message: string,
  pubKey: string,
  signature: string,
) => {
  const { token, expiresIn } = (
    await login(account, chain, message, pubKey, signature)
  ).login;
  saveToken(account, chain, token, new Date().valueOf() + expiresIn * 1000);
  return token;
};

export const getTokenFromStorage = (
  account: string,
  chain: string,
): string | undefined => {
  const storage = localStorage.getItem(`FCC_TOKEN_${chain}_${account}`);
  try {
    if (storage) {
      const { token, expireAt } = JSON.parse(storage);
      if (expireAt - new Date().valueOf() > 3600) {
        return token;
      }
    }
  } catch (e) {
    localStorage.removeItem(`FCC_TOKEN_${chain}_${account}`);
  }
  return undefined;
};

export const isTokenValid = async (token: string) => {};
