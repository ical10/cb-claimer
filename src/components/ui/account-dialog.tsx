import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Accounts } from './accounts';
import type { WalletAccount } from '@reactive-dot/core/wallets.js';
import { truncateAddress } from '../lib/strings';
import { useState } from 'react';

type AccountDialogCloseButtonProps = {
  onAccountChange: (account: WalletAccount) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function AccountDialogCloseButton({
  onAccountChange,
  open,
  setOpen,
}: AccountDialogCloseButtonProps) {
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(
    null
  );

  const handleAccountChange = (account: WalletAccount) => {
    setSelectedAccount(account);
    onAccountChange(account);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {selectedAccount ? (
          <Button variant='outline'>
            {truncateAddress(selectedAccount.address)}
          </Button>
        ) : (
          <Button variant='outline'>Select Account</Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Connected Accounts</DialogTitle>
          <DialogDescription>
            Select your account to check and claim your rewards.
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center justify-center'>
          <Accounts onAccountChange={handleAccountChange} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
