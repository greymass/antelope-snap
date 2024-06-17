import { Chains } from '@wharfkit/common';
import { invokeSnap } from './snap';

export async function getPublicKey(): Promise<string> {
	return (await invokeSnap({
		method: 'antelope_getPublicKey',
		params: { chainId: String(Chains.Jungle4.id) }
	})) as string;
}
