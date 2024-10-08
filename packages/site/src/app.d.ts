import type {
	EIP6963AnnounceProviderEvent,
	EIP6963RequestProviderEvent,
	MetaMaskInpageProvider
} from '@metamask/providers';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	/*
	 * Window type extension to support ethereum
	 */

	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Window {
		ethereum: MetaMaskInpageProvider & {
			setProvider?: (provider: MetaMaskInpageProvider) => void;
			detected?: MetaMaskInpageProvider[];
			providers?: MetaMaskInpageProvider[];
		};
	}

	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface WindowEventMap {
		'eip6963:requestProvider': EIP6963RequestProviderEvent;
		'eip6963:announceProvider': EIP6963AnnounceProviderEvent;
	}
}

export {};
