import {
  type OnRpcRequestHandler,
  type OnInstallHandler,
  MethodNotFoundError,
  text,
  panel,
} from '@metamask/snaps-sdk';

import { signTransaction, getOwnerPublicKey, getActivePublicKey } from './rpc';
import type {
  AntelopeSignatureRequest,
  AntelopeGetOwnerPublicKeyRequest,
  AntelopeGetActivePublicKeyRequest,
} from './types';

const SNAP_NAME = 'EOS Wallet';
const HELP_URL = 'https://unicove.com/eos/signup/wallets/extensions/metamask';

/**
 * Handle the installation of the snap.
 *
 * @returns A confirmation message to the user.
 */
export const onInstall: OnInstallHandler = async () => {
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        text(`Welcome to the ${SNAP_NAME} Snap!`),
        text(
          `For help setting up an account, please visit our [MetaMask setup page](${HELP_URL}).`,
        ),
      ]),
    },
  });
};

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
  switch (request.method) {
    case 'antelope_getOwnerPublicKey':
      return await getOwnerPublicKey(
        request as AntelopeGetOwnerPublicKeyRequest,
      );

    case 'antelope_getActivePublicKey':
      return await getActivePublicKey(
        request as AntelopeGetActivePublicKeyRequest,
      );

    case 'antelope_signTransaction':
      return String(await signTransaction(request as AntelopeSignatureRequest));

    default:
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new MethodNotFoundError(request.method);
  }
};
