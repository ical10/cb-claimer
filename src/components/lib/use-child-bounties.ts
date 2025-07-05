import { useState, useEffect } from 'react';
import { createClient, type PolkadotSigner } from 'polkadot-api';
import { getSmProvider } from 'polkadot-api/sm-provider';
import { start } from 'polkadot-api/smoldot';
import { chainSpec as dotChainSpec } from 'polkadot-api/chains/polkadot';
import { dot } from '@polkadot-api/descriptors';
import type { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer';

type ChildBountyData = {
  parentBountyId: number;
  childBountyId: number;
  beneficiary: string;
  amount: string;
  formattedAmount: string;
};

type ClaimChildBountyArgs = {
  parentBountyId: number;
  childBountyId: number;
};

export function useChildBounties(address: string | null) {
  const [childBounties, setChildBounties] = useState<ChildBountyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setChildBounties([]);
      return;
    }

    const fetchChildBounties = async () => {
      setLoading(true);
      setError(null);

      try {
        // Start smoldot and setup its chains
        const smoldot = start();
        const dotChain = smoldot.addChain({ chainSpec: dotChainSpec });

        // Create the clients and their typedApis
        const dotClient = createClient(getSmProvider(dotChain));
        const dotApi = dotClient.getTypedApi(dot);

        // Wait until we have received the initial block
        await dotApi.compatibilityToken;

        const decimals = 10;

        // Fetch bounties
        const bounties = await dotApi.query.Bounties.Bounties.getEntries();
        const bountyIds = bounties.map(bounty => bounty.keyArgs[0]);

        // Fetch child bounties
        const childBountiesResult =
          await dotApi.query.ChildBounties.ChildBounties.getEntries({
            at: 'best',
          });

        // Filter child bounties for the given address
        const filteredChildBounties = childBountiesResult.filter(childBounty =>
          bountyIds.includes(childBounty.keyArgs[0])
        );

        const childBountiesForAddress = filteredChildBounties.filter(
          childBounty =>
            childBounty.value.status.type === 'PendingPayout' &&
            childBounty.value.status.value &&
            'beneficiary' in childBounty.value.status.value &&
            childBounty.value.status.value.beneficiary === address
        );

        // Format the data
        const formattedBounties: ChildBountyData[] =
          childBountiesForAddress.map(childBounty => {
            const statusValue = childBounty.value.status.value;

            if (!statusValue || !('beneficiary' in statusValue)) {
              throw new Error('Invalid child bounty status structure');
            }

            const rewardValue = childBounty.value.value;

            const amount = String(rewardValue);
            const formattedAmount = (
              Number(amount) / Math.pow(10, decimals)
            ).toFixed(4);

            return {
              parentBountyId: childBounty.keyArgs[0],
              childBountyId: childBounty.keyArgs[1],
              beneficiary: statusValue.beneficiary,
              amount,
              formattedAmount,
            };
          });

        setChildBounties(formattedBounties);

        // Clean up
        dotClient.destroy();
        await smoldot.terminate();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch child bounties'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChildBounties();
  }, [address]);

  const claimChildBounties = async (
    childBountyIdxs: ClaimChildBountyArgs[],
    account: InjectedPolkadotAccount
  ) => {
    // Start smoldot and setup its chains
    const smoldot = start();
    const dotChain = smoldot.addChain({ chainSpec: dotChainSpec });

    // Create the clients and their typedApis
    const dotClient = createClient(getSmProvider(dotChain));
    const dotApi = dotClient.getTypedApi(dot);

    try {
      // Wait until we have received the initial block
      await dotApi.compatibilityToken;

      const claimCalls = await Promise.all(
        childBountyIdxs.map(idx =>
          dotApi.tx.ChildBounties.claim_child_bounty({
            parent_bounty_id: idx.parentBountyId,
            child_bounty_id: idx.childBountyId,
          })
        )
      );

      const batchCall = await dotApi.tx.Utility.batch({
        calls: claimCalls.map(call => call.decodedCall),
      });

      const signed = await batchCall.signAndSubmit(account.polkadotSigner);
      console.log(signed);

      dotClient.destroy();
      await smoldot.terminate();
    } catch (err) {
      // Ignore error when user cancel signing
      if (err instanceof Error && err.message === 'Cancelled') {
        return;
      }

      setError(
        err instanceof Error ? err.message : 'Failed to claim child bounties'
      );
    } finally {
      setLoading(false);
    }
  };

  return { claimChildBounties, childBounties, loading, error };
}
