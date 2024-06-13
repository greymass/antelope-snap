import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import {
  Bytes,
  KeyType as AntelopeKeyType,
  PrivateKey,
  PublicKey
} from '@wharfkit/antelope';

/**
 * Get the key deriver for EOS.
 *
 * @param coinType - The SLIP-0044 registered coin type for BIP-0044.
 * @returns The key deriver.
 */
async function getKeyDeriver(coinType: number = 194) {
  const eosNode = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType,
    },
  });

  return getBIP44AddressKeyDeriver(eosNode);
}

/**
 * Derive an Antelope public key from the key tree at the given address index.
 *
 * @param coinType - The SLIP-0044 registered coin type for BIP-0044.
 * @param addressIndex - The index of the address to derive.
 * @returns The public key.
 * @throws If the key tree is not initialized.
 */
export async function derivePublicKey(coinType?: number, addressIndex = 0) {
  const keyDeriver = await getKeyDeriver(coinType);
  const { compressedPublicKeyBytes } = await keyDeriver(addressIndex);

  return PublicKey.from({
    type: 'K1',
    compressed: compressedPublicKeyBytes,
  });
}

/**
 * Derive an Antelope private key from the key tree at the given address index.
 *
 * @param coinType - The SLIP-0044 registered coin type for BIP-0044.
 * @param addressIndex - The index of the address to derive.
 * @returns The private key.
 * @throws If the key tree is not initialized.
 */
export async function derivePrivateKey(coinType?: number, addressIndex = 0) {
  const keyDeriver = await getKeyDeriver(coinType);
  const { privateKeyBytes = undefined } = await keyDeriver(addressIndex);

  if (privateKeyBytes === undefined) {
    return null;
  }

  return new PrivateKey(AntelopeKeyType.K1, Bytes.from(privateKeyBytes));
}
