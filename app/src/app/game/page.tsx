'use client'

import React, { useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChainReaction } from 'my-contracts'
import { GameBoard } from '@/components/GameBoard'
import { NavBar } from '@/components/NavBar'

function GameContent() {
  const searchParams = useSearchParams()
  const address = searchParams.get('address')
  const connectRef = useRef<HTMLDivElement>(null)

  const openConnect = useCallback(() => {
    const btn = connectRef.current?.querySelector('button')
    btn?.click()
  }, [])

  if (!address) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-white">
        <NavBar ref={connectRef} />
        <main className="flex-1 flex flex-col items-center justify-center w-full">
          <p className="text-gray-400">No game address specified.</p>
        </main>
      </div>
    )
  }

  const contractInstance = ChainReaction.at(address)

  return (
    <div className="min-h-screen flex flex-col items-center bg-white">
      <NavBar ref={connectRef} />
      <main className="flex-1 flex flex-col items-center justify-center w-full">
        <GameBoard contractInstance={contractInstance} onConnectRequest={openConnect} />
      </main>
    </div>
  )
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <GameContent />
    </Suspense>
  )
}
