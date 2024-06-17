<script lang="ts">
	import { checkIsFlask, getSnapsProvider } from '$lib/metamask';
	import { onMount } from 'svelte';
	import { snapProvider, isFlask, isMetaMaskReady, snapsDetected, installedSnap } from '$store';
	import type { MetaMaskInpageProvider } from '@metamask/providers';
	import { setSnap, requestSnap } from '$lib/snap';
	import flask_fox from '../assets/flask_fox.svg';
	import CreateAccount from '../components/CreateAccount.svelte';
	import SessionKit, { Chains, Session } from '@wharfkit/session';
	import WebRenderer from '@wharfkit/web-renderer';
	import { type Writable, writable } from 'svelte/store';
	import { TransactPluginResourceProvider } from '@wharfkit/transact-plugin-resource-provider';
	import { WalletPluginMetaMask } from '@wharfkit/wallet-plugin-metamask';

	let provider: MetaMaskInpageProvider;
	const session: Writable<Session | undefined> = writable();

	$: isSnapInstalled = $installedSnap !== null;

	const kit = new SessionKit(
		{
			appName: 'Metamask Snap Demo',
			chains: [Chains.Jungle4],
			ui: new WebRenderer(),
			walletPlugins: [new WalletPluginMetaMask()]
		},
		{
			transactPlugins: [new TransactPluginResourceProvider()]
		}
	);

	onMount(async () => {
		snapProvider.set(await getSnapsProvider());

		if ($snapProvider !== null) {
			provider = $snapProvider; // gotta be a better way of narrowing this type
			isFlask.set(await checkIsFlask(provider));
			setSnap();
		}

		const restored = await kit.restore();
		if (restored) {
			session.set(restored);
		}
	});

	async function login() {
		console.log('calling login');
		const result = await kit.login();
		session.set(result.session);
	}

	async function logout() {
		console.log('calling logout');
		session.set(undefined);
		await kit.logout();
	}

	async function test() {
		if ($session) {
			const action = {
				account: 'eosio.token',
				name: 'transfer',
				authorization: [
					{
						actor: $session.permissionLevel.actor,
						permission: $session.permissionLevel.permission
					}
				],
				data: {
					from: $session.permissionLevel.actor,
					to: 'teamgreymass',
					quantity: '0.0001 EOS',
					memo: 'test with metamask'
				}
			};
			$session.transact({
				actions: [action]
			});
		}
	}
</script>

<p>Snaps detected: {$snapsDetected}</p>
<p>Is flask: {$isFlask}</p>
<p>Is metamask ready: {$isMetaMaskReady}</p>
<p>Is snap installed: {isSnapInstalled}</p>
<!-- <p>Installed snap: {JSON.stringify($installedSnap)}</p> -->

<button on:click={() => requestSnap()} disabled={!$isMetaMaskReady}>
	<img src={flask_fox} alt="Flask Fox" width="20" height="20" />
	{isSnapInstalled ? 'Re-install snap' : 'Install snap'}
</button>

<p>The snap will need to be re-installed after any changes to the code.</p>

{#if isSnapInstalled}
	{#if $session}
		<p>Connected account: {String($session.permissionLevel)}</p>
		<button on:click={test} disabled={!$isMetaMaskReady || !$session}
			>Test Signing Transaction</button
		>
		<button on:click={logout}>Logout</button>
	{:else}
		<button on:click={login} disabled={!$isMetaMaskReady}>Login</button>
	{/if}

	<hr />

	<CreateAccount />
{/if}
