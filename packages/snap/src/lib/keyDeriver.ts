import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import { Bytes, KeyType, PrivateKey } from '@wharfkit/antelope';

import { Chains } from '@wharfkit/common';

// export const chain = Chains.EOS;
export const chain = Chains.Jungle4;

/**
 * Get the key deriver for the given coin type.
 *
 * @returns The key deriver.
 */
async function getKeyDeriver() {
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
 * Derive an Antelope public key from the key tree at the given address index.
 *
 * @param addressIndex - The index of the address to derive.
 * @returns The public key.
 * @throws If the key tree is not initialized.
 */
export async function derivePublicKey(addressIndex = 0) {
  return (await derivePrivateKey(addressIndex)).toPublic();
}

/**
 * Derive an Antelope private key from the key tree at the given address index.
 *
 * @param addressIndex - The index of the address to derive.
 * @returns The private key.
 * @throws If the key tree is not initialized.
 */
export async function derivePrivateKey(addressIndex = 0) {
  const keyDeriver = await getKeyDeriver();
  const derived = await keyDeriver(addressIndex);

  if (!derived.privateKeyBytes) {
    throw new Error('Private key not found');
  }

  return new PrivateKey(KeyType.K1, Bytes.from(derived.privateKeyBytes));
}
