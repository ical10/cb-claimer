import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { Button } from './button'
import { useConnectedWallets, useWalletDisconnector, useWallets, useWalletConnector } from '@reactive-dot/react'
import { useEffect, useState } from 'react'

function ClaimCard() {
  const connectedWallets = useConnectedWallets()
  const wallets = useWallets()

  const [selectedWallet, setSelectedWallet] = useState<typeof wallets[0] | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, connectWallet] = useWalletConnector()
  const [__, disconnectWallet] = useWalletDisconnector()

  const handleConnect = (wallet: typeof selectedWallet) => {
    setSelectedWallet(wallet)
    if (wallet){
      connectWallet(wallet)
    }
  }

  const handleDisconnect = (wallet: typeof selectedWallet) => {
    setSelectedWallet(null)
    if (wallet){
      disconnectWallet(wallet)
    }
  }


  return (
    <div className='flex flex-col justify-center h-screen p-4'>
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader className='flex-col gap-2 text-center'>
          <CardTitle className='font-unbounded text-2xl'>Child Bounty Claimer</CardTitle>
          <CardDescription className='font-unbounded font-light text-muted-foreground'>
            Easily claim your child bounties
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
        <section>
      <header>
        <h3>Wallet connection</h3>
      </header>
      <article>
        <h4>Wallets</h4>
        <ul>
          {wallets.map((wallet) => (
            <li key={wallet.id}>
              <div>{wallet.name}</div>
              <div>
                {selectedWallet ? (
                  <Button variant="destructive" className="font-medium" onClick={() => handleDisconnect(wallet)}>
                    Disconnect
                  </Button>
                ) : (
                  <Button variant="default" className="font-medium" onClick={() => handleConnect(wallet)}>
                    Connect
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section> 
        </CardContent>
        <CardFooter className='flex-col gap-2 text-center'>
          <p className='text-sm text-muted-foreground'>Rewards will appear here</p>
        </CardFooter>
      </Card>
    </div>
   )
}

export default ClaimCard
