import { useState, useEffect } from 'react';
import { createClient } from 'polkadot-api';
// TODO: implement smoldot + ws provider
// import { getSmProvider } from 'polkadot-api/sm-provider';
// import { start } from 'polkadot-api/smoldot';
// import { chainSpec as dotChainSpec } from 'polkadot-api/chains/polkadot';
import { dot } from '@polkadot-api/descriptors';
import type { WalletAccount } from '@reactive-dot/core/wallets.js';
import { useMutation } from '@reactive-dot/react';
import { idle, pending, MutationError } from '@reactive-dot/core';
import { getWsProvider } from 'polkadot-api/ws-provider/web';

type ChildBountyData = {
  parentBountyId: number;
  childBountyId: number;
  beneficiary: string;
  amount: string;
  formattedAmount: string;
};

export function useChildBounties(address: string | null) {
  const [childBounties, setChildBounties] = useState<ChildBountyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);

  // State for bounties to claim
  const [bounciesToClaim, setBountiesToClaim] = useState<ChildBountyData[]>([]);

  // Mutation for claiming child bounties
  const [claimState, submitClaim] = useMutation(tx => {
    const calls = bounciesToClaim.map(
      bounty =>
        // @ts-expect-error - Polkadot API type issue
        tx.ChildBounties.claim_child_bounty({
          parent_bounty_id: bounty.parentBountyId,
          child_bounty_id: bounty.childBountyId,
        }).decodedCall
    );

    // @ts-expect-error - Polkadot API type issue
    return tx.Utility.batch({ calls });
  });

  const fetchChildBounties = async (targetAddress: string) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: implement smoldot + ws provider
      // const smoldot = start();
      // const dotChain = smoldot.addChain({ chainSpec: dotChainSpec });
      // const dotClient = createClient(getSmProvider(dotChain));

      const dotClient = createClient(getWsProvider('wss://rpc.polkadot.io'));
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
          childBounty.value.status.value.beneficiary === targetAddress
      );

      console.log('childBountiesForAddress', childBountiesForAddress);

      // Format the data
      const formattedBounties: ChildBountyData[] = childBountiesForAddress.map(
        childBounty => {
          const statusValue = childBounty.value.status.value;
          if (!statusValue || !('beneficiary' in statusValue)) {
            throw new Error('Invalid child bounty status structure');
          }

          const amount = String(childBounty.value.value);
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
        }
      );

      setChildBounties(formattedBounties);

      // Clean up
      dotClient.destroy();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch child bounties'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!address) {
      setChildBounties([]);
      return;
    }

    fetchChildBounties(address);
  }, [address]);

  // Refetch bounties after successful claim
  useEffect(() => {
    const isClaimSuccessful =
      claimState !== idle &&
      claimState !== pending &&
      !(claimState instanceof MutationError);

    if (isClaimSuccessful && address) {
      console.log('Claim successful, refetching bounties...');
      // Clear the bounties that were being claimed
      setBountiesToClaim([]);
      setIsRefetching(true);
      // Add a small delay to ensure blockchain state is updated
      setTimeout(async () => {
        await fetchChildBounties(address);
        setIsRefetching(false);
      }, 2000);
    }
  }, [claimState, address]);

  const claimChildBounties = (
    bounties: ChildBountyData[],
    account: WalletAccount
  ) => {
    console.log('Claiming child bounties:', bounties, 'for account:', account);
    setBountiesToClaim(bounties);
    submitClaim({ signer: account.polkadotSigner });
  };

  return {
    childBounties,
    loading,
    error,
    claimChildBounties,
    claimState,
    isRefetching,
  };
}