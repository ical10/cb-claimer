import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

function App() {
  const [isConnected, setIsConnected] = useState(false)

  const handleClick = () => {
    console.log("clicked");
  }

  return (
    <div className='flex flex-col justify-center h-screen'>
      <Card className='w-full max-w-sm mx-auto'>
        <CardHeader className='flex-col gap-2'>
          <CardTitle className='font-unbounded text-2xl'>Child Bounty Claimer</CardTitle>
          <CardDescription className='font-unbounded font-light'>Easily claim your child bounties</CardDescription>
        </CardHeader>
        <CardContent>
          {
            isConnected ? 
          <p>My account: </p> : <Button>Connect</Button>
          }
        </CardContent>
        <CardFooter className='flex-col gap-2'>
          <p>this is the rewards</p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default App
