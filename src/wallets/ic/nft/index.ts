import type { ActorMethod } from '@dfinity/agent';
import {Principal} from "@dfinity/principal";

export interface _SERVICE {
    nameDip721: ActorMethod<[], string>;
    balanceOfDip721: ActorMethod<[Principal], bigint>;
}

export declare const idlFactory: any;