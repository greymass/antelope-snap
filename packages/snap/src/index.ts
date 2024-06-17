import {
  type OnRpcRequestHandler,
  MethodNotFoundError,
} from '@metamask/snaps-sdk';

import { getPublicKey, signTransaction } from './rpc';
import { AntelopeRequest, AntelopeSignatureRequest } from './types';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  console.log(request);
  switch (request.method) {
    case 'antelope_getPublicKey':
      return await getPublicKey(request as AntelopeRequest);

    case 'antelope_signTransaction':
      return String(await signTransaction(request as AntelopeSignatureRequest));

    default:
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new MethodNotFoundError(request.method);
  }
};
