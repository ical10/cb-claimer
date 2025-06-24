import './App.css';
import ClaimCard from '@/components/ui/claim-card';
import { config } from '../config';
import { ChainProvider, ReactiveDotProvider } from '@reactive-dot/react';
import { Suspense, useState } from 'react';
import { ConnectionDialog } from 'dot-connect/react.js';

function App() {
  const [walletOpened, setWalletOpened] = useState(false);

  const handleSetWalletOpened = (opened: boolean) => {
    setWalletOpened(opened);
  };

  return (
    <>
      <ReactiveDotProvider config={config}>
        <ChainProvider chainId='polkadot'>
          <Suspense fallback={<div>Loading...</div>}>
            <ConnectionDialog
              open={walletOpened}
              onClose={() => setWalletOpened(false)}
            />
            <ClaimCard onWalletOpen={handleSetWalletOpened} />
          </Suspense>
        </ChainProvider>
      </ReactiveDotProvider>
    </>
  );
}

export default App;
