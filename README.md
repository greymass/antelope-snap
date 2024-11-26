# @greymass/antelope-snap

This is a Metamask Snap that provides a simple way to interface with [Antelope](https://eosnetwork.com/antelope/) blockchains using a Metamask wallet.

It contains:

- A Metamask Snap that can be installed to provide the ability to interact with Antelope blockchains (at `packages/snap`)
- A simple Svelte Kit application that demonstrates how to use the Metamask Snap (at `packages/site`)

## Prerequisites

To interact with this Snap, you will need to install [MetaMask Flask](https://metamask.io/flask/),
a canary distribution for developers that provides access to upcoming features. You will also need to disable the regular MetaMask extension as having it enabled could interfere with the Flask version.

## Getting Started

```shell
yarn install && yarn start
```
