import { useAccounts } from '@reactive-dot/react';
import type { WalletAccount } from '@reactive-dot/core/wallets.js';
import { Button } from './button';
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
    <section>
      <ul>
        {!!accounts && accounts.length > 0 ? (
          accounts.map((account, index) => (
            <li key={index}>
              <Button
                variant='outline'
                onClick={() => handleAccountChange(account)}
              >
                {truncateAddress(account.address)}
                <br />
                {account.name}
              </Button>
            </li>
          ))
        ) : (
          <div>No accounts</div>
        )}
      </ul>
    </section>
  );
}
