// `dot` is the name we gave to `npx papi add`
import { dot } from '@polkadot-api/descriptors';
import { defineConfig } from '@reactive-dot/core';
import { createLightClientProvider } from '@reactive-dot/core/providers/light-client.js';
import { InjectedWalletProvider } from '@reactive-dot/core/wallets.js';
import { registerDotConnect } from 'dot-connect';

const lightClientProvider = createLightClientProvider();

export const config = defineConfig({
  wallets: [new InjectedWalletProvider()],
  chains: {
    // "polkadot" here can be any unique string value
    polkadot: {
      descriptor: dot,
      provider: lightClientProvider.addRelayChain({ id: 'polkadot' }),
    },
  },
});

registerDotConnect({
  // @ts-expect-error - TODO: fix this
  wallets: config.wallets,
});
