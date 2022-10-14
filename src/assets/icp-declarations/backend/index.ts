import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface Sale {
  id: bigint;
  nft: Principal;
  token: Principal;
  total: bigint;
  authorClaimed: bigint;
  authorReserved: bigint;
  recv: Principal;
  sold: bigint;
  price: bigint;
  uriPrefix: string;
}
export interface Story {
  id: bigint;
  cid: string;
  author: Principal;
}
export interface _SERVICE {
  countSales: ActorMethod<[], bigint>;
  countStories: ActorMethod<[], bigint>;
  getSale: ActorMethod<[bigint], [] | [Sale]>;
  getStory: ActorMethod<[bigint], [] | [Story]>;
  mintNft: ActorMethod<[bigint], [] | [bigint]>;
  publishNft: ActorMethod<
    [
      bigint,
      bigint,
      bigint,
      Principal,
      Principal,
      bigint,
      string,
      string,
      string,
    ],
    [] | [Sale]
  >;
  publishStory: ActorMethod<[string], Story>;
  updateStory: ActorMethod<[bigint, string], [] | [Story]>;
}

export declare const backend: _SERVICE;
export declare const idlFactory: any;
