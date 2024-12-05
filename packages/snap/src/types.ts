import { JsonRpcRequest } from '@metamask/snaps-sdk';

export interface AntelopeSignatureRequest extends JsonRpcRequest {
  params?: {
    chainId: string;
    transaction: string;
    keyIndex?: number;
  };
}

export interface AntelopeGetOwnerPublicKeyRequest extends JsonRpcRequest {
  params: {
    chainId: string;
  };
}

export interface AntelopeGetActivePublicKeyRequest extends JsonRpcRequest {
  params: {
    chainId: string;
    keyIndex?: number;
  };
}
