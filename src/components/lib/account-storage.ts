import type { WalletAccount } from '@reactive-dot/core/wallets.js';

const STORAGE_KEY = 'cb-claimer-selected-account';
const EXPIRATION_HOURS = 6;

type StoredAccount = {
  accountId: string;
  timestamp: number;
};

export function saveSelectedAccount(account: WalletAccount): void {
  const storedData: StoredAccount = {
    accountId: account.id,
    timestamp: Date.now(),
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
  } catch (error) {
    console.warn('Failed to save account to localStorage:', error);
  }
}

export function loadSelectedAccount(availableAccounts: WalletAccount[] = []): WalletAccount | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const storedData: StoredAccount = JSON.parse(stored);
    const now = Date.now();
    const expirationTime = storedData.timestamp + (EXPIRATION_HOURS * 60 * 60 * 1000);

    if (now > expirationTime) {
      console.log('Stored account expired, removing from localStorage');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (!storedData.accountId) {
      console.warn('Invalid stored account data, removing from localStorage');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const foundAccount = availableAccounts.find(account => account.id === storedData.accountId);
    
    if (!foundAccount) {
      return null;
    }

    return foundAccount;
  } catch (error) {
    console.warn('Failed to load account from localStorage:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearSelectedAccount(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear account from localStorage:', error);
  }
}

export function isAccountStored(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    const storedData: StoredAccount = JSON.parse(stored);
    const now = Date.now();
    const expirationTime = storedData.timestamp + (EXPIRATION_HOURS * 60 * 60 * 1000);

    return now <= expirationTime && !!storedData.accountId;
  } catch (error) {
    console.warn('Failed to check if account is stored:', error);
    return false;
  }
}