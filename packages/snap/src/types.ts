import { JsonRpcRequest } from '@metamask/snaps-sdk';

export interface AntelopeRequest extends JsonRpcRequest {
  params?: {
    chainId: string;
  };
}

export interface AntelopeSignatureRequest extends JsonRpcRequest {
  params?: {
    chainId: string;
    transaction: string;
  };
}
