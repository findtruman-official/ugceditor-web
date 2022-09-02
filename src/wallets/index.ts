export enum ChainType {
  Solana = 'solana-dev',
  Klaytn = 'klaytn-baobab',
}

export enum WalletType {
  Phantom,
  Kaikas,
}

export enum WalletAutoConnectType {
  False = '0',
  True = '1',
}

export interface WalletEvents {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  onAccountChanged?: (address: string) => void;
  onChainChanged?: (chainId: string) => void;
}

export interface WalletProvider {
  /**
   * 钱包类型
   */
  providerType: WalletType;
  /**
   * 钱包API
   */
  provider?: any;
  /**
   * 链类型
   */
  chainType: ChainType;
  /**
   * 主合约地址
   */
  factoryAddress: string;
  /**
   * Finds合约地址
   */
  findsMintAddress: string;

  /**
   * 构造方法
   * 可以在此处:
   *  1. 设置 this.provider
   *  2. 实例化 contract (如有)
   *  3. 监听钱包插件的事件 (如有)，若钱包插件不提供事件的API，需要将 events 保存到变量中，供其他方法调用
   */
  // constructor(
  //   events: WalletEvents,
  //   factoryAddress: string,
  //   findsMintAddress: string,
  // ): WalletProvider;

  /**
   * 判断浏览器钱包插件是否安装
   * 钱包插件一般会在 window 下注入自己的全局API，通过判断 window.{插件API名} 是否为空判断插件的安装
   * @return 插件是否安装
   */
  isAvailable(): boolean | Promise<boolean>;

  /**
   * 返回钱包插件的API
   * 即 window.{插件API名}
   * @return 插件API
   */
  getProvider<PT>(): PT | undefined;

  /**
   * 当插件未安装的时候，指引用户前往安装的网站
   * 调用 window.open({钱包官网 or 插件安装网址}, '_blank', 'noreferrer noopener');
   */
  openWebsite(): void;

  /**
   * 访问网站时是否自动连接钱包
   * 当钱包连接后，在浏览器 localStorage 中设置一个值表示需要自动连接，即 WalletAutoConnectType.True
   * 约定 key 值格式为: {钱包名大写}_AUTO_CONNECT
   * 当钱包断开连接后，在浏览器 localStorage 中将此值设置为不自动连接，即 WalletAutoConnectType.False
   * @param autoConnect
   */
  setAutoConnect(autoConnect: WalletAutoConnectType): void;

  /**
   * 从 localStorage 中获取 {钱包名大写}_AUTO_CONNECT
   * 判断其值是否等于 WalletAutoConnectType.True 并返回
   * @return 是否静默连接
   */
  getAutoConnect(): boolean;

  /**
   * 静默连接
   * 一般钱包插件会提供一个静默连接的 API，用于让已经认证过的网站可以自动连接钱包，并且不会弹窗插件窗口让用户确认
   * 由于各个钱包之间实现有差异，务必确保该方法不会导致进入页面（或页面刷新）后弹出插件窗口
   * 当 getAutoConnect 返回 True 时，会调用该方法
   * @return 钱包地址
   */
  silentConnect(): Promise<string | undefined>;

  /**
   * 连接钱包方法
   * 如果钱包没有提供类似于 onConnect 的事件监听，在连接成功后要手动调用下构造函数中传入的 events.onConnect(address)
   * @return Promise<string> 钱包地址
   */
  connect(): Promise<string | undefined>;

  /**
   * 断开钱包连接方法
   * 如果钱包提供了 disconnect 方法则调用
   * 并提供一个伪退出状态，即页面显示该钱包未连接，并在页面刷新后不会再自动连接该钱包
   * 此处需要执行:
   *    1. 调用 this.setAutoConnect(WalletAutoConnectType.False) 关闭自动连接钱包
   *    2. 如果钱包没有提供类似于 onDisconnect 的事件监听，在连接成功后要手动调用下构造函数中传入的 events.onDisconnect()
   */
  disconnect(): Promise<void>;

  /**
   * 签名数据
   * 调用钱包的签名API，返回签名后的数据
   * @param message
   * @return 签名过的数据
   */
  signMessage(message: any): Promise<any>;

  /**
   * 发行故事
   * @param cid contentHash
   * @return 故事id
   */
  publishStory(cid: string): Promise<string>;

  /**
   * 更新故事
   * @param id 故事id
   * @param cid 新的contentHash
   */
  updateStory(id: string, cid: string): Promise<void>;

  /**
   * 获取 Finds 代币精度
   * 通过该链上的 Finds 合约查询
   * @return Finds代币精度
   */
  getMintDecimals(): Promise<number>;

  /**
   * 发行故事 NFT
   * @param id
   * @param price
   * @param total
   * @param reserved
   * @param title
   * @param uriPrefix
   */
  publishStoryNft(
    id: string,
    price: number,
    total: number,
    reserved: number,
    title: string,
    uriPrefix: string,
  ): Promise<void>;

  /**
   * 铸造故事 NFT
   * 铸造前先调用 Finds 合约查询用户的 Finds 余额是否足够，若不足则调用 onInsufficientFinds 弹窗提示
   * @param id
   * @param author
   * @param price
   * @param nftSaleAddr
   * @param onInsufficientFinds 当 Finds 余额不足时返回账户和还需要的Finds数量，用于页面弹窗提示
   */
  mintStoryNft(
    id: string,
    author: string,
    price: string,
    nftSaleAddr: string,
    onInsufficientFinds?: (account: string, amount: string) => void,
  ): Promise<void>;

  /**
   * 查询账户对某个故事NFT的持有量
   * @param account
   * @param nftName
   * @param storyId
   * @return NFT持有量
   */
  balanceOfStoryNft(
    account: string,
    nftName: string,
    storyId: string,
  ): Promise<number>;

  /**
   * 查询故事发行的nft的地址
   * @param storyId
   */
  getNftAddress(storyId: string): Promise<string>;

  /**
   * 创建任务
   * @param storyId
   * @param cid
   * @param nftAddress
   * @param rewards
   */
  createTask(
    storyId: string,
    cid: string,
    nftAddress: string,
    rewards: number[],
  ): Promise<void>;

  /**
   * 创建任务
   * @param storyId
   * @param taskId
   * @param cid
   */
  updateTask(storyId: string, taskId: string, cid: string): Promise<void>;

  /**
   * 取消任务
   * @param storyId
   * @param taskId
   */
  cancelTask(storyId: string, taskId: number): Promise<void>;

  /**
   * 提交作品
   * @param storyId
   * @param taskId
   * @param cid
   */
  createTaskSubmit(storyId: string, taskId: number, cid: string): Promise<void>;

  /**
   * 取消提交作品
   * @param storyId
   * @param taskId
   * @param submitId
   */
  withdrawTaskSubmit(
    storyId: string,
    taskId: number,
    submitId: number,
  ): Promise<void>;

  /**
   * 完成任务
   * @param storyId
   * @param taskId
   * @param submitId
   */
  markTaskDone(
    storyId: string,
    taskId: number,
    submitId: number,
  ): Promise<void>;

  /**
   * 作者保留的Nft还有多少未铸造
   * @param storyId
   */
  authorReservedNftRest(storyId: string): Promise<number>;

  /**
   * 批量铸造作者保留Nft
   * 数量应为 authorReserved - authorClaimed
   */
  claimAuthorReservedNft(storyId: string): Promise<void>;

  /**
   * 查询作者持有的故事NFT的tokenId
   * @param account
   * @param nftName
   * @param storyId
   */
  tokenIdOfStoryNft(
    account: string,
    nftName: string,
    storyId: string,
  ): Promise<number[]>;
}
