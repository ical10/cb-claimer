import './App.css'
import ClaimCard from '@/components/ui/claim-card'
import { config } from '../config'
import { ChainProvider, ReactiveDotProvider } from '@reactive-dot/react'
import { Suspense } from 'react'


function App() {
  return (
    <>
        <ReactiveDotProvider config={config}>
          <ChainProvider chainId="polkadot">
            <Suspense fallback={<div>Loading...</div>}>
              <ClaimCard />
            </Suspense>
          </ChainProvider>
        </ReactiveDotProvider>
    </>
  )
}

export default App
