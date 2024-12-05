import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';

import { Bytes, KeyType, PrivateKey, PublicKey } from '@wharfkit/antelope';
import { ChainDefinition } from '@wharfkit/common';

/**
 * Get the key deriver for the given coin type.
 *
 * @returns The key deriver.
 */
async function getKeyDeriver(chain: ChainDefinition) {
  if (!chain.coinType) {
    throw new Error('ChainDefinition does not contain coinType value.');
  }

  const networkNode = await snap.request({
    method: 'snap_getBip44Entropy',
    params: { coinType: chain.coinType },
  });

  return getBIP44AddressKeyDeriver(networkNode);
}

/**
 * Derive an Antelope private key from the key tree at the given address index.
 *
 * @param keyIndex - The index of the key to derive.
 * @returns The private key.
 * @throws If the key tree is not initialized.
 */
async function derivePrivateKey(
  chain: ChainDefinition,
  keyIndex = 1, // default to first active key
): Promise<PrivateKey> {
  const keyDeriver = await getKeyDeriver(chain);
  const derived = await keyDeriver(keyIndex);

  if (!derived.privateKeyBytes) {
    throw new Error('Private key not found');
  }

  return new PrivateKey(KeyType.K1, Bytes.from(derived.privateKeyBytes));
}

/**
 * Derive an Antelope owner public key from the key tree.
 * Always uses index 0 which is reserved for owner permissions.
 *
 * @returns The owner public key.
 * @throws If the key tree is not initialized.
 */
export async function deriveOwnerPublicKey(
  chain: ChainDefinition,
): Promise<PublicKey> {
  return (await deriveOwnerPrivateKey(chain)).toPublic();
}

/**
 * Derive an Antelope active public key from the key tree.
 * Cannot use index 0 which is reserved for owner permissions.
 *
 * @param keyIndex - The index of the address to derive (must not be 0).
 * @returns The active public key.
 * @throws If the key tree is not initialized or if index 0 is used.
 */
export async function deriveActivePublicKey(
  chain: ChainDefinition,
  keyIndex = 1,
): Promise<PublicKey> {
  return (await deriveActivePrivateKey(chain, keyIndex)).toPublic();
}

/**
 * Derive an Antelope owner private key from the key tree.
 * Always uses index 0 which is reserved for owner permissions.
 *
 * @returns The owner private key.
 * @throws If the key tree is not initialized.
 */
export async function deriveOwnerPrivateKey(
  chain: ChainDefinition,
): Promise<PrivateKey> {
  return derivePrivateKey(chain, 0);
}

/**
 * Derive an Antelope active private key from the key tree.
 * Cannot use index 0 which is reserved for owner permissions.
 *
 * @param keyIndex - The index of the address to derive (must not be 0).
 * @returns The active private key.
 * @throws If the key tree is not initialized or if index 0 is used.
 */
export async function deriveActivePrivateKey(
  chain: ChainDefinition,
  keyIndex = 1,
): Promise<PrivateKey> {
  if (Number(keyIndex) > 0) {
    return derivePrivateKey(chain, Number(keyIndex));
  }
  throw new Error('Invalid key index');
}
