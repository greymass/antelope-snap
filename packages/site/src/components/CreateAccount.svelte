<script lang="ts">
	import { getPublicKey } from '$lib/rpc-methods';
	import { onMount } from 'svelte';

	let account = { name: '', publicKey: '' };

	type AccountData = {
		accountName: string;
		activeKey: string;
		ownerKey: string;
		chainId: string;
	};

	async function handleFormSubmit(event: Event) {
		const formData = new FormData(event.target as HTMLFormElement);

		const accountData: AccountData = {
			accountName: formData.get('account') as string,
			activeKey: formData.get('publicKey') as string,
			ownerKey: formData.get('publicKey') as string,
			chainId: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d'
		};

		const name = await createAccount(accountData, 'https://jungle4.greymass.com');

		if (typeof name !== 'undefined') {
			console.log(`Account ${name} created`);
		}
	}

	onMount(async () => {
		const publicKey = await getPublicKey();
		account.publicKey = publicKey;
	});

	async function createAccount(accountData: AccountData, chainUrl: string) {
		const data = {
			accountName: accountData.accountName,
			activeKey: accountData.activeKey,
			ownerKey: accountData.ownerKey,
			network: accountData.chainId
		};

		try {
			const response = await fetch(`${chainUrl}/account/create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			console.log(response);

			if (response.status === 201) {
				console.log('success:', JSON.stringify(await response.text(), null, 2));
				return accountData.accountName;
			}

			console.log('failure:', JSON.stringify(await response.text(), null, 2));
		} catch (error) {
			console.error('error getting response', error);
		}
	}
</script>

<h2>Create Jungle4 Account</h2>
<form on:submit|preventDefault={handleFormSubmit}>
	<div>
		<label for="account">Name:</label>
		<input type="text" id="account" name="account" bind:value={account.name} />
	</div>
	<div>
		<label for="account">PublicKey from Metamask:</label>
		<input readonly type="text" id="account" name="publicKey" bind:value={account.publicKey} />
	</div>
	<button type="submit">Submit</button>
</form>
