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

import {
  deriveActivePublicKey,
  deriveOwnerPublicKey,
  deriveActivePrivateKey,
} from './lib/keyDeriver';
import {
  AntelopeGetActivePublicKeyRequest,
  AntelopeGetOwnerPublicKeyRequest,
  AntelopeSignatureRequest,
} from './types';

export function chainIdToDefinition(chainId: Checksum256Type): ChainDefinition {
  const index = chainIdsToIndices.get(String(chainId));
  if (!index) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  return Chains[index];
}

export async function getOwnerPublicKey(
  request: AntelopeGetOwnerPublicKeyRequest,
): Promise<string> {
  if (!request.params?.chainId) {
    throw new Error('Missing chainId in request params');
  }
  const chain = chainIdToDefinition(request.params.chainId);

  return String(await deriveOwnerPublicKey(chain));
}

export async function getActivePublicKey(
  request: AntelopeGetActivePublicKeyRequest,
): Promise<string> {
  if (!request.params?.chainId) {
    throw new Error('Missing chainId in request params');
  }
  const chain = chainIdToDefinition(request.params.chainId);

  return String(await deriveActivePublicKey(chain, request.params.keyIndex));
}

const MAX_TRANSACTION_LENGTH = 100_000;

export async function signTransaction(
  request: AntelopeSignatureRequest,
): Promise<Signature | undefined> {
  // Process incoming transaction
  if (!request.params?.transaction) {
    throw new Error('Missing transaction in request params');
  }

  // Check the length of the transaction string
  if (request.params.transaction.length > MAX_TRANSACTION_LENGTH) {
    throw new Error('Transaction data is too large');
  }

  let transactionData;
  try {
    // Attempt to parse the transaction data
    transactionData = JSON.parse(request.params.transaction);
  } catch (error) {
    throw new Error(`Invalid JSON transaction data: ${(error as Error).stack}`);
  }

  let transaction;
  try {
    // Attempt to create a Transaction object from the parsed data
    transaction = Transaction.from(transactionData);
  } catch (error) {
    throw new Error(`Invalid transaction format: ${(error as Error).stack}`);
  }

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
    const privateKey = await deriveActivePrivateKey(
      chain,
      request.params?.keyIndex,
    );
    return privateKey.signDigest(transaction.signingDigest(chain.id));
  }

  return undefined;
}
