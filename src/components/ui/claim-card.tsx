import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';
import { Button } from './button';
import { useConnectedWallets } from '@reactive-dot/react';
import { AccountDialogCloseButton } from './account-dialog';
import { useState } from 'react';
import type { WalletAccount } from '@reactive-dot/core/wallets.js';
import { truncateAddress } from '@/components/lib/strings';

type ClaimCardProps = {
  onWalletOpen: (opened: boolean) => void;
};

function ClaimCard({ onWalletOpen }: ClaimCardProps) {
  const connectedWallets = useConnectedWallets();
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(
    null
  );
  const [open, setOpen] = useState(false);

  const handleAccountChange = (account: WalletAccount) => {
    setSelectedAccount(account);
  };

  return (
    <div className='flex flex-col justify-center h-screen p-4'>
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader className='flex-col gap-2 text-center'>
          <CardTitle className='font-unbounded text-2xl'>
            Child Bounty Claimer
          </CardTitle>
          <CardDescription className='font-unbounded font-light text-muted-foreground'>
            Easily claim your child bounties
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col space-y-4 w-sm mx-auto'>
          <Button onClick={() => onWalletOpen(true)}>
            {connectedWallets.length > 0
              ? 'Disconnect Wallet'
              : 'Connect Wallet'}
          </Button>
          <AccountDialogCloseButton
            onAccountChange={handleAccountChange}
            open={open}
            setOpen={setOpen}
          />
        </CardContent>
        <CardFooter className='flex-col gap-2 text-center'>
          <p className='text-sm text-muted-foreground'>
            Rewards will appear here
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ClaimCard;
