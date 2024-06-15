import { assert } from '@metamask/snaps-sdk';

import { Session } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';

import { chain, derivePrivateKey, derivePublicKey } from './lib/keyDeriver';
import { ApiClient } from './api';
import { StateManager } from './lib/manageState';
import { makeMockTransaction } from './lib/mockTransfer';
import {
  alertNoAccountFound,
  userConfirmedAccount,
  userConfirmedTransaction,
} from './ui';

export async function connectAccount() {
  const publicKey = await derivePublicKey();
  console.log(publicKey);
  const api = new ApiClient(chain.url);
  const account = await api.fetchAccountByKey(publicKey);
  console.log(JSON.stringify(account));
  console.log(JSON.stringify(chain));

  if (account) {
    const confirmed = await userConfirmedAccount(account.name);
    if (!confirmed) return null;
    const state = new StateManager();
    await state.set({
      account: JSON.stringify(account),
    });
    return account.name;
  } else {
    await alertNoAccountFound(publicKey.toString());
    return null;
  }
}

// TODO: will need params
export async function signTransaction() {
  console.log('signTransaction');
  const api = new ApiClient(chain.url);
  const publicKey = await derivePublicKey();
  const account = await api.fetchAccountByKey(publicKey);

  assert(account, 'Account not found');

  // Will be replaced with actual transaction data from params
  const memo = 'test';
  const transferObject = {
    from: account.name,
    to: 'teamgreymass',
    quantity: '0.1337 EOS',
    memo: memo || 'wharfkit is the best <3',
  };

  const header = await api.getTransactionHeader();
  const transaction = makeMockTransaction(account, header, transferObject); // TODO: will need params
  console.log(JSON.stringify(transaction));

  const confirmed = await userConfirmedTransaction(transferObject);

  if (confirmed) {
    const privateKey = await derivePrivateKey();
    console.log(privateKey);
    assert(privateKey, 'Private key not found');
    const sessionArgs = {
      chain: {
        id: chain.id,
        url: chain.url,
      },
      actor: account.name,
      permission: account.permission,
      walletPlugin: new WalletPluginPrivateKey(privateKey),
    };
    console.log(sessionArgs);
    const session = new Session(sessionArgs);
    console.log(JSON.stringify(session));
    const result = await session.transact(transaction);
    console.log(JSON.stringify(result));
    return String(result);
  }
  return null;
}

export async function getConnectedAccount() {
  const state = new StateManager();
  const account = (await state.getValue('account')) as string;
  if (!account) return null;
  return account;
}
