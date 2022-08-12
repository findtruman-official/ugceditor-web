export function shortenAccount(account: string) {
  if (!account) return '';
  return `${account.substring(0, 5)}...${account.substring(
    account.length - 5,
    account.length,
  )}`;
}
