import { useAccounts } from '@reactive-dot/react';
import type { WalletAccount } from '@reactive-dot/core/wallets.js';
import { Button } from '@/components/ui/button';
import { truncateAddress } from '../lib/strings';

type AccountsProps = {
  onAccountChange: (account: WalletAccount) => void;
};

export function Accounts({ onAccountChange }: AccountsProps) {
  const accounts = useAccounts();

  const handleAccountChange = (account: WalletAccount) => {
    onAccountChange(account);
  };

  return (
    <ul className='flex flex-col gap-2 overflow-y-auto scrollbar-hide max-h-60'>
      {!!accounts && accounts.length > 0 ? (
        accounts.map((account, index) => (
          <li key={index}>
            <Button
              variant='outline'
              onClick={() => handleAccountChange(account)}
              className='w-full text-left justify-start'
            >
              {truncateAddress(account.address)}
              <br />
              {account.name}
            </Button>
          </li>
        ))
      ) : (
        <div className='text-center text-muted-foreground py-4'>
          No accounts
        </div>
      )}
    </ul>
  );
}
