import { panel, heading, row, text } from '@metamask/snaps-sdk';
import {
  ABI,
  APIClient,
  Checksum256Type,
  Serializer,
  Signature,
  Transaction,
} from '@wharfkit/antelope';
import { ChainDefinition, Chains, chainIdsToIndices } from '@wharfkit/common';

import { derivePrivateKey, derivePublicKey } from './lib/keyDeriver';
import { AntelopeRequest, AntelopeSignatureRequest } from './types';

export function chainIdToDefinition(chainId: Checksum256Type): ChainDefinition {
  const index = chainIdsToIndices.get(String(chainId));
  if (!index) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  return Chains[index];
}

export async function getPublicKey(request: AntelopeRequest): Promise<string> {
  if (!request.params?.chainId) {
    throw new Error('Missing chainId in request params');
  }
  const chain = chainIdToDefinition(request.params.chainId);

  return String(await derivePublicKey(chain));
}

export async function signTransaction(
  request: AntelopeSignatureRequest,
): Promise<Signature | undefined> {
  // Process incoming transaction
  if (!request.params?.transaction) {
    throw new Error('Missing transaction in request params');
  }
  const transaction = Transaction.from(JSON.parse(request.params.transaction));

  // Load the appropriate chain definition
  if (!request.params?.chainId) {
    throw new Error('Missing chainId in request params');
  }
  const chain = chainIdToDefinition(request.params.chainId);

  // Determine the unique contracts used in this transaction
  const contracts = Array.from(
    new Set(transaction.actions.map((action) => String(action.account))),
  );

  // Establish APIClient instance based on chain
  const client = new APIClient({ url: chain.url });

  // Load all ABIs required to decode actions
  const abis: Record<string, ABI> = {};
  for (const contract of contracts) {
    const result = await client.v1.chain.get_abi(contract);
    if (!result.account_name || !result.abi) {
      throw new Error('Failed to load ABI');
    }
    abis[result.account_name] = ABI.from(result.abi);
  }

  // Decode each action in the transaction and add to details
  const details = transaction.actions.map((action, index) => {
    const abi = abis[String(action.account)];
    if (!abi) {
      throw new Error('Missing ABI for contract');
    }
    const decoded = Serializer.decode({
      abi,
      type: String(action.name),
      data: action.data,
    });
    const rows = Object.entries(decoded).map(([key, value]) =>
      row(key, text(String(value))),
    );
    const header = heading(
      `Action ${index + 1}: ${String(action.account)}::${String(action.name)}`,
    );
    return panel([header, panel(rows)]);
  });

  // Request user confirmation of transaction details
  const confirmed = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([heading('Transaction details'), ...details]),
    },
  });

  // If confirmed, sign the transaction
  if (confirmed) {
    const privateKey = await derivePrivateKey(chain);
    return privateKey.signDigest(transaction.signingDigest(chain.id));
  }

  return undefined;
}
