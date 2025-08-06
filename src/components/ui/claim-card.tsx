import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';
import { Button } from './button';
import { useConnectedWallets, useAccounts } from '@reactive-dot/react';
import { AccountDialogCloseButton } from './account-dialog';
import { useState, useEffect } from 'react';
import type { WalletAccount } from '@reactive-dot/core/wallets.js';
import { truncateAddress } from '@/components/lib/strings';
import { useChildBounties } from '@/components/lib/use-child-bounties';
import { MutationError } from '@reactive-dot/core';
import {
  saveSelectedAccount,
  loadSelectedAccount,
  clearSelectedAccount,
} from '@/components/lib/account-storage';

type ClaimCardProps = {
  onWalletOpen: (opened: boolean) => void;
};

function ClaimCard({ onWalletOpen }: ClaimCardProps) {
  const connectedWallets = useConnectedWallets();
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [isAccountFromStorage, setIsAccountFromStorage] = useState(false);

  const accounts = useAccounts();

  const {
    childBounties,
    loading,
    error,
    claimChildBounties,
    claimState,
    isRefetching,
  } = useChildBounties(selectedAccount?.address || null);

  useEffect(() => {
    if (connectedWallets.length > 0 && accounts.length > 0) {
      const storedAccount = loadSelectedAccount(accounts);
      if (storedAccount) {
        setSelectedAccount(storedAccount);
        setIsAccountFromStorage(true);
        console.log('Loaded account from storage:', storedAccount.name);
      }
    }
  }, [connectedWallets, accounts]);

  useEffect(() => {
    if (connectedWallets.length === 0 && selectedAccount) {
      setSelectedAccount(null);
      clearSelectedAccount();
      setIsAccountFromStorage(false);
      console.log('Wallets disconnected, cleared stored account');
    }
  }, [connectedWallets, selectedAccount]);

  const handleAccountChange = (account: WalletAccount) => {
    setSelectedAccount(account);
    saveSelectedAccount(account);
    setIsAccountFromStorage(false);
  };

  const handleDisconnectWallet = () => {
    onWalletOpen(true);
    setOpen(false);
    setSelectedAccount(null);
    clearSelectedAccount();
    setIsAccountFromStorage(false);
  };

  return (
    <div className='flex flex-col justify-center min-h-screen p-4'>
      <Card className='w-full max-w-2xl mx-auto'>
        <CardHeader className='flex-col gap-2 text-center'>
          <CardTitle className='font-unbounded text-2xl'>
            Child Bounty Claimer
          </CardTitle>
          <CardDescription className='font-unbounded font-light text-muted-foreground'>
            Easily claim your child bounties
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col space-y-4 w-sm mx-auto'>
          <Button onClick={handleDisconnectWallet}>
            {connectedWallets.length > 0
              ? 'Disconnect Wallet'
              : 'Connect Wallet'}
          </Button>
          {connectedWallets.length > 0 && (
            <AccountDialogCloseButton
              onAccountChange={handleAccountChange}
              open={open}
              setOpen={setOpen}
              selectedAccount={selectedAccount}
            />
          )}
          {selectedAccount && (
            <div className='text-center p-2 bg-muted/50 rounded-md'>
              <div className='flex items-center justify-center gap-1 mb-1'>
                <p className='text-sm text-muted-foreground'>
                  Selected Account:
                </p>
                {isAccountFromStorage && (
                  <span className='text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full'>
                    Auto-loaded
                  </span>
                )}
              </div>
              <p className='text-sm font-medium'>{selectedAccount.name}</p>
              <p className='text-xs text-muted-foreground'>
                {truncateAddress(selectedAccount.address)}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className='flex-col gap-2 text-center'>
          {!selectedAccount ? (
            <p className='text-sm text-muted-foreground'>
              Connect wallet and select account to view rewards
            </p>
          ) : loading && !isRefetching ? (
            <p className='text-sm text-muted-foreground'>
              Loading child bounties...
            </p>
          ) : error ? (
            <p className='text-sm text-red-500'>Error: {error}</p>
          ) : childBounties.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No pending child bounties found
            </p>
          ) : (
            <div className='w-full space-y-2'>
              <p className='text-sm text-muted-foreground mb-2'>
                Pending Child Bounties ({childBounties.length})
              </p>
              {childBounties.map((bounty, index) => (
                <Card key={index} className='text-left p-3 bg-muted/50'>
                  <div className='space-y-1'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>
                        Bounty {bounty.parentBountyId} / Child{' '}
                        {bounty.childBountyId}
                      </span>
                      <span className='text-sm font-bold text-green-600'>
                        {bounty.formattedAmount} DOT
                      </span>
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      Beneficiary: {truncateAddress(bounty.beneficiary)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {selectedAccount && childBounties.length > 0 && !loading && (
            <>
              <Button
                onClick={() =>
                  claimChildBounties(childBounties, selectedAccount)
                }
                disabled={
                  claimState &&
                  typeof claimState === 'object' &&
                  'type' in claimState &&
                  claimState.type === 'signed'
                }
              >
                {claimState &&
                typeof claimState === 'object' &&
                'type' in claimState &&
                claimState.type === 'signed'
                  ? 'Claiming...'
                  : 'Claim Child Bounties'}
              </Button>

              {/* Show claim status */}
              {claimState &&
                typeof claimState === 'object' &&
                'type' in claimState &&
                claimState.type === 'signed' && (
                  <p className='text-sm text-blue-600'>
                    Transaction pending...
                  </p>
                )}
              {claimState instanceof MutationError && (
                <p className='text-sm text-red-500'>
                  Claim failed: {claimState.message || 'Unknown error'}
                </p>
              )}
              {claimState &&
                typeof claimState === 'object' &&
                !(claimState instanceof MutationError) &&
                'type' in claimState &&
                claimState.type === 'finalized' && (
                  <p className='text-sm text-green-600'>
                    Claims submitted successfully!
                  </p>
                )}

              {/* Show refetching status */}
              {isRefetching && (
                <p className='text-sm text-blue-600'>Updating bounty list...</p>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default ClaimCard;
